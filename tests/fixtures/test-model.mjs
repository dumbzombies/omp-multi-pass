import { writeFileSync } from "node:fs";
import { join } from "node:path";

/** Dummy model so pi / pi-bolt / omp RPC starts without a real provider login. */
export const TEST_MODEL = "test/dummy";

const MODEL = {
	id: "dummy",
	name: "Dummy",
	reasoning: false,
	input: ["text"],
	cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
	contextWindow: 8192,
	maxTokens: 1024,
};

export function writeTestModels(agentDir) {
	// pi and pi-bolt read models.json; omp reads models.yml.
	writeFileSync(
		join(agentDir, "models.json"),
		JSON.stringify({
			providers: {
				test: {
					baseUrl: "http://127.0.0.1:1/v1",
					api: "openai-completions",
					apiKey: "dummy",
					models: [MODEL],
				},
			},
		}, null, 2),
	);
	writeFileSync(
		join(agentDir, "models.yml"),
		[
			"providers:",
			"  test:",
			"    baseUrl: http://127.0.0.1:1/v1",
			"    api: openai-completions",
			"    apiKey: dummy",
			"    models:",
			"      - id: dummy",
			"        name: Dummy",
			"        contextWindow: 8192",
			"        maxTokens: 1024",
			"        reasoning: false",
			"        input:",
			"          - text",
			"",
		].join("\n"),
	);
}
