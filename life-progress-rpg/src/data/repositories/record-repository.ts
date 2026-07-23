import { appDb } from '@/data/db/app-db';
import { isResultOk } from '@/shared/types/result';
import {
  validateRecordDraft,
  type LifeRecord,
  type LifeRecordDraft,
  type ReflectionFeedback,
  type ReflectionSource,
  type ReflectionStatus,
  isReflectionFeedback,
  isReflectionSource,
  isReflectionStatus,
} from '@/domain/records/records.types';
import { buildLocalReflection } from '@/domain/records/local-reflection';
import { generateId } from '@/shared/lib/generate-id';

export interface RecordRepository {
  getByLocalDate(userId: string, localDate: string): Promise<LifeRecord | undefined>;
  listRecentByUser(userId: string, limit?: number): Promise<LifeRecord[]>;
  saveForLocalDate(
    userId: string,
    localDate: string,
    draft: Omit<LifeRecordDraft, 'localDate' | 'reflection'>
  ): Promise<LifeRecord>;
  deleteById(id: string): Promise<void>;
  updateReflectionMetadata(
    id: string,
    patch: {
      reflection?: string;
      reflectionSource?: ReflectionSource;
      reflectionStatus?: ReflectionStatus;
      reflectionFeedback?: ReflectionFeedback;
      clearReflectionFeedback?: boolean;
    }
  ): Promise<LifeRecord>;
}

export const DEFAULT_LIMIT = 30;

export class DexieRecordRepository implements RecordRepository {
  async getByLocalDate(userId: string, localDate: string): Promise<LifeRecord | undefined> {
    return appDb.records
      .where('[userId+localDate]')
      .equals([userId, localDate])
      .first();
  }

  async listRecentByUser(userId: string, limit = DEFAULT_LIMIT): Promise<LifeRecord[]> {
    const rows = await appDb.records.where('userId').equals(userId).toArray();
    return rows
      .sort((a, b) => b.localDate.localeCompare(a.localDate))
      .slice(0, limit);
  }

  async saveForLocalDate(
    userId: string,
    localDate: string,
    draftInput: Omit<LifeRecordDraft, 'localDate' | 'reflection'>
  ): Promise<LifeRecord> {

    const raw: LifeRecordDraft = {
      localDate,
      mood: draftInput.mood,
      energy: draftInput.energy,
      content: draftInput.content,
      tags: draftInput.tags,
      reflection: undefined,
      reflectionSource: 'rules',
      reflectionStatus: draftInput.reflectionStatus ?? 'completed',
      reflectionFeedback: draftInput.reflectionFeedback,
    };

    const validated = validateRecordDraft(raw);
    if (!isResultOk(validated)) {
      throw new Error(`Invalid record: ${validated.error}`);
    }

    const now = new Date().toISOString();
    const existing = await this.getByLocalDate(userId, localDate);

    const base = {
      ...validated.value,
      reflectionSource: draftInput.reflectionSource ?? validated.value.reflectionSource,
      reflectionStatus: draftInput.reflectionStatus ?? validated.value.reflectionStatus,
      reflectionFeedback: draftInput.reflectionFeedback,
    };

    const record: LifeRecord = {
      id: existing?.id ?? generateId('record'),
      userId,
      localDate,
      reflection: base.reflection ?? buildLocalReflection(base),
      mood: base.mood,
      energy: base.energy,
      tags: base.tags,
      content: base.content,
      reflectionSource: base.reflectionSource,
      reflectionStatus: base.reflectionStatus,
      reflectionFeedback: base.reflectionFeedback,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await appDb.records.put(record);
    return record;
  }

  async deleteById(id: string): Promise<void> {
    await appDb.records.delete(id);
  }

  async updateReflectionMetadata(
    id: string,
    patch: {
      reflection?: string;
      reflectionSource?: ReflectionSource;
      reflectionStatus?: ReflectionStatus;
      reflectionFeedback?: ReflectionFeedback;
      clearReflectionFeedback?: boolean;
    }
  ): Promise<LifeRecord> {
    const existing = await appDb.records.get(id);
    if (!existing) {
      throw new Error('记录不存在');
    }

    if (patch.reflectionSource !== undefined && !isReflectionSource(patch.reflectionSource)) {
      throw new Error('reflectionSource 非法');
    }
    if (patch.reflectionStatus !== undefined && !isReflectionStatus(patch.reflectionStatus)) {
      throw new Error('reflectionStatus 非法');
    }
    if (patch.reflectionFeedback !== undefined && !isReflectionFeedback(patch.reflectionFeedback)) {
      throw new Error('reflectionFeedback 非法');
    }

    const next: LifeRecord = {
      ...existing,
      ...patch,
      reflection: patch.reflection ?? existing.reflection,
      reflectionFeedback: patch.clearReflectionFeedback ? undefined : patch.reflectionFeedback ?? existing.reflectionFeedback,
      updatedAt: new Date().toISOString(),
    };

    await appDb.records.put(next);
    return next;
  }
}

export const recordRepository = new DexieRecordRepository();
