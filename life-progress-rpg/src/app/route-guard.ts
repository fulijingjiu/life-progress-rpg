import { redirect } from 'react-router-dom';
import { DEFAULT_USER_ID } from '@/domain/records/records.types';
import { settingsRepository } from '@/data/repositories/settings-repository';

const bootstrapSettings = () => settingsRepository.ensureById(DEFAULT_USER_ID);

export const requireOnboardingDone = async () => {
  const settings = await bootstrapSettings();
  if (!settings.onboardingCompleted) {
    return redirect('/onboarding');
  }
  return null;
};

export const blockOnboardingIfDone = async () => {
  const settings = await bootstrapSettings();
  if (settings.onboardingCompleted) {
    return redirect('/');
  }
  return null;
};
