import { format } from 'date-fns';

export const toLocalDate = (date: Date = new Date()): string => {
  return format(date, 'yyyy-MM-dd');
};
