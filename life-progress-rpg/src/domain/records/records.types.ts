import { DomainResult } from '@/shared/types/result';

export type MoodValue = 1 | 2 | 3 | 4 | 5;
export type EnergyValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type ReflectionSource = 'rules' | 'ai' | 'none';
export type ReflectionStatus = 'not_requested' | 'pending' | 'completed' | 'failed';
export type ReflectionFeedback = 'helpful' | 'not_helpful' | 'inaccurate';
export type RecordValidationError = 'INVALID_MOOD' | 'INVALID_ENERGY' | 'INVALID_TAGS' | 'INVALID_REFLECTION';

export const DEFAULT_USER_ID = 'local-user';

export interface LifeRecord {
  id: string;
  userId: string;
  localDate: string;
  mood: MoodValue;
  energy: EnergyValue;
  content?: string;
  tags: string[];
  reflection?: string;
  reflectionSource: ReflectionSource;
  reflectionStatus: ReflectionStatus;
  reflectionFeedback?: ReflectionFeedback;
  createdAt: string;
  updatedAt: string;
}

export interface LifeRecordDraft {
  localDate: string;
  mood: MoodValue;
  energy: EnergyValue;
  content?: string;
  tags: string[];
  reflection?: string;
  reflectionSource: ReflectionSource;
  reflectionStatus: ReflectionStatus;
  reflectionFeedback?: ReflectionFeedback;
}

export const isMoodValue = (value: unknown): value is MoodValue => {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
};

export const isEnergyValue = (value: unknown): value is EnergyValue => {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4 || value === 5 || value === 6 || value === 7 || value === 8 || value === 9 || value === 10;
};

export const isReflectionSource = (value: unknown): value is ReflectionSource => {
  return value === 'rules' || value === 'ai' || value === 'none';
};

export const isReflectionStatus = (value: unknown): value is ReflectionStatus => {
  return (
    value === 'not_requested' ||
    value === 'pending' ||
    value === 'completed' ||
    value === 'failed'
  );
};

export const isReflectionFeedback = (value: unknown): value is ReflectionFeedback => {
  return value === 'helpful' || value === 'not_helpful' || value === 'inaccurate';
};

export const normalizeTags = (raw: string[] = []): string[] => {
  return raw
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .slice(0, 6);
};

export function validateRecordDraft(draft: LifeRecordDraft): DomainResult<LifeRecordDraft, RecordValidationError> {
  if (!isMoodValue(draft.mood)) {
    return { ok: false, error: 'INVALID_MOOD' };
  }
  if (!isEnergyValue(draft.energy)) {
    return { ok: false, error: 'INVALID_ENERGY' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.localDate)) {
    return { ok: false, error: 'INVALID_TAGS' };
  }

  const cleaned = normalizeTags(draft.tags);
  if (draft.tags.length !== cleaned.length) {
    return { ok: true, value: { ...draft, tags: cleaned } };
  }

  return { ok: true, value: { ...draft, tags: cleaned } };
}
