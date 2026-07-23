import { LifeRecord } from './records.types';

const MOOD_TEXT: Record<number, string> = {
  1: '情绪较低，需要更慢一点。',
  2: '情绪一般，节奏有些紧。',
  3: '今天状态稳定，可继续保持。',
  4: '状态不错，适合推进一件事。',
  5: '状态很好，今天更容易形成惯性。',
};

export function buildLocalReflection(record: Pick<LifeRecord, 'mood' | 'energy' | 'tags' | 'content'>): string {
  const moodHint = MOOD_TEXT[record.mood] ?? '今天有自己的节奏。';
  if (record.tags.length > 0) {
    return `${moodHint} 今日聚焦：${record.tags.join(' / ')}。`;
  }
  if (record.content && record.content.trim()) {
    return `${moodHint} 有一句可复盘内容：${record.content.trim().slice(0, 20)}。`;
  }
  return `${moodHint} 如果想稳定回访，可以把备注补充为 1~2 句话。`;
}
