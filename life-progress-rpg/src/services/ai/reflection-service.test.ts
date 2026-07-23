import { describe, expect, it, vi } from 'vitest';
import {
  AI_REFLECTION_MAX_LENGTH,
  buildReflectionRequestPayload,
  parseAiReflectionResponse,
  requestAiReflection,
} from './reflection-service';

describe('reflection service', () => {
  it('builds request payload from record', () => {
    const payload = buildReflectionRequestPayload(
      { mood: 4, energy: 7, tags: ['读书', '复盘'], content: ' 完成计划 ' },
      'r1'
    );

    expect(payload.requestId).toBe('r1');
    expect(payload.record.content).toBe('完成计划');
    expect(payload.record.tags).toEqual(['读书', '复盘']);
  });

  it('parses valid ai response', () => {
    const text = JSON.stringify({ requestId: 'x', reflection: '今天节奏不错，先记录到位。' });
    expect(parseAiReflectionResponse(text)).toBe('今天节奏不错，先记录到位。');
  });

  it('rejects invalid ai response', () => {
    expect(() => parseAiReflectionResponse('not json')).toThrow();
    expect(() => parseAiReflectionResponse(JSON.stringify({ requestId: 'x', reflection: '' }))).toThrow();
    expect(() =>
      parseAiReflectionResponse(
        JSON.stringify({
          requestId: 'x',
          reflection: 'a'.repeat(AI_REFLECTION_MAX_LENGTH + 1),
        })
      )
    ).toThrow();
  });

  it('requests ai reflection with fetch', async () => {
    const originalFetch = globalThis.fetch;
    const mockResponse = {
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(JSON.stringify({ requestId: 'r1', reflection: '今天节奏不错。' })),
    };

    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse) as unknown as typeof fetch;

    const result = await requestAiReflection({ mood: 4, energy: 7, tags: ['读书'], content: '完成了' });

    expect(result.reflection).toBe('今天节奏不错。');
    expect(mockResponse.text).toHaveBeenCalledTimes(1);

    globalThis.fetch = originalFetch;
  });
});
