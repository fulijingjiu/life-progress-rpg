import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toLocalDate } from '@/domain/dates/local-date';
import { estimateLifeProgress } from '@/domain/progress/life-progress';
import { recordRepository, type RecordRepository } from '@/data/repositories/record-repository';
import { DEFAULT_USER_ID, type LifeRecord } from '@/domain/records/records.types';
import { MainLayout } from '@/app/layouts/MainLayout';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { settingsRepository } from '@/data/repositories/settings-repository';
import type { UserSettings } from '@/domain/settings/settings.types';

type SettingsState =
  | {
      loaded: true;
      settings?: UserSettings;
    }
  | { loaded: false; settings: undefined };

const today = toLocalDate();

function useTodayRecord(repository: RecordRepository) {
  const [todayRecord, setTodayRecord] = useState<LifeRecord | undefined>(undefined);

  useEffect(() => {
    repository
      .getByLocalDate(DEFAULT_USER_ID, today)
      .then(setTodayRecord)
      .catch(() => setTodayRecord(undefined));
  }, [repository]);

  return todayRecord;
}

function useUserSettings() {
  const [state, setState] = useState<SettingsState>({ loaded: false, settings: undefined });

  useEffect(() => {
    let active = true;
    settingsRepository
      .ensureById(DEFAULT_USER_ID)
      .then((settings) => {
        if (active) {
          setState({ loaded: true, settings });
        }
      })
      .catch(() => {
        if (active) {
          setState({ loaded: true, settings: undefined });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

export function HomePage() {
  const todayRecord = useTodayRecord(recordRepository);
  const userSettings = useUserSettings();

  const settings = userSettings.settings;
  const showProgress = userSettings.loaded && Boolean(settings?.showLifeProgress);
  const progress =
    showProgress && settings
      ? estimateLifeProgress({
          birthdayYear: settings.birthdayYear,
          lifeExpectancy: settings.lifeExpectancy,
        })
      : null;

  return (
    <MainLayout>
      <section>
        <SectionTitle
          title="你今天准备好记录了吗？"
          description="完成一次简短记录，并获得可核对的当日回应。"
        />

        {showProgress && progress ? (
          <div className="home-card progress-card" aria-live="polite">
            <p>估算人生进度（近似）</p>
            <div className="progress-headline">
              <strong>{progress.estimateAge} 岁</strong>
              <span>{progress.estimateProgressPercent.toFixed(1)}%</span>
            </div>
            <div className="progress-bar" aria-label="估算进度条">
              <span style={{ width: `${progress.estimateProgressPercent}%` }} />
            </div>
            <small>
              仅基于出生年份和预期年龄估算，不代表寿命预测。{USER_SETTINGS_NOTE}
            </small>
          </div>
        ) : null}

        <div className="home-card">
          <p>今日日期：{today}</p>
          {todayRecord ? (
            <>
              <p>今日已记录：心情 {todayRecord.mood}，活力 {todayRecord.energy}</p>
              <p>回应：{todayRecord.reflection}</p>
              <div className="home-actions">
                <Link className="btn" to="/record">
                  更新今日记录
                </Link>
                <Link className="btn btn--ghost" to="/history">
                  历史记录
                </Link>
              </div>
            </>
          ) : (
            <>
              <p>今日尚未记录</p>
              <div className="home-actions">
                <Link className="btn" to="/record">
                  开始记录
                </Link>
                <Link className="btn btn--ghost" to="/history">
                  查看历史记录
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </MainLayout>
  );
}

const USER_SETTINGS_NOTE = '如想回看变化趋势，可在设置里调整预期寿命。';
