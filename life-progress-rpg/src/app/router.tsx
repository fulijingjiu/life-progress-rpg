import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from '@/features/life-progress';
import { DailyRecordPage } from '@/features/daily-record';
import { OnboardingPage } from '@/features/onboarding';
import { HistoryPage } from '@/features/history';
import { SettingsPage } from '@/features/settings';
import { DataManagementPage } from '@/features/data-management';
import { blockOnboardingIfDone, requireOnboardingDone } from './route-guard';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    loader: requireOnboardingDone,
    element: <HomePage />,
  },
  {
    path: '/onboarding',
    loader: blockOnboardingIfDone,
    element: <OnboardingPage />,
  },
  {
    path: '/record',
    loader: requireOnboardingDone,
    element: <DailyRecordPage />,
  },
  {
    path: '/record/:localDate',
    loader: requireOnboardingDone,
    element: <DailyRecordPage />,
  },
  {
    path: '/settings',
    loader: requireOnboardingDone,
    element: <SettingsPage />,
  },
  {
    path: '/history',
    loader: requireOnboardingDone,
    element: <HistoryPage />,
  },
  {
    path: '/data-management',
    loader: requireOnboardingDone,
    element: <DataManagementPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
