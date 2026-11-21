import { writeFileSync } from "node:fs";
import { join } from "node:path";

/** Dummy model so omp RPC starts without a real provider login. */
export const TEST_MODEL = "test/dummy";

export function writeTestModels(agentDir) {
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
