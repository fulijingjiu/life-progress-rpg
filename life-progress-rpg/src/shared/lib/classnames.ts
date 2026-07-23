import { type ClassValue, clsx } from 'clsx';

export function cx(...values: ClassValue[]) {
  return clsx(values);
}
