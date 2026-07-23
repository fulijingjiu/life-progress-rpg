import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/app/layouts/MainLayout';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { toLocalDate } from '@/domain/dates/local-date';
import { Button } from '@/shared/ui/Button';
import {
  USER_SETTINGS_MAX_EXPECTANCY,
  USER_SETTINGS_MIN_BIRTH_YEAR,
  USER_SETTINGS_MIN_EXPECTANCY,
  type UserSettings,
  validateSettingsPatch,
  type UserSettingsPatch,
} from '@/domain/settings/settings.types';
import { DEFAULT_USER_ID } from '@/domain/records/records.types';
import { settingsRepository } from '@/data/repositories/settings-repository';

type SettingsForm = {
  nickname: string;
  birthdayYear: string;
  lifeExpectancy: string;
  showLifeProgress: boolean;
  aiConsent: boolean;
  analyticsConsent: boolean;
};

type SettingsError = {
  [K in keyof SettingsForm]?: string;
};
const toSafeLocalDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())  ? '' : toLocalDate(date);
};


export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<SettingsError>({});

  const [formState, setFormState] = useState<SettingsForm>({
    nickname: '',
    birthdayYear: '',
    lifeExpectancy: '',
    showLifeProgress: true,
    aiConsent: false,
    analyticsConsent: false,
  });

  const [sourceDate, setSourceDate] = useState('');

  useEffect(() => {
    let active = true;

    settingsRepository
      .ensureById(DEFAULT_USER_ID)
      .then((settings: UserSettings) => {
        if (!active) {
          return;
        }
        setFormState({
          nickname: settings.nickname ?? '',
          birthdayYear: String(settings.birthdayYear),
          lifeExpectancy: String(settings.lifeExpectancy),
          showLifeProgress: settings.showLifeProgress,
          aiConsent: settings.aiConsent,
          analyticsConsent: settings.analyticsConsent,
        });
        setSourceDate(toSafeLocalDate(settings.updatedAt));
      })
      .catch(() => {
        setMessage('读取设置失败，请刷新后重试。');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const validate = (): boolean => {
    const currentYear = new Date().getFullYear();
    const errorsDraft: SettingsError = {};
    const birthYear = Number(formState.birthdayYear);
    const lifeExpectancy = Number(formState.lifeExpectancy);

    if (!Number.isInteger(birthYear) || birthYear < USER_SETTINGS_MIN_BIRTH_YEAR || birthYear > currentYear) {
      errorsDraft.birthdayYear = '请输入 1900 到今年之间的出生年份。';
    }

    if (
      !Number.isInteger(lifeExpectancy) ||
      lifeExpectancy < USER_SETTINGS_MIN_EXPECTANCY ||
      lifeExpectancy > USER_SETTINGS_MAX_EXPECTANCY
    ) {
      errorsDraft.lifeExpectancy = `请输入 ${USER_SETTINGS_MIN_EXPECTANCY} 到 ${USER_SETTINGS_MAX_EXPECTANCY} 之间的值。`;
    }

    if (formState.nickname.trim().length > 40) {
      errorsDraft.nickname = '昵称不能超过 40 个字符。';
    }

    setErrors(errorsDraft);
    return Object.keys(errorsDraft).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      setMessage('请先修正输入错误。');
      return;
    }

    const patch: UserSettingsPatch = {
      nickname: formState.nickname,
      birthdayYear: Number(formState.birthdayYear),
      lifeExpectancy: Number(formState.lifeExpectancy),
      showLifeProgress: formState.showLifeProgress,
      aiConsent: formState.aiConsent,
      analyticsConsent: formState.analyticsConsent,
    };

    const validation = validateSettingsPatch(patch);
    if (!validation.ok) {
      setMessage('保存失败：内容有误。');
      return;
    }

    setSaving(true);
    setMessage('保存中…');

    try {
      await settingsRepository.updateById(DEFAULT_USER_ID, validation.value);
      setMessage('设置已保存。后续更改会保存在此设备。');
      setSourceDate(toLocalDate(new Date()));
    } catch (error) {
      const reason = error instanceof Error ? error.message : '保存失败';
      setMessage(`保存失败：${reason}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <section>
        <SectionTitle
          title="设置与偏好"
          description="仅在本地保存，可在此调整显示、隐私和 AI 使用。"
        />

        {loading ? (
          <p className="muted">加载设置中…</p>
        ) : (
          <form className="feature-form" onSubmit={submit}>
            <section className="settings-group" aria-label="显示偏好">
              <h3>显示偏好</h3>

              <label className="field">
                昵称（可选）
                <input
                  type="text"
                  value={formState.nickname}
                  maxLength={40}
                  onChange={(event) => setFormState((current) => ({ ...current, nickname: event.target.value }))}
                />
                {errors.nickname ? <span className="field-error">{errors.nickname}</span> : null}
              </label>

              <label className="field">
                进度开关
                <label className="switch-line">
                  <input
                    type="checkbox"
                    checked={formState.showLifeProgress}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, showLifeProgress: event.target.checked }))
                    }
                  />
                  显示估算人生进度
                </label>
                <small className="field-note">关闭后首页将不再展示进度估算模块。</small>
              </label>
            </section>

            <section className="settings-group" aria-label="个人基线">
              <h3>个人基线</h3>

              <label className="field">
                出生年份
                <input
                  type="number"
                  min={USER_SETTINGS_MIN_BIRTH_YEAR}
                  max={new Date().getFullYear()}
                  value={formState.birthdayYear}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, birthdayYear: event.target.value }))
                  }
                />
                {errors.birthdayYear ? <span className="field-error">{errors.birthdayYear}</span> : null}
                <small className="field-note">用于估算人生进度，不上传给第三方。</small>
              </label>

              <label className="field">
                预期寿命（岁）
                <input
                  type="number"
                  min={USER_SETTINGS_MIN_EXPECTANCY}
                  max={USER_SETTINGS_MAX_EXPECTANCY}
                  value={formState.lifeExpectancy}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, lifeExpectancy: event.target.value }))
                  }
                />
                {errors.lifeExpectancy ? <span className="field-error">{errors.lifeExpectancy}</span> : null}
                <small className="field-note">仅改变估算比例，不影响任何记录。</small>
              </label>
            </section>

            <section className="settings-group" aria-label="隐私与 AI">
              <h3>隐私与 AI</h3>

              <fieldset className="field field--check">
                <label>
                  <input
                    type="checkbox"
                    checked={formState.aiConsent}
                    onChange={(event) => setFormState((current) => ({ ...current, aiConsent: event.target.checked }))}
                  />
                  允许 AI 生成当日一句回应
                </label>
                <small className="field-note">
                  关闭后仍支持本地当日回应，记录功能不受影响。
                </small>
              </fieldset>

              <fieldset className="field field--check">
                <label>
                  <input
                    type="checkbox"
                    checked={formState.analyticsConsent}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, analyticsConsent: event.target.checked }))
                    }
                  />
                  允许匿名行为分析
                </label>
                <small className="field-note">不上传正文，不上传昵称与生日。</small>
              </fieldset>
            </section>

            <section className="settings-group" aria-label="数据管理">
              <h3>数据管理</h3>
              <p className="field-note">
                你可以在“数据管理”里执行导入、导出和清空操作，支持预览校验与二次确认。
              </p>
              <Link className="btn btn--ghost" to="/data-management">
                打开数据管理
              </Link>
            </section>

            <p className="settings-meta">上次更新：{sourceDate || '未知'}</p>

            <div className="form-actions">
              <Button type="submit" disabled={saving}>
                {saving ? '保存中…' : '保存设置'}
              </Button>
            </div>
          </form>
        )}

        {message ? <p className="form-message">{message}</p> : null}
      </section>
    </MainLayout>
  );
}
