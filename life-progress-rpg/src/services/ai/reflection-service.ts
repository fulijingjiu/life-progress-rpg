import { type LifeRecord } from '@/domain/records/records.types';

export type AiReflectionResponse = {
  requestId: string;
  reflection: string;
  source: 'ai';
};

export type ReflectionRecordPayload = Pick<LifeRecord, 'mood' | 'energy' | 'tags' | 'content'>;

export type ReflectionRequestPayload = {
  requestId: string;
  record: ReflectionRecordPayload;
};

export const REFLECTION_API_ENDPOINT = '/api/reflections';
export const AI_REFLECTION_TIMEOUT_MS = 3500;
export const AI_REFLECTION_MAX_LENGTH = 90;

type RawResponse = {
  requestId?: unknown;
  reflection?: unknown;
  source?: unknown;
  safety?: unknown;
};

const toSafeString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const isResponsePayload = (value: unknown): value is RawResponse => {
  return typeof value === 'object' && value !== null;
};

const isSafeReflection = (value: string): boolean => {
  const plain = value.trim();
  return plain.length > 0 && plain.length <= AI_REFLECTION_MAX_LENGTH;
};

export const buildReflectionRequestPayload = (record: ReflectionRecordPayload, requestId: string): ReflectionRequestPayload => {
  return {
    requestId,
    record: {
      mood: record.mood,
      energy: record.energy,
      tags: record.tags,
      content: record.content?.trim(),
    },
  };
};

export const parseAiReflectionResponse = (rawText: string): string => {
  const maybeParsed = (() => {
    try {
      const parsed: unknown = JSON.parse(rawText);
      if (!isResponsePayload(parsed)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  })();

  if (!maybeParsed || !isSafeReflection(toSafeString(maybeParsed.reflection) ?? '')) {
    throw new Error('AI 回复格式不符合约束。');
  }

  const reflection = toSafeString(maybeParsed.reflection);
  if (!reflection) {
    throw new Error('AI 回复为空。');
  }

  return reflection;
};

const runWithTimeout = async <T>(
  promise: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new DOMException('AI 请求超时。', 'TimeoutError'));
  }, timeoutMs);

  try {
    return await promise(controller.signal);
  } finally {
    clearTimeout(timer);
  }
};

export const requestAiReflection = async (record: ReflectionRecordPayload): Promise<AiReflectionResponse> => {
  const requestId = `reflection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const payload = buildReflectionRequestPayload(record, requestId);

  const responseText = await runWithTimeout(
    async (signal) => {
      const response = await fetch(REFLECTION_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal,
      });

      if (!response.ok) {
        throw new Error('AI 服务暂时不可用。');
      }

      return response.text();
    },
    AI_REFLECTION_TIMEOUT_MS
  );

  const reflection = parseAiReflectionResponse(responseText);

  return {
    requestId,
    reflection,
    source: 'ai',
  };
};
