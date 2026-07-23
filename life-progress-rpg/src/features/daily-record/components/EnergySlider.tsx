import { type EnergyValue } from '@/domain/records/records.types';

type EnergySliderProps = {
  value: EnergyValue | '';
  onChange: (value: EnergyValue) => void;
};

export function EnergySlider({ value, onChange }: EnergySliderProps) {
  return (
    <label className="field">
      <span>活力</span>
      <input
        type="range"
        min={0}
        max={10}
        value={value === '' ? 5 : value}
        onChange={(event) => onChange(Number(event.target.value) as EnergyValue)}
      />
      <div>当前值：{value === '' ? '待选择' : value}</div>
    </label>
  );
}
