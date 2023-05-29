import * as dayjs from 'dayjs';
import * as tz from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import * as path from 'path';
import { FileSizeUnit } from 'src/file/constants';

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

export function getHumanReadableFileSize(size: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  while (size > 1000 && unitIndex < units.length) {
    size /= 1000;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export function normalizeFileSize(size: number): {
  size: number;
  unit: FileSizeUnit;
} {
  const units = Object.values(FileSizeUnit);
  let unitIndex = 0;
  while (size > 1000 && unitIndex < units.length) {
    size /= 1000;
    unitIndex++;
  }
  return { size, unit: units[unitIndex] };
}

export const emptyObjectIfNullish = <T>(obj: T | null | undefined) =>
  obj ?? <T>{};

export const emptyArrayIfNullish = <T>(arr: T | null | undefined) =>
  arr ?? <T>[];

export const throwIfNullish = <T>(
  value: T | null | undefined,
  message = 'Value is null',
) => {
  if (value == null) {
    throw new Error(message);
  }
  return value;
};

export const rootProjectPath = path.resolve('./');
