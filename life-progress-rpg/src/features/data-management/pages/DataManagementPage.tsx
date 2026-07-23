import { ChangeEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/app/layouts/MainLayout';
import { toLocalDate } from '@/domain/dates/local-date';
import { SectionTitle } from '@/shared/ui/SectionTitle';
import { Button } from '@/shared/ui/Button';
import { DEFAULT_USER_ID, type LifeRecord } from '@/domain/records/records.types';
import { parseDataManagementBackup, type DataManagementImportParseResult } from '@/domain/data-management/data-management-bundle';
import { dataManagementRepository } from '@/data/repositories/data-management-repository';

type ActionState = 'idle' | 'exporting' | 'importing' | 'clearing';

const formatDateTime = (value: string): string => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const formatRecordsPreview = (records: LifeRecord[]): string => {
  if (records.length === 0) {
    return '无历史记录';
  }

  const top = records.slice(0, 5).map((item) => `${item.localDate}(m${item.mood},e${item.energy})`);
  return `${top.join(' / ')}${records.length > 5 ? `…共 ${records.length} 条` : ''}`;
};

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(String(reader.result ?? ''));
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsText(file);
  });

export function DataManagementPage() {
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [message, setMessage] = useState('');
  const [importPlan, setImportPlan] = useState<DataManagementImportParseResult | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [selectedFileName, setSelectedFileName] = useState('');

  const isBusy = actionState !== 'idle';

  const exportData = async () => {
    setActionState('exporting');
    setMessage('正在导出…');

    try {
      const payload = await dataManagementRepository.exportAll(DEFAULT_USER_ID);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `life-progress-rpg-backup-${toLocalDate(new Date())}.json`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage(`导出完成：${payload.records.length} 条记录已导出。`);
    } catch {
      setMessage('导出失败，请稍后重试。');
    } finally {
      setActionState('idle');
    }
  };

  const parseImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    setMessage('正在校验导入文件…');
    setImportErrors([]);
    setImportWarnings([]);
    setImportPlan(null);

    try {
      const text = await readFileAsText(file);
      const result = parseDataManagementBackup(text, DEFAULT_USER_ID);
      if (!result.ok) {
        setImportErrors(result.errors);
        setMessage('校验失败：请修复文件后重试。');
        return;
      }

      setImportPlan(result);
      setImportWarnings(result.warnings);
      setMessage(`校验通过：来源 ${result.value.sourceUserId}，${result.preview.recordCount} 条记录可导入。`);
    } catch {
      setImportErrors(['文件读取失败']);
      setMessage('校验失败：文件不可读。');
    }
  };

  const importData = async () => {
    if (!importPlan || !importPlan.ok) {
      return;
    }

    if (
      !window.confirm('即将覆盖当前本地全部设置与历史记录，且无法自动回退，是否继续？') ||
      !window.confirm('请再次确认：我确认要覆盖当前数据，并知悉此操作后不可一键恢复。')
    ) {
      return;
    }

    setActionState('importing');
    setMessage('正在导入…');
    setImportErrors([]);

    try {
      await dataManagementRepository.importFromBackupJson(DEFAULT_USER_ID, JSON.stringify(importPlan.value));
      setMessage(`导入成功：已替换为 ${importPlan.value.records.length} 条记录。`);
      setImportPlan(null);
      setImportWarnings([]);
      setSelectedFileName('');
    } catch (error) {
      const reason = error instanceof Error ? error.message : '导入失败';
      setImportErrors([reason]);
      setMessage('导入失败，请检查错误后重试。');
    } finally {
      setActionState('idle');
    }
  };

  const clearData = async () => {
    if (
      !window.confirm('此操作将清空本地设置与所有历史记录，且不可恢复。是否继续？') ||
      !window.confirm('请再次确认：我知悉当前数据将被清空，且无法恢复。')
    ) {
      return;
    }

    setActionState('clearing');
    setMessage('清空中…');

    try {
      await dataManagementRepository.clearAllData(DEFAULT_USER_ID);
      setMessage('已清空全部本地数据。');
      setImportPlan(null);
      setImportErrors([]);
      setImportWarnings([]);
      setSelectedFileName('');
    } catch {
      setMessage('清空失败，请稍后重试。');
    } finally {
      setActionState('idle');
    }
  };

  const plan = importPlan?.ok ? importPlan : null;

  return (
    <MainLayout>
      <section>
        <SectionTitle
          title="数据管理"
          description="导出、导入与清空本地数据：支持预览与校验，导入与清空都需要二次确认。"
        />

        <section className="settings-group" aria-label="导出功能">
          <h3>导出 JSON</h3>
          <p>将当前“设置 + 历史记录”导出为本地文件，用于备份或迁移。</p>
          <div className="home-actions">
            <Button onClick={exportData} disabled={isBusy}>
              {isBusy && actionState === 'exporting' ? '导出中…' : '导出我的数据'}
            </Button>
          </div>
        </section>

        <section className="settings-group" aria-label="导入功能">
          <h3>导入 JSON</h3>
          <p>先校验再导入：检查格式、schema、字段与日期；合格后才可导入。</p>
          <input type="file" accept="application/json,.json" onChange={parseImportFile} disabled={isBusy} />
          {selectedFileName ? <small className="field-note">已选择：{selectedFileName}</small> : null}

          {plan ? (
            <div className="data-management-preview">
              <p>格式：{plan.value.format}</p>
              <p>来源用户：{plan.value.sourceUserId}</p>
              <p>导出时间：{formatDateTime(plan.value.exportedAt)}</p>
              <p>Schema：v{plan.preview.schemaVersion}</p>
              <p>
                记录区间：{plan.preview.dateFrom || '-'} 到 {plan.preview.dateTo || '-'}
              </p>
              <p>样例：{formatRecordsPreview(plan.value.records)}</p>

              {importWarnings.length > 0 ? (
                <div>
                  <p className="field-note">提示：{importWarnings.join('；')}</p>
                </div>
              ) : null}

              <div className="home-actions">
                <Button onClick={importData} disabled={isBusy}>
                  {isBusy && actionState === 'importing' ? '导入中…' : `确认导入并覆盖（${plan.value.records.length}条）`}
                </Button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="settings-group" aria-label="清空功能">
          <h3>清空数据</h3>
          <p>清空后将删除当前用户的设置与全部历史记录。建议先导出再执行。</p>
          <div className="home-actions">
            <Button className="btn btn--danger" onClick={clearData} disabled={isBusy}>
              {isBusy && actionState === 'clearing' ? '清空中…' : '清空全部本地数据'}
            </Button>
          </div>
        </section>

        <section className="settings-group" aria-label="返回">
          <h3>返回</h3>
          <Link className="btn btn--ghost" to="/settings">
            返回设置
          </Link>
        </section>

        {importErrors.length > 0 ? (
          <div className="form-message" role="alert">
            {importErrors.map((item) => (
              <p className="field-error" key={item}>
                {item}
              </p>
            ))}
          </div>
        ) : null}

        {message ? <p className="form-message">{message}</p> : null}
      </section>
    </MainLayout>
  );
}
