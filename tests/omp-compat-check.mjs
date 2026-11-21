import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const agentDir = mkdtempSync(join(tmpdir(), "omp-multi-pass-"));
process.env.PI_CODING_AGENT_DIR = agentDir;
writeFileSync(join(agentDir, "multi-pass.json"), JSON.stringify({
	subscriptions: [],
	pools: [],
	chains: [],
	presets: [],
}));

const commands = new Map();
const providers = new Map();
const noop = () => {};
const pi = new Proxy({}, {
	get(_target, prop) {
		if (prop === "registerCommand") return (name, config) => commands.set(name, config);
		if (prop === "registerProvider") return (name, config) => {
			if (typeof name === "object" && name) providers.set(name.id, name);
			else providers.set(name, config);
		};
		if (prop === "unregisterProvider") return (name) => providers.delete(name);
		if (prop === "on") return noop;
		return noop;
	},
});

const mod = await import("../extensions/multi-sub.ts");
mod.default(pi);

assert.ok(commands.has("subs"), "/subs registered");

// oh-my-pi shape: modelRegistry has no authStorage and no runtime.logout.
const notes = [];
const ctx = {
	cwd: agentDir,
	model: undefined,
	modelRegistry: {
		getAll: () => [],
		getAvailable: () => [],
		getProviderAuthStatus: () => ({ configured: false }),
		getProvider: () => undefined,
		getProviderDisplayName: (provider) => provider,
		getRegisteredProviderConfig: () => undefined,
		getRegisteredNativeProvider: () => undefined,
		find: () => undefined,
	},
	ui: {
		notify: (message, level) => notes.push({ message, level }),
		setStatus: noop,
		select: async () => undefined,
		input: async () => undefined,
		confirm: async () => false,
		custom: async () => undefined,
		editor: async () => undefined,
	},
	getContextUsage: () => undefined,
	isIdle: () => true,
	hasUI: true,
};

await commands.get("subs").handler("list", ctx);
assert.ok(notes.length > 0, "list produced a notification");
assert.doesNotMatch(JSON.stringify(notes), /hasAuth is not a function/);

// A truthy but outdated authStorage object must not be trusted either.
notes.length = 0;
const staleCtx = {
	...ctx,
	modelRegistry: { ...ctx.modelRegistry, authStorage: { get: () => undefined } },
};
await commands.get("subs").handler("list", staleCtx);
assert.ok(notes.length > 0, "stale authStorage list produced a notification");
assert.doesNotMatch(JSON.stringify(notes), /hasAuth is not a function/);

// Gemini App subscription is registered from the bundled catalog.
writeFileSync(join(agentDir, "multi-pass.json"), JSON.stringify({
	subscriptions: [{ provider: "gemini-app", index: 1, label: "gem" }],
	pools: [],
	chains: [],
	presets: [],
}));
mod.default(pi);
const registered = providers.get("gemini-app-1");
assert.ok(registered, "gemini-app-1 registered");
assert.deepEqual(registered.models.map((m) => m.id), [
	"gemini-neon",
	"gemini-hydrogen",
	"gemini-flash-lite",
	"gemini-auto",
]);
assert.equal(registered.api, "gemini-app-api");
assert.equal(registered.baseUrl, "https://robinfrontend-pa.googleapis.com");
assert.equal(typeof registered.streamSimple, "function");
assert.equal(typeof registered.oauth.login, "function");
assert.equal(typeof registered.oauth.refreshToken, "function");

// Bundled Gemini App extension registers the base provider and quota command.
const gemini = await import("../vendor/gemini-app2api/extensions/pi/index.js");
gemini.default(pi);
const baseProvider = providers.get("gemini-app");
assert.ok(baseProvider, "gemini-app base provider registered");
assert.deepEqual(baseProvider.getModels().map((m) => m.id), [
	"gemini-neon",
	"gemini-hydrogen",
	"gemini-flash-lite",
	"gemini-auto",
]);
assert.equal(typeof baseProvider.streamSimple, "function");
assert.equal(typeof baseProvider.auth.oauth.login, "function");
assert.ok(commands.has("gemini-quota"), "/gemini-quota registered");

console.log("omp compatibility checks passed");
