import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/app/layouts/MainLayout';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { recordRepository, type RecordRepository } from '@/data/repositories/record-repository';
import { DEFAULT_USER_ID, type LifeRecord } from '@/domain/records/records.types';

type HistoryState = {
  loading: boolean;
  deleting: boolean;
  error: string;
};

function useHistoryRecords(repository: RecordRepository) {
  const [records, setRecords] = useState<LifeRecord[]>([]);
  const [state, setState] = useState<HistoryState>({ loading: true, deleting: false, error: '' });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const items = await repository.listRecentByUser(DEFAULT_USER_ID);
      setRecords(items);
      setState((current) => ({ ...current, loading: false }));
    } catch {
      setState((current) => ({ ...current, loading: false, error: '加载历史记录失败，请稍后重试。' }));
    }
  }, [repository]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteRecord = useCallback(
    async (record: LifeRecord) => {
      if (state.deleting) {
        return;
      }

      const yes = window.confirm(`是否删除 ${record.localDate} 的记录？删除后不可恢复。`);
      if (!yes) {
        return;
      }

      setState((current) => ({ ...current, deleting: true, error: '' }));
      try {
        await repository.deleteById(record.id);
        await load();
      } catch {
        setState((current) => ({ ...current, error: '删除失败，请稍后重试。' }));
      } finally {
        setState((current) => ({ ...current, deleting: false }));
      }
    },
    [load, repository, state.deleting]
  );

  return {
    records,
    state,
    load,
    deleteRecord,
  };
}

function summarizeRecord(record: LifeRecord): string {
  if (record.content && record.content.trim()) {
    const trimmed = record.content.trim();
    return trimmed.length > 62 ? `${trimmed.slice(0, 62)}…` : trimmed;
  }

  if (record.tags.length > 0) {
    return `标签：${record.tags.join(' / ')}`;
  }

  return '无备注内容。';
}

export function HistoryPage() {
  const { records, state, load, deleteRecord } = useHistoryRecords(recordRepository);

  return (
    <MainLayout>
      <section>
        <SectionTitle
          title="历史记录"
          description="查看近 30 条历史，支持编辑与删除；同一日期只保留一条记录。"
        />

        <div className="home-card">
          {state.loading ? <p className="muted">正在加载历史记录…</p> : null}

          {state.deleting && !state.loading ? (
            <p className="muted" role="status">
              删除中…
            </p>
          ) : null}

          {state.error ? <p className="field-error" role="alert">{state.error}</p> : null}

          {!state.loading && !state.error && records.length === 0 ? (
            <div>
              <p>还没有历史记录。</p>
              <p className="settings-meta">先从首页或记录页开始保存第一条，先有数据才能查看历史。</p>
              <div className="home-actions">
                <Link className="btn" to="/record">
                  记录今天
                </Link>
              </div>
            </div>
          ) : null}

          {!state.loading && !state.error && records.length > 0 ? (
            <ul className="history-list" aria-live="polite">
              {records.map((record) => (
                <li key={record.id} className="history-item">
                  <div className="history-item__summary">
                    <div className="history-item__title">{record.localDate}</div>
                    <p>心情 {record.mood}，活力 {record.energy}</p>
                    <p>{summarizeRecord(record)}</p>
                  </div>

                  <div className="history-item__actions">
                    <Link className="btn btn--ghost" to={`/record/${record.localDate}`}>
                      编辑
                    </Link>
                    <button
                      type="button"
                      className="btn btn--danger"
                      disabled={state.deleting}
                      onClick={() => deleteRecord(record)}
                    >
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="home-actions" style={{ marginTop: records.length === 0 ? 0 : 12 }}>
            <button type="button" className="btn btn--ghost" onClick={load}>
              重新加载
            </button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
