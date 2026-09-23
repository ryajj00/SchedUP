export interface AIProvider {
  extractScheduleFromImage(image: string): Promise<unknown>;
}

export const PROVIDER_NAMES = ['mock', 'openai', 'claude'] as const;
export type ProviderName = (typeof PROVIDER_NAMES)[number];
