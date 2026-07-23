import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/app/layouts/MainLayout';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { Button } from '@/shared/ui/Button';
import {
  USER_SETTINGS_MAX_EXPECTANCY,
  USER_SETTINGS_MIN_BIRTH_YEAR,
  USER_SETTINGS_MIN_EXPECTANCY,
  validateSettingsPatch,
  type UserSettingsPatch,
} from '@/domain/settings/settings.types';
import { DEFAULT_USER_ID } from '@/domain/records/records.types';
import { settingsRepository } from '@/data/repositories/settings-repository';

type OnboardingForm = {
  nickname: string;
  birthdayYear: string;
  lifeExpectancy: string;
  showLifeProgress: boolean;
  aiConsent: boolean;
  analyticsConsent: boolean;
};

type OnboardingError = {
  [K in keyof OnboardingForm]?: string;
};

const toInt = (raw: string): number => Number.parseInt(raw, 10);

export function OnboardingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<OnboardingError>({});

  const [formState, setFormState] = useState<OnboardingForm>({
    nickname: '',
    birthdayYear: String(new Date().getFullYear() - 30),
    lifeExpectancy: '80',
    showLifeProgress: true,
    aiConsent: false,
    analyticsConsent: false,
  });

  useEffect(() => {
    let active = true;

    settingsRepository
      .ensureById(DEFAULT_USER_ID)
      .then((settings) => {
        if (!active) {
          return;
        }

        setFormState((prev) => ({
          ...prev,
          nickname: settings.nickname ?? '',
          birthdayYear: String(settings.birthdayYear),
          lifeExpectancy: String(settings.lifeExpectancy),
          showLifeProgress: settings.showLifeProgress,
          aiConsent: settings.aiConsent,
          analyticsConsent: settings.analyticsConsent,
        }));
      })
      .catch(() => {
        setMessage('初始化设置失败，请刷新后重试。');
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
    const fieldErrors: OnboardingError = {};

    const currentYear = new Date().getFullYear();
    const birthYear = toInt(formState.birthdayYear);
    const lifeExpectancy = toInt(formState.lifeExpectancy);

    if (Number.isNaN(birthYear) || birthYear < USER_SETTINGS_MIN_BIRTH_YEAR || birthYear > currentYear) {
      fieldErrors.birthdayYear = '请填写 1900 到今年之间的出生年份。';
    }

    if (
      Number.isNaN(lifeExpectancy) ||
      lifeExpectancy < USER_SETTINGS_MIN_EXPECTANCY ||
      lifeExpectancy > USER_SETTINGS_MAX_EXPECTANCY
    ) {
      fieldErrors.lifeExpectancy = `请填写 ${USER_SETTINGS_MIN_EXPECTANCY} 到 ${USER_SETTINGS_MAX_EXPECTANCY} 之间的数字。`;
    }

    if (formState.nickname.trim().length > 40) {
      fieldErrors.nickname = '昵称不能超过 40 个字符。';
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      setMessage('请先修正错误后再继续。');
      return;
    }

    const patch: UserSettingsPatch = {
      nickname: formState.nickname,
      birthdayYear: Number(formState.birthdayYear),
      lifeExpectancy: Number(formState.lifeExpectancy),
      showLifeProgress: formState.showLifeProgress,
      aiConsent: formState.aiConsent,
      analyticsConsent: formState.analyticsConsent,
      onboardingCompleted: true,
      theme: 'default',
    };

    const validation = validateSettingsPatch(patch);
    if (!validation.ok) {
      setMessage('保存失败：有内容不符合要求。');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await settingsRepository.updateById(DEFAULT_USER_ID, patch);
      navigate('/', { replace: true });
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
          title="先把基础信息填好，再开始今天的记录"
          description="每次设置都只保存在当前设备，不会上传你的正文。出生年份仅用于估算进度展示。"
        />

        {loading ? (
          <p className="muted">初始化中…</p>
        ) : (
          <form className="feature-form" onSubmit={submit}>
            <label className="field">
              昵称（可选）
              <input
                name="nickname"
                type="text"
                placeholder="例如：Miao"
                value={formState.nickname}
                maxLength={40}
                onChange={(event) => setFormState((current) => ({ ...current, nickname: event.target.value }))}
              />
              {errors.nickname ? <span className="field-error">{errors.nickname}</span> : null}
              <small className="field-note">不填也可以。</small>
            </label>

            <label className="field">
              出生年份
              <input
                name="birthdayYear"
                type="number"
                inputMode="numeric"
                min={USER_SETTINGS_MIN_BIRTH_YEAR}
                max={new Date().getFullYear()}
                value={formState.birthdayYear}
                onChange={(event) => setFormState((current) => ({ ...current, birthdayYear: event.target.value }))}
              />
              {errors.birthdayYear ? <span className="field-error">{errors.birthdayYear}</span> : null}
              <small className="field-note">只用于估算人生进度，不是寿命预测。</small>
            </label>

            <label className="field">
              预期寿命（岁）
              <input
                name="lifeExpectancy"
                type="number"
                inputMode="numeric"
                min={USER_SETTINGS_MIN_EXPECTANCY}
                max={USER_SETTINGS_MAX_EXPECTANCY}
                value={formState.lifeExpectancy}
                onChange={(event) => setFormState((current) => ({ ...current, lifeExpectancy: event.target.value }))}
              />
              {errors.lifeExpectancy ? <span className="field-error">{errors.lifeExpectancy}</span> : null}
              <small className="field-note">用于更新进度比例线。</small>
            </label>

            <fieldset className="field field--check">
              <label>
                <input
                  type="checkbox"
                  checked={formState.showLifeProgress}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, showLifeProgress: event.target.checked }))
                  }
                />
                显示估算人生进度
              </label>
              <small className="field-note">你可以随时在设置里关闭。</small>
            </fieldset>

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
                同意后，仅发送本次记录中已填写的心情/能量/标签/备注；本地有规则回应，AI 失败不影响保存。
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
                允许匿名分析
              </label>
              <small className="field-note">用于改进功能稳定性，不包含正文内容。</small>
            </fieldset>

            <div className="form-actions">
              <Button type="submit" disabled={saving}>
                {saving ? '保存并进入首页…' : '开始设置'}
              </Button>
            </div>
          </form>
        )}

        {message ? <p className="form-message">{message}</p> : null}
      </section>
    </MainLayout>
  );
}
