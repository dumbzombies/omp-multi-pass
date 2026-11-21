import type { OpenRouterModel } from "./models.ts";

export const KILO_API_BASE = process.env.KILO_API_URL || "https://api.kilo.ai";
export const KILO_GATEWAY_BASE = `${KILO_API_BASE}/api/gateway`;
const KILO_PROFILE_ENDPOINT = `${KILO_API_BASE}/api/profile`;
export const KILO_ORG_HEADER = "X-KiloCode-OrganizationId";
const MODELS_FETCH_TIMEOUT_MS = 10_000;
const USAGE_FETCH_TIMEOUT_MS = 10_000;

export interface KiloAccess {
	token: string;
	organizationId?: string;
}

export function withOrganizationHeader(
	headers: Record<string, string>,
	organizationId?: string,
): Record<string, string> {
	if (!organizationId) return headers;
	return { ...headers, [KILO_ORG_HEADER]: organizationId };
}

export interface KiloModelCatalogRequest {
	token?: string;
	organizationId?: string;
}

export async function fetchKiloModelCatalog(request: KiloModelCatalogRequest = {}): Promise<OpenRouterModel[]> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"User-Agent": "pi-kilo-provider",
	};
	if (request.token) {
		headers.Authorization = `Bearer ${request.token}`;
	}
	const { organizationId } = request;
	const modelsUrl = organizationId
		? `${KILO_API_BASE}/api/organizations/${encodeURIComponent(organizationId)}/models`
		: `${KILO_GATEWAY_BASE}/models`;

	const response = await fetch(modelsUrl, {
		headers: withOrganizationHeader(headers, organizationId),
		signal: AbortSignal.timeout(MODELS_FETCH_TIMEOUT_MS),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
	}

	const json = (await response.json()) as { data?: OpenRouterModel[] };
	if (!json.data || !Array.isArray(json.data)) {
		throw new Error("Invalid models response: missing data array");
	}

	return json.data;
}

export interface KiloOrganization {
	id: string;
	name: string;
	role?: string;
}

export interface KiloProfile {
	user?: { email?: string; name?: string };
	email?: string;
	name?: string;
	organizations?: KiloOrganization[];
}

export async function fetchKiloProfile(token: string): Promise<KiloProfile> {
	const response = await fetch(KILO_PROFILE_ENDPOINT, {
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch Kilo profile: ${response.status}`);
	}

	return (await response.json()) as KiloProfile;
}

interface KiloBalance {
	balance?: number;
}

export type KiloUsageFetchPeriod = "week" | "month" | "year" | "all";

interface BaseUsageRow {
	date: string;
	total_cost: number;
}

function isUsageRow(value: unknown): value is BaseUsageRow & Record<string, unknown> {
	if (typeof value !== "object" || value === null) return false;
	if (!("date" in value) || typeof value.date !== "string") return false;
	return "total_cost" in value && typeof value.total_cost === "number";
}

function usageNumber(value: unknown): number {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export interface KiloUsageEntry {
	date: string;
	totalCostMicrodollars: number;
	model?: string;
	totalInputTokens?: number;
	totalOutputTokens?: number;
	totalCacheWriteTokens?: number;
	totalCacheHitTokens?: number;
}

export interface KiloUsageRequestOptions {
	groupByModel?: boolean;
	signal?: AbortSignal;
}

function isIsoDate(value: unknown): value is string {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T00:00:00.000Z`);
	return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

export async function fetchKiloUsageEntries(
	access: KiloAccess,
	period: KiloUsageFetchPeriod,
	options: KiloUsageRequestOptions = {},
): Promise<KiloUsageEntry[] | null> {
	try {
		const viewType = access.organizationId ?? "personal";
		const query = new URLSearchParams({ period, viewType });
		if (options.groupByModel) query.set("groupByModel", "true");
		const timeout = AbortSignal.timeout(USAGE_FETCH_TIMEOUT_MS);
		const signal = options.signal ? AbortSignal.any([timeout, options.signal]) : timeout;
		const response = await fetch(`${KILO_PROFILE_ENDPOINT}/usage?${query}`, {
			headers: withOrganizationHeader({ Authorization: `Bearer ${access.token}` }, access.organizationId),
			signal,
		});
		if (!response.ok) return null;

		const data = (await response.json()) as { usage?: unknown };
		if (!Array.isArray(data.usage)) return null;

		return data.usage.flatMap((entry): KiloUsageEntry[] => {
			if (!isUsageRow(entry)) return [];
			if (!isIsoDate(entry.date) || !Number.isFinite(entry.total_cost)) return [];
			if (!options.groupByModel) return [{ date: entry.date, totalCostMicrodollars: entry.total_cost }];
			return [
				{
					date: entry.date,
					totalCostMicrodollars: entry.total_cost,
					model: typeof entry.model === "string" ? entry.model : "Unknown model",
					totalInputTokens: usageNumber(entry.total_input_tokens),
					totalOutputTokens: usageNumber(entry.total_output_tokens),
					totalCacheWriteTokens: usageNumber(entry.total_cache_write_tokens),
					totalCacheHitTokens: usageNumber(entry.total_cache_hit_tokens),
				},
			];
		});
	} catch {
		return null;
	}
}

export async function fetchKiloBalance(token: string, organizationId?: string): Promise<number | null> {
	try {
		const response = await fetch(`${KILO_PROFILE_ENDPOINT}/balance`, {
			headers: withOrganizationHeader(
				{
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				organizationId,
			),
		});

		if (!response.ok) {
			return null;
		}

		const data = (await response.json()) as KiloBalance;
		return data.balance ?? null;
	} catch {
		return null;
	}
}
