import { type LifeRecord, type ReflectionFeedback } from '@/domain/records/records.types';
import { Button } from '@/shared/ui/Button';
import { toLocalDate } from '@/domain/dates/local-date';
import { useMemo, useState } from 'react';
import { useSaveRecord } from '../hooks/useSaveRecord';
import { EnergySlider } from './EnergySlider';
import { MoodSelector } from './MoodSelector';
import { buildRecordFormFromRecord } from '../model/record-form';

type FeedbackButton = {
  key: ReflectionFeedback;
  label: string;
  description: string;
};

type RecordSheetProps = {
  localDate?: string;
  initialRecord?: LifeRecord;
};

const feedbackOptions: FeedbackButton[] = [
  { key: 'helpful', label: '有帮助', description: '回答对我有帮助' },
  { key: 'not_helpful', label: '没帮助', description: '对我帮助不大' },
  { key: 'inaccurate', label: '事实不准确', description: '有误或不符合当日情况' },
];

const describeSource = (source: LifeRecord['reflectionSource'], status: LifeRecord['reflectionStatus']): string => {
  if (status === 'pending') {
    return 'AI 整理中…';
  }
  if (source === 'ai') {
    return status === 'failed'
      ? 'AI 整理已尝试，当前为本地 fallback（仅作可核对回应）'
      : 'AI 整理';
  }
  return '本地回复';
};

export function RecordSheet({ localDate, initialRecord }: RecordSheetProps) {
  const selectedDate = localDate ?? toLocalDate();
  const isToday = selectedDate === toLocalDate();

  const initialValues = useMemo(
    () => (initialRecord ? buildRecordFormFromRecord(initialRecord) : undefined),
    [initialRecord]
  );

  const initialValuesKey = initialRecord
    ? `${initialRecord.id}:${initialRecord.updatedAt}`
    : `new:${selectedDate}`;

  const {
    formState,
    setField,
    submit,
    status,
    message,
    savedRecord,
    setReflectionFeedback,
    isAiAllowed,
  } = useSaveRecord({
    localDate: selectedDate,
    initialValues,
    initialValuesKey,
    initialRecord,
  });

  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const currentRecord = savedRecord ?? initialRecord;
  const canSendFeedback = currentRecord && currentRecord.reflectionStatus !== 'pending';

  const submitDisabled = status === 'saving' || status === 'reflecting';

  const onFeedback = async (feedback: ReflectionFeedback) => {
    if (!currentRecord || feedbackSaving || !canSendFeedback) {
      return;
    }

    setFeedbackSaving(true);
    setFeedbackMessage('');

    const nextFeedback = currentRecord.reflectionFeedback === feedback ? undefined : feedback;
    try {
      await setReflectionFeedback(currentRecord, nextFeedback);
      setFeedbackMessage('评价已保存。');
    } catch {
      setFeedbackMessage('评价保存失败，请重试。');
    } finally {
      setFeedbackSaving(false);
    }
  };

  return (
    <form className="record-form" onSubmit={submit}>
      <p>{isToday ? '今日' : '历史'}日期：{selectedDate}</p>
      <MoodSelector
        value={formState.mood}
        onChange={(value) => setField('mood', value)}
      />
      <EnergySlider
        value={formState.energy}
        onChange={(value) => setField('energy', value)}
      />
      <label className="field">
        标签（逗号分隔）
        <input
          type="text"
          value={formState.tagsText}
          placeholder="如：读书, 运动"
          onChange={(event) => setField('tagsText', event.target.value)}
        />
      </label>
      <label className="field">
        备注（可选）
        <textarea
          value={formState.content}
          rows={3}
          onChange={(event) => setField('content', event.target.value)}
        />
      </label>
      <label className="field inline">
        <input
          type="checkbox"
          checked={formState.useAiReflection}
          onChange={(event) => setField('useAiReflection', event.target.checked)}
          disabled={isToday === false || !isAiAllowed}
        />
        {isToday ? '允许 AI 生成当日一句回应' : '只在当日可提交 AI 整理'}
      </label>
      {isToday && !isAiAllowed ? <p className="field-note">AI 同意未开启时仅使用本地回应，仍可保存记录。</p> : null}

      {currentRecord?.reflection ? (
        <section className="settings-group" aria-label="当日回应">
          <h3>当日回应</h3>
          <p className="field-note">{describeSource(currentRecord.reflectionSource, currentRecord.reflectionStatus)}</p>
          <p>{currentRecord.reflection}</p>

          {canSendFeedback ? (
            <>
              <p>这条回应对你有帮助吗？（仅用于本地质量回测）</p>
              <div className="segmented" role="group" aria-label="回应质量反馈">
                {feedbackOptions.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`chip ${currentRecord.reflectionFeedback === item.key ? 'chip--active' : ''}`}
                    disabled={feedbackSaving || !canSendFeedback}
                    onClick={() => onFeedback(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <small className="field-note">选择含义：{feedbackOptions.find((item) => item.key === currentRecord.reflectionFeedback)?.description ?? '未选择'}</small>
            </>
          ) : null}
        </section>
      ) : null}

      <Button type="submit" className={submitDisabled ? 'btn--disabled' : ''} disabled={submitDisabled}>
        {submitDisabled
          ? status === 'reflecting'
            ? '生成中…'
            : '保存中…'
          : isToday
            ? '保存今日记录'
            : '保存该日记录'}
      </Button>
      {message ? <p>{message}</p> : null}
      {feedbackMessage ? <p className="field-note">{feedbackMessage}</p> : null}
    </form>
  );
}
