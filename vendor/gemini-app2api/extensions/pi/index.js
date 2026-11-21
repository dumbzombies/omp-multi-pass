import * as piAi from '@earendil-works/pi-ai';
import { registerGeminiAppExtension } from './provider.js';
import {
  defaultGetCurrentSystemPrompt,
  defaultGetCurrentTools,
  defaultToToolDeclaration,
} from './transcript.js';

// oh-my-pi / older pi-ai builds do not export these transcript helpers. The
// extension's own defaults implement the same contract, so use them when the
// host does not provide an override.
export default function (pi) {
  registerGeminiAppExtension(pi, {
    createProvider: piAi.createProvider,
    createAssistantMessageEventStream: piAi.createAssistantMessageEventStream,
    getCurrentSystemPrompt: piAi.getCurrentSystemPrompt ?? defaultGetCurrentSystemPrompt,
    getCurrentTools: piAi.getCurrentTools ?? defaultGetCurrentTools,
    toToolDeclaration: piAi.toToolDeclaration ?? defaultToToolDeclaration,
  });
}
