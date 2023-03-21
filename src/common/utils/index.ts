import * as dayjs from 'dayjs';
import * as tz from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import * as path from 'path';

dayjs.extend(utc);
dayjs.extend(tz);

export function createExceptionErrorCode(str) {
  const raw = toKebabCase(str);
  return raw.replace(/-exception$/, '');
}

export function toKebabCase(str): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function getFileExtension(name: string, full = true) {
  const parts = name.split('.').filter(Boolean);
  if (parts.length == 1) {
    return;
  }
  if (!full) {
    return path.extname(name);
  }
  return parts // removes empty extensions (e.g. `filename...txt`)
    .slice(1)
    .join('.');
}

export const rootProjectPath = path.resolve('./');
