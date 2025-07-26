import { format } from 'date-fns';

export class DateHelper {
  static formatYYYYMMDD(date: Date): string {
    return format(date, 'yyyy/MM/dd');
  }
}
