import { describe, expect, it } from 'vitest';
import { estimateLifeProgress } from './life-progress';

describe('estimateLifeProgress', () => {
  it('returns a stable estimate for a fixed local date', () => {
    expect(estimateLifeProgress({ birthdayYear: 1990, lifeExpectancy: 85 }, new Date(2026, 0, 1))).toMatchObject({
      estimateAge: 36,
      estimateProgressPercent: 42.4,
    });
  });

  it('clamps invalid ranges', () => {
    expect(estimateLifeProgress({ birthdayYear: 2100, lifeExpectancy: 85 }, new Date(2026, 0, 1)).estimateProgressPercent).toBe(0);
    expect(estimateLifeProgress({ birthdayYear: 1900, lifeExpectancy: 0 }, new Date(2026, 0, 1)).estimateProgressPercent).toBe(0);
  });
});
