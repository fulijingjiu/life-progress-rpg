import { toLocalDate } from '@/domain/dates/local-date';
import { type EnergyValue, type LifeRecord, type MoodValue } from '@/domain/records/records.types';

export type RecordFormInput = {
  mood: MoodValue | '';
  energy: EnergyValue | '';
  content: string;
  tagsText: string;
  reflection: string;
  useAiReflection: boolean;
};

export const buildFormPayload = (form: RecordFormInput) => {
  const tags = form.tagsText
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, idx, arr) => arr.indexOf(tag) === idx)
    .slice(0, 6);

  return {
    localDate: toLocalDate(),
    mood: Number(form.mood) as MoodValue,
    energy: Number(form.energy) as EnergyValue,
    content: form.content.trim() || undefined,
    tags,
    reflectionSource: form.useAiReflection ? 'ai' : 'rules',
    reflectionStatus: form.reflection ? 'completed' : 'not_requested',
    reflection: form.reflection || undefined,
  };
};

export const buildFormPayloadForDate = (form: RecordFormInput, localDate: string) => {
  return {
    ...buildFormPayload(form),
    localDate,
  };
};

export const buildRecordFormFromRecord = (record: LifeRecord): RecordFormInput => {
  return {
    mood: record.mood,
    energy: record.energy,
    content: record.content ?? '',
    tagsText: record.tags.join(', '),
    reflection: record.reflection ?? '',
    useAiReflection: record.reflectionSource === 'ai',
  };
};

export const initialRecordForm: RecordFormInput = {
  mood: '',
  energy: '',
  content: '',
  tagsText: '',
  reflection: '',
  useAiReflection: false,
};
