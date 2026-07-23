import { appDb } from '@/data/db/app-db';
import { settingsRepository } from '@/data/repositories/settings-repository';
import {
  DATA_MANAGEMENT_BACKUP_FORMAT,
  DATA_MANAGEMENT_SCHEMA_VERSION,
  parseDataManagementBackup,
  type DataManagementBackup,
  type DataManagementImportParseResult,
} from '@/domain/data-management/data-management-bundle';

export interface DataManagementRepository {
  exportAll(userId: string): Promise<DataManagementBackup>;
  importFromBackupJson(userId: string, jsonText: string): Promise<DataManagementBackup>;
  clearAllData(userId: string): Promise<void>;
  getImportPreview(userId: string, jsonText: string): DataManagementImportParseResult;
}

export class DexieDataManagementRepository implements DataManagementRepository {
  async exportAll(userId: string): Promise<DataManagementBackup> {
    const [settings, records] = await Promise.all([
      settingsRepository.ensureById(userId),
      appDb.records.where('userId').equals(userId).toArray(),
    ]);

    const sorted = [...records].sort((a, b) => b.localDate.localeCompare(a.localDate));

    return {
      format: DATA_MANAGEMENT_BACKUP_FORMAT,
      schemaVersion: DATA_MANAGEMENT_SCHEMA_VERSION,
      sourceUserId: userId,
      exportedAt: new Date().toISOString(),
      appVersion: '0.1.0',
      settings,
      records: sorted,
    };
  }

  getImportPreview(_userId: string, jsonText: string): DataManagementImportParseResult {
    return parseDataManagementBackup(jsonText, _userId);
  }

  async importFromBackupJson(userId: string, jsonText: string): Promise<DataManagementBackup> {
    const parseResult = parseDataManagementBackup(jsonText, userId);
    if (!parseResult.ok) {
      throw new Error(parseResult.errors.join('\n'));
    }

    const plan = parseResult.value;
    const normalizedSettings = {
      ...plan.settings,
      id: userId,
    };

    await appDb.transaction('rw', appDb.records, appDb.settings, async () => {
      await appDb.records.where('userId').equals(userId).delete();
      await appDb.settings.delete(userId);

      await appDb.settings.put(normalizedSettings);
      if (plan.records.length > 0) {
        await appDb.records.bulkPut(
          plan.records.map((record, index) => ({
            ...record,
            id: `${record.id}-${index}-${Date.now()}`,
            userId,
          }))
        );
      }
    });

    return plan;
  }

  async clearAllData(userId: string): Promise<void> {
    await appDb.transaction('rw', appDb.records, appDb.settings, async () => {
      await appDb.records.where('userId').equals(userId).delete();
      await appDb.settings.delete(userId);
    });
  }
}

export const dataManagementRepository = new DexieDataManagementRepository();
