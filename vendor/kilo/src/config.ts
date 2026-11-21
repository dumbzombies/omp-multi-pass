import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const KILO_USAGE_PERIODS = ["day", "week", "month", "year"] as const;
export type KiloUsageDisplayPeriod = (typeof KILO_USAGE_PERIODS)[number];


export type KiloPreferences = {
	display?: { showForOtherProviders?: boolean };
	footer?: { custom?: boolean };
	credits?: { enabled?: boolean };
	usage?: { periods?: KiloUsageDisplayPeriod[] };
};

export type ResolvedKiloPreferences = {
	display: { showForOtherProviders: boolean };
	footer: { custom: boolean };
	credits: { enabled: boolean };
	usage: { periods: KiloUsageDisplayPeriod[] };
};

const CONFIG_DIRECTORY = "kilo-pi-provider";
const DEFAULT_PREFERENCES: ResolvedKiloPreferences = {
	display: { showForOtherProviders: false },
	footer: { custom: true },
	credits: { enabled: true },
	usage: { periods: [] },
};

function isUsagePeriod(value: string): value is KiloUsageDisplayPeriod {
	return KILO_USAGE_PERIODS.some((period) => period === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readKiloPreferences(path: string): KiloPreferences {
	if (!existsSync(path)) return {};
	try {
		const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
		if (!isRecord(parsed)) return {};
		// Validate sections separately so one malformed section does not discard valid siblings.
		const display = isRecord(parsed.display) && typeof parsed.display.showForOtherProviders === "boolean"
			? { showForOtherProviders: parsed.display.showForOtherProviders }
			: undefined;
		const footer = isRecord(parsed.footer) && typeof parsed.footer.custom === "boolean"
			? { custom: parsed.footer.custom }
			: undefined;
		const credits = isRecord(parsed.credits) && typeof parsed.credits.enabled === "boolean"
			? { enabled: parsed.credits.enabled }
			: undefined;
		const rawPeriods = isRecord(parsed.usage) ? parsed.usage.periods : undefined;
		const periods = Array.isArray(rawPeriods) && rawPeriods.every(isUsagePeriod)
			? rawPeriods
			: undefined;
		return { display, footer, credits, usage: periods ? { periods } : undefined };
	} catch {
		return {};
	}
}

function getConfigPath(root: string): string {
	return join(root, "extensions", CONFIG_DIRECTORY, "config.json");
}

function environmentBoolean(value: string | undefined, defaultValue: boolean): boolean | undefined {
	if (value === undefined) return undefined;
	const normalized = value.trim().toLowerCase();
	if (normalized === "") return undefined;
	if (["1", "true", "yes"].includes(normalized)) return true;
	if (["0", "false", "no"].includes(normalized)) return false;
	return defaultValue;
}

function environmentUsagePeriods(value: string | undefined): KiloUsageDisplayPeriod[] | undefined {
	if (value === undefined) return undefined;
	const normalized = value.trim().toLowerCase();
	if (normalized === "") return undefined;
	if (["1", "true", "yes"].includes(normalized)) return ["day"];
	if (["0", "false", "no"].includes(normalized)) return [];
	const periods = normalized
		.split(",")
		.map((period) => period.trim())
		.filter(Boolean);
	return periods.length > 0 && periods.every(isUsagePeriod) ? [...new Set(periods)] : [];
}

export function getEnvironmentPreferences(environment: NodeJS.ProcessEnv = process.env): KiloPreferences {
	return {
		display: {
			showForOtherProviders: environmentBoolean(environment.KILO_PI_SHOW_FOR_OTHER_PROVIDERS, false),
		},
		footer: { custom: environmentBoolean(environment.KILO_PI_CUSTOM_FOOTER, true) },
		credits: { enabled: environmentBoolean(environment.KILO_PI_SHOW_CREDITS, true) },
		usage: { periods: environmentUsagePeriods(environment.KILO_PI_USAGE) },
	};
}

export function mergeKiloPreferences(
	global: KiloPreferences,
	project: KiloPreferences | undefined,
	environment: KiloPreferences,
): ResolvedKiloPreferences {
	return {
		display: {
			showForOtherProviders:
				environment.display?.showForOtherProviders ??
				project?.display?.showForOtherProviders ??
				global.display?.showForOtherProviders ??
				DEFAULT_PREFERENCES.display.showForOtherProviders,
		},
		footer: {
			custom:
				environment.footer?.custom ??
				project?.footer?.custom ??
				global.footer?.custom ??
				DEFAULT_PREFERENCES.footer.custom,
		},
		credits: {
			enabled:
				environment.credits?.enabled ??
				project?.credits?.enabled ??
				global.credits?.enabled ??
				DEFAULT_PREFERENCES.credits.enabled,
		},
		usage: {
			periods:
				environment.usage?.periods ??
				project?.usage?.periods ??
				global.usage?.periods ??
				DEFAULT_PREFERENCES.usage.periods,
		},
	};
}

export function loadKiloPreferences(options: {
	agentDirectory?: string;
	cwd: string;
	projectTrusted: boolean;
	environment?: NodeJS.ProcessEnv;
}): ResolvedKiloPreferences {
	const agentDirectory = options.agentDirectory ?? process.env.PI_CODING_AGENT_DIR ?? join(homedir(), ".pi", "agent");
	const global = readKiloPreferences(getConfigPath(agentDirectory));
	const project = options.projectTrusted ? readKiloPreferences(getConfigPath(join(options.cwd, ".pi"))) : undefined;
	return mergeKiloPreferences(global, project, getEnvironmentPreferences(options.environment));
}
