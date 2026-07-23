import { FormEvent, useCallback, useEffect, useState } from 'react';
import {
  type LifeRecord,
  type ReflectionFeedback,
  type ReflectionSource,
  type ReflectionStatus,
} from '@/domain/records/records.types';
import { requestAiReflection, type ReflectionRecordPayload } from '@/services/ai/reflection-service';
import { toLocalDate } from '@/domain/dates/local-date';
import { DEFAULT_USER_ID } from '@/domain/records/records.types';
import { settingsRepository } from '@/data/repositories/settings-repository';
import { recordRepository, type RecordRepository } from '@/data/repositories/record-repository';
import { type RecordFormInput, buildFormPayloadForDate, initialRecordForm } from '../model/record-form';

type SubmitStatus = 'idle' | 'saving' | 'saved' | 'reflecting' | 'failed';

type UseSaveRecordOptions = {
  repository?: RecordRepository;
  localDate?: string;
  initialValues?: Partial<RecordFormInput>;
  initialValuesKey?: string;
  initialRecord?: LifeRecord;
};

const prepareRecordForAi = (record: LifeRecord): ReflectionRecordPayload => {
  return {
    mood: record.mood,
    energy: record.energy,
    tags: record.tags,
    content: record.content,
  };
};

export function useSaveRecord(options: UseSaveRecordOptions = {}) {
  const repository = options.repository ?? recordRepository;
  const localDate = options.localDate ?? toLocalDate();
  const [formState, setFormState] = useState<RecordFormInput>({
    ...initialRecordForm,
    ...options.initialValues,
  });
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [message, setMessage] = useState('');
  const [isAiAllowed, setIsAiAllowed] = useState(false);
  const [savedRecord, setSavedRecord] = useState<LifeRecord | undefined>(options.initialRecord);

  useEffect(() => {
    const nextState = {
      ...initialRecordForm,
      ...(options.initialValues ?? {}),
    };

    setStatus('idle');
    setMessage('');
    setFormState(nextState);
  }, [options.initialValuesKey, options.initialValues]);

  useEffect(() => {
    setSavedRecord(options.initialRecord);
  }, [options.initialRecord]);

  useEffect(() => {
    let active = true;
    settingsRepository
      .ensureById(DEFAULT_USER_ID)
      .then((settings) => {
        if (active) {
          setIsAiAllowed(settings.aiConsent);
        }
      })
      .catch(() => {
        if (active) {
          setIsAiAllowed(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const setField = <K extends keyof RecordFormInput>(key: K, value: RecordFormInput[K]) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  const setReflectionFeedback = useCallback(
    async (record: LifeRecord | undefined, feedback: ReflectionFeedback | undefined): Promise<void> => {
      if (!record) {
        return;
      }

      const updated = await repository.updateReflectionMetadata(record.id, {
        reflectionFeedback: feedback,
        clearReflectionFeedback: feedback === undefined,
      });

      setSavedRecord(updated);
    },
    [repository]
  );

  const submit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus('saving');
      setMessage('');

      const mood = formState.mood;
      const energy = formState.energy;
      if (mood === '' || energy === '') {
        setStatus('failed');
        setMessage('请先选择心情和活力。');
        return;
      }

      const payload = buildFormPayloadForDate(formState, localDate);
      const shouldAttemptAi = payload.localDate === toLocalDate() && payload.reflectionSource === 'ai' && isAiAllowed;

      try {
        const baseStatus: ReflectionStatus = shouldAttemptAi ? 'pending' : 'completed';
        const baseSource: ReflectionSource = shouldAttemptAi ? 'ai' : 'rules';
        const payloadWithPolicy = {
          ...payload,
          reflectionSource: baseSource,
          reflectionStatus: baseStatus,
          reflectionFeedback: undefined,
        };

        const saved = await repository.saveForLocalDate(DEFAULT_USER_ID, localDate, payloadWithPolicy);
        setSavedRecord(saved);
        setStatus(shouldAttemptAi ? 'reflecting' : 'saved');

        setMessage(
          payloadWithPolicy.reflectionStatus === 'completed'
            ? '已保存到本地。今天的记录可继续覆盖更新。'
            : '已保存到本地。正在尝试生成 AI 整理…'
        );

        if (shouldAttemptAi) {
          try {
            const aiRecord = await requestAiReflection(prepareRecordForAi(saved));
            const updated = await repository.updateReflectionMetadata(saved.id, {
              reflection: aiRecord.reflection,
              reflectionSource: 'ai',
              reflectionStatus: 'completed',
              clearReflectionFeedback: true,
            });
            setSavedRecord(updated);
            setStatus('saved');
            setMessage('已保存到本地。AI 整理已更新。');
          } catch {
            const fallback = await repository.updateReflectionMetadata(saved.id, {
              reflectionSource: 'rules',
              reflectionStatus: 'failed',
              clearReflectionFeedback: true,
            });
            setSavedRecord(fallback);
            setStatus('saved');
            setMessage('已保存到本地，AI 不可用，已回退到本地回应。');
          }
        }
      } catch (error) {
        setStatus('failed');
        const reason = error instanceof Error ? error.message : '保存失败';
        setMessage(reason);
      }
    },
    [formState, localDate, repository, isAiAllowed]
  );

  return {
    formState,
    setField,
    submit,
    status,
    message,
    savedRecord,
    setReflectionFeedback,
    isAiAllowed,
  };
}
