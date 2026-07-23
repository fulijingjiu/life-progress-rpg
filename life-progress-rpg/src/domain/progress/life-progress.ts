import { getDayOfYear } from 'date-fns';
import type { UserSettings } from '@/domain/settings/settings.types';

type LifeProgressInput = Pick<UserSettings, 'birthdayYear' | 'lifeExpectancy'>;

export type LifeProgressSnapshot = {
  estimateAge: number;
  estimateProgressPercent: number;
  isClosed: boolean;
};

export const estimateLifeProgress = (
  settings: LifeProgressInput,
  atDate = new Date()
): LifeProgressSnapshot => {
  const currentYear = atDate.getFullYear();
  const dayOfYear = getDayOfYear(atDate);
  const ageEstimate = (currentYear - settings.birthdayYear) + dayOfYear / 365;

  if (!Number.isFinite(ageEstimate) || settings.lifeExpectancy <= 0) {
    return {
      estimateAge: 0,
      estimateProgressPercent: 0,
      isClosed: false,
    };
  }

  const raw = (ageEstimate / settings.lifeExpectancy) * 100;
  const estimateProgressPercent = Math.max(0, Math.min(100, Math.round(raw * 10) / 10));

  return {
    estimateAge: Math.round(ageEstimate * 10) / 10,
    estimateProgressPercent,
    isClosed: false,
  };
};
