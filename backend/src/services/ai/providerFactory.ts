import { AIProvider, ProviderName, PROVIDER_NAMES } from './aiProvider';
import { MockProvider } from './mockProvider';
import { OpenAIProvider } from './openaiProvider';

export function createAIProvider(): AIProvider {
  const configuredProvider = process.env.AI_PROVIDER ?? 'mock';
  if (!PROVIDER_NAMES.includes(configuredProvider as ProviderName)) {
    throw new Error(`Unsupported AI_PROVIDER "${configuredProvider}". Expected one of: ${PROVIDER_NAMES.join(', ')}.`);
  }

  switch (configuredProvider as ProviderName) {
    case 'mock':
      return new MockProvider();
    case 'openai':
      return new OpenAIProvider();
    case 'claude':
      throw new Error('The claude provider is not implemented yet. Use AI_PROVIDER=openai or mock.');
  }
}
