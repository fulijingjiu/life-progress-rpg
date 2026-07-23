import { isResultOk } from '@/shared/types/result';
import {
  USER_SETTINGS_DEFAULT_THEME,
  createDefaultSettings,
  sanitizeSettingsPatch,
  type UserSettings,
  type UserSettingsPatch,
  validateSettingsPatch,
} from '@/domain/settings/settings.types';
import { appDb } from '@/data/db/app-db';

export interface SettingsRepository {
  getById(id: string): Promise<UserSettings | undefined>;
  ensureById(id: string): Promise<UserSettings>;
  updateById(id: string, patch: UserSettingsPatch): Promise<UserSettings>;
}

export class DexieSettingsRepository implements SettingsRepository {
  async getById(id: string): Promise<UserSettings | undefined> {
    return appDb.settings.get(id);
  }

  async ensureById(id: string): Promise<UserSettings> {
    const existing = await this.getById(id);
    if (existing) {
      if (existing.onboardingCompleted === undefined) {
        existing.onboardingCompleted = false;
        const now = new Date().toISOString();
        existing.updatedAt = now;
        await appDb.settings.put(existing);
      }
      return existing;
    }

    const created = createDefaultSettings(id);
    await appDb.settings.put(created);
    return created;
  }

  async updateById(id: string, patch: UserSettingsPatch): Promise<UserSettings> {
    const existing = await this.ensureById(id);
    const sanitized = sanitizeSettingsPatch(patch);
    const validated = validateSettingsPatch(sanitized);
    if (!isResultOk(validated)) {
      throw new Error(validated.error);
    }

    const now = new Date().toISOString();
    const next: UserSettings = {
      ...existing,
      ...validated.value,
      theme: validated.value.theme ?? existing.theme ?? USER_SETTINGS_DEFAULT_THEME,
      updatedAt: now,
    };

    await appDb.settings.put(next);
    return next;
  }
}

export const settingsRepository = new DexieSettingsRepository();
