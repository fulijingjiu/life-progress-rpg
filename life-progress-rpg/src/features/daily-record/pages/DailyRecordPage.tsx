import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toLocalDate } from '@/domain/dates/local-date';
import { DEFAULT_USER_ID, type LifeRecord } from '@/domain/records/records.types';
import { MainLayout } from '@/app/layouts/MainLayout';
import { RecordSheet } from '../components/RecordSheet';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { recordRepository } from '@/data/repositories/record-repository';

const isValidLocalDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

export function DailyRecordPage() {
  const params = useParams<{ localDate: string }>();
  const navigate = useNavigate();

  const [record, setRecord] = useState<LifeRecord | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const urlDate = params.localDate;
  const resolvedDate = urlDate && isValidLocalDate(urlDate) ? urlDate : toLocalDate();
  const isToday = resolvedDate === toLocalDate();

  useEffect(() => {
    if (urlDate && !isValidLocalDate(urlDate)) {
      navigate('/record', { replace: true });
      return;
    }

    let active = true;
    setLoading(true);
    setError('');
    setRecord(undefined);

    recordRepository
      .getByLocalDate(DEFAULT_USER_ID, resolvedDate)
      .then((value) => {
        if (active) {
          setRecord(value);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError('加载历史记录失败。你可以返回后重试。');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [resolvedDate, urlDate, navigate]);

  return (
    <MainLayout>
      <section>
        <SectionTitle
          title={isToday ? '今天记录' : '历史记录编辑'}
          description={
            isToday
              ? '3 步完成：心情、活力、标签与备注（可选）。'
              : '可修改当前日期的记录内容，再次保存不会创建重复记录。'
          }
        />
        <RecordSheet localDate={resolvedDate} initialRecord={record} />

        {loading ? <p className="muted">正在加载该日数据…</p> : null}
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="home-actions">
          <Link className="btn btn--ghost" to={isToday ? '/' : '/history'}>
            {isToday ? '返回首页' : '返回历史列表'}
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}
