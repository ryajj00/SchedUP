import { AIProvider } from './aiProvider';

const EXTRACTION_PROMPT = `You are extracting structured class schedule information from an image.

Return ONLY valid JSON in this exact shape:
{"courses":[{"courseName":"string","days":["Mon"],"startTime":"HH:mm","endTime":"HH:mm","uncertain":false,"uncertaintyReason":""}]}

Days must be Mon, Tue, Wed, Thu, Fri, Sat, or Sun. Times must use 24-hour HH:mm format.
Do not invent courses. If a field is unclear, make the most reasonable interpretation and set uncertain=true with an explanation.`;

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
}

export class OpenAIProvider implements AIProvider {
  async extractScheduleFromImage(image: string): Promise<unknown> {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      throw new Error('AI_API_KEY is not configured.');
    }

    const baseUrl = (process.env.AI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: EXTRACTION_PROMPT },
          {
            role: 'user',
            content: [{ type: 'text', text: 'Extract the timetable from this image.' }, { type: 'image_url', image_url: { url: image } }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`AI provider request failed (${response.status}): ${message.slice(0, 300)}`);
    }

    const payload = (await response.json()) as OpenAIResponse;
    const content = payload.choices?.[0]?.message?.content;
    const text = Array.isArray(content) ? content.map((part) => part.text ?? '').join('') : content;

    if (!text) {
      throw new Error('AI provider returned an empty response.');
    }

    return JSON.parse(text.replace(/^```json\s*|\s*```$/g, '').trim()) as unknown;
  }
}
