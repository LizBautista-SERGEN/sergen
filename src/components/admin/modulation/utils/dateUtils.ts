
import { format, isAfter } from "date-fns";

export const isDateInFuture = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return isAfter(date, today);
};

export const formatDateToString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};
