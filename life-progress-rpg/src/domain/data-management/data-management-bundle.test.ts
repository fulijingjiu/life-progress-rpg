import { describe, expect, it } from 'vitest';
import {
  parseDataManagementBackup,
  DATA_MANAGEMENT_BACKUP_FORMAT,
  DATA_MANAGEMENT_SCHEMA_VERSION,
} from './data-management-bundle';
import { createDefaultSettings } from '@/domain/settings/settings.types';

describe('data-management backup parser', () => {
  it('accepts a valid backup payload', () => {
    const settings = createDefaultSettings('local-user');
    const payload = {
      format: DATA_MANAGEMENT_BACKUP_FORMAT,
      schemaVersion: DATA_MANAGEMENT_SCHEMA_VERSION,
      sourceUserId: 'local-user',
      exportedAt: new Date().toISOString(),
      settings,
      records: [
        {
          id: 'r1',
          userId: 'local-user',
          localDate: '2026-07-24',
          mood: 4,
          energy: 8,
          tags: ['学习'],
          reflectionSource: 'rules',
          reflectionStatus: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    const result = parseDataManagementBackup(JSON.stringify(payload), 'local-user');
    expect(result.ok).toBe(true);
  });

  it('rejects unsupported format', () => {
    const result = parseDataManagementBackup('{"format":"unknown"}', 'local-user');
    expect(result.ok).toBe(false);
  });

  it('rejects malformed json', () => {
    const result = parseDataManagementBackup('{not-json', 'local-user');
    expect(result.ok).toBe(false);
  });
});
