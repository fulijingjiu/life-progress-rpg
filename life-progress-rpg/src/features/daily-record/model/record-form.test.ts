import { describe, expect, it } from 'vitest';
import { buildFormPayloadForDate, buildRecordFormFromRecord, initialRecordForm } from './record-form';

describe('record form model', () => {
  it('uses explicit local date in payload', () => {
    const payload = buildFormPayloadForDate(
      {
        ...initialRecordForm,
        mood: 3,
        energy: 7,
        content: '今天跑步 30 分钟',
        tagsText: '运动, 健身',
        reflection: '今天不错',
        useAiReflection: true,
      },
      '2025-12-01'
    );

    expect(payload.localDate).toBe('2025-12-01');
    expect(payload.reflectionSource).toBe('ai');
  });

  it('maps life record into editable form values', () => {
    const input = {
      id: 'r1',
      userId: 'u1',
      localDate: '2025-11-21',
      mood: 5 as const,
      energy: 9 as const,
      content: '会议复盘完成',
      tags: ['会议', '复盘'],
      reflection: '今天状态很好',
      reflectionSource: 'rules' as const,
      reflectionStatus: 'completed' as const,
      createdAt: '2025-11-21T00:00:00.000Z',
      updatedAt: '2025-11-21T00:00:00.000Z',
    };

    const form = buildRecordFormFromRecord(input);

    expect(form).toEqual({
      mood: 5,
      energy: 9,
      content: '会议复盘完成',
      tagsText: '会议, 复盘',
      reflection: '今天状态很好',
      useAiReflection: false,
    });
  });
});
