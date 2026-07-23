import { describe, expect, it } from 'vitest';
import {
  createDefaultSettings,
  sanitizeSettingsPatch,
  validateSettingsPatch,
  USER_SETTINGS_MAX_EXPECTANCY,
  USER_SETTINGS_MIN_BIRTH_YEAR,
  USER_SETTINGS_MIN_EXPECTANCY,
} from './settings.types';

describe('settings types', () => {
  it('accepts valid update patch', () => {
    const result = validateSettingsPatch({
      birthdayYear: 1990,
      lifeExpectancy: 90,
      showLifeProgress: false,
      onboardingCompleted: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toMatchObject({ birthdayYear: 1990, lifeExpectancy: 90, showLifeProgress: false });
    }
  });

  it('rejects out of range birth year', () => {
    const result = validateSettingsPatch({
      birthdayYear: USER_SETTINGS_MIN_BIRTH_YEAR - 1,
    });
    expect(result.ok).toBe(false);
  });

  it('rejects out of range expectancy', () => {
    const result = validateSettingsPatch({
      lifeExpectancy: USER_SETTINGS_MAX_EXPECTANCY + 1,
    });
    expect(result.ok).toBe(false);
  });

  it('rejects expectancy below minimum', () => {
    const result = validateSettingsPatch({
      lifeExpectancy: USER_SETTINGS_MIN_EXPECTANCY - 1,
    });
    expect(result.ok).toBe(false);
  });

  it('normalizes nickname', () => {
    const settings = createDefaultSettings('u1');
    const result = sanitizeSettingsPatch({ ...settings, nickname: '  ' });
    expect(result.nickname).toBeUndefined();
  });

  it('rejects too long nickname via validation', () => {
    const result = validateSettingsPatch({
      nickname: 'a'.repeat(41),
    });
    expect(result.ok).toBe(false);
  });
});
