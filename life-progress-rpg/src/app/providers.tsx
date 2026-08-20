import { ReactNode, useEffect } from 'react';
import { settingsRepository } from '@/data/repositories/settings-repository';
import { DEFAULT_USER_ID } from '@/domain/records/records.types';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    let active = true;
    settingsRepository
      .ensureById(DEFAULT_USER_ID)
      .then((settings) => {
        if (active) {
          document.documentElement.dataset.theme = settings.theme;
        }
      })
      .catch(() => {
        document.documentElement.dataset.theme = 'default';
      });

    return () => {
      active = false;
    };
  }, []);

  return <>{children}</>;
}
