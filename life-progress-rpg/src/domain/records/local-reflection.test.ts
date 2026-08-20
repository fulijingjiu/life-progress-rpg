import { describe, expect, it } from 'vitest';
import { buildLocalReflection } from './local-reflection';

describe('buildLocalReflection', () => {
  it('uses tags as the first factual anchor', () => {
    expect(buildLocalReflection({ mood: 4, energy: 7, tags: ['学习', '复盘'], content: '完成了任务' })).toContain(
      '今日聚焦：学习 / 复盘'
    );
  });

  it('uses a trimmed note when there are no tags', () => {
    expect(buildLocalReflection({ mood: 3, energy: 5, tags: [], content: '  完成项目评审  ' })).toContain(
      '完成项目评审'
    );
  });

  it('returns a safe default when no factual text exists', () => {
    expect(buildLocalReflection({ mood: 2, energy: 4, tags: [], content: '' })).toContain('可以把备注补充为');
  });
});
