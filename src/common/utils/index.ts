import * as dayjs from 'dayjs';
import * as tz from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(tz);

export function createExceptionErrorCode(str) {
  const raw = toKebabCase(str);
  return raw.replace(/-exception$/, '');
}

export function toKebabCase(str): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
