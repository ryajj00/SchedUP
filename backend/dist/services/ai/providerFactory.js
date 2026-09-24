"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAIProvider = createAIProvider;
const aiProvider_1 = require("./aiProvider");
const mockProvider_1 = require("./mockProvider");
const openaiProvider_1 = require("./openaiProvider");
function createAIProvider() {
    const configuredProvider = process.env.AI_PROVIDER ?? 'mock';
    if (!aiProvider_1.PROVIDER_NAMES.includes(configuredProvider)) {
        throw new Error(`Unsupported AI_PROVIDER "${configuredProvider}". Expected one of: ${aiProvider_1.PROVIDER_NAMES.join(', ')}.`);
    }
    switch (configuredProvider) {
        case 'mock':
            return new mockProvider_1.MockProvider();
        case 'openai':
            return new openaiProvider_1.OpenAIProvider();
        case 'claude':
            throw new Error('The claude provider is not implemented yet. Use AI_PROVIDER=openai or mock.');
    }
}
