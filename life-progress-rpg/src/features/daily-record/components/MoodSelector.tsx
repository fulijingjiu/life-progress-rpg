import { type MoodValue } from '@/domain/records/records.types';

type MoodSelectorProps = {
  value: MoodValue | '';
  onChange: (value: MoodValue) => void;
};

const moodLabels: Array<{ value: MoodValue; label: string }> = [
  { value: 1, label: '很差' },
  { value: 2, label: '偏低' },
  { value: 3, label: '一般' },
  { value: 4, label: '不错' },
  { value: 5, label: '很好' },
];

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <fieldset className="field">
      <legend>心情</legend>
      <div className="segmented">
        {moodLabels.map((item) => (
          <button
            type="button"
            key={item.value}
            className={value === item.value ? 'chip chip--active' : 'chip'}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
