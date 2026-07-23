import { DomainResult } from '@/shared/types/result';

export interface UserSettings {
  id: string;
  nickname?: string;
  birthdayYear: number;
  lifeExpectancy: number;
  showLifeProgress: boolean;
  aiConsent: boolean;
  analyticsConsent: boolean;
  theme: 'default' | 'spring' | 'study' | 'explore' | 'root';
  onboardingCompleted: boolean;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}

export const USER_SETTINGS_DEFAULT_THEME = 'default' as const;
export const USER_SETTINGS_MIN_BIRTH_YEAR = 1900;
export const USER_SETTINGS_MIN_EXPECTANCY = 35;
export const USER_SETTINGS_MAX_EXPECTANCY = 140;

export type SettingsValidationError =
  | 'INVALID_BIRTH_YEAR'
  | 'INVALID_EXPECTANCY'
  | 'INVALID_NICKNAME'
  | 'INVALID_THEME';

export const createDefaultSettings = (userId: string): UserSettings => {
  const now = new Date().toISOString();
  const currentYear = new Date().getFullYear();
  return {
    id: userId,
    birthdayYear: currentYear - 30,
    lifeExpectancy: 80,
    showLifeProgress: true,
    aiConsent: false,
    analyticsConsent: false,
    theme: USER_SETTINGS_DEFAULT_THEME,
    onboardingCompleted: false,
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
  };
};

export type UserSettingsPatch = {
  nickname?: string;
  birthdayYear?: number;
  lifeExpectancy?: number;
  showLifeProgress?: boolean;
  aiConsent?: boolean;
  analyticsConsent?: boolean;
  theme?: UserSettings['theme'];
  onboardingCompleted?: boolean;
};

export const normalizeNickname = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.length > 40) {
    return undefined;
  }
  return trimmed;
};

export const isTheme = (value: unknown): value is UserSettings['theme'] => {
  return value === 'default' || value === 'spring' || value === 'study' || value === 'explore' || value === 'root';
};

export const sanitizeSettingsPatch = (input: UserSettingsPatch): UserSettingsPatch => {
  const normalizedNickname = normalizeNickname(input.nickname);

  const patch: UserSettingsPatch = {
    ...input,
    nickname: normalizedNickname,
  };

  if (!isTheme(input.theme)) {
    patch.theme = undefined;
  }

  if (!Number.isInteger(input.birthdayYear)) {
    patch.birthdayYear = undefined;
  }

  if (!Number.isInteger(input.lifeExpectancy)) {
    patch.lifeExpectancy = undefined;
  }

  return patch;
};

export const validateSettingsPatch = (
  patch: UserSettingsPatch
): DomainResult<UserSettingsPatch, SettingsValidationError> => {
  const currentYear = new Date().getFullYear();

  if (patch.birthdayYear !== undefined) {
    if (!Number.isInteger(patch.birthdayYear)) {
      return { ok: false, error: 'INVALID_BIRTH_YEAR' };
    }
    if (patch.birthdayYear < USER_SETTINGS_MIN_BIRTH_YEAR || patch.birthdayYear > currentYear) {
      return { ok: false, error: 'INVALID_BIRTH_YEAR' };
    }
  }

  if (patch.lifeExpectancy !== undefined) {
    if (!Number.isInteger(patch.lifeExpectancy)) {
      return { ok: false, error: 'INVALID_EXPECTANCY' };
    }
    if (
      patch.lifeExpectancy < USER_SETTINGS_MIN_EXPECTANCY ||
      patch.lifeExpectancy > USER_SETTINGS_MAX_EXPECTANCY
    ) {
      return { ok: false, error: 'INVALID_EXPECTANCY' };
    }
  }

  if (patch.theme !== undefined && !isTheme(patch.theme)) {
    return { ok: false, error: 'INVALID_THEME' };
  }

  if (patch.nickname !== undefined && patch.nickname.length > 40) {
    return { ok: false, error: 'INVALID_NICKNAME' };
  }

  return { ok: true, value: patch };
};
