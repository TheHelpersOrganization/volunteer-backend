import { FileSizeUnit } from '@app/file/constants';
import { ProfileOutputDto } from '@app/profile/dtos';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import path from 'path';

dayjs.extend(utc);
dayjs.extend(tz);

export const requireNonNull = <T>(
  value: T | null | undefined,
  message = 'Value is null',
) => {
  if (value == null) {
    throw new Error(message);
  }
  return value;
};

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

export const parseBooleanString = (str: any) => {
  if (str === 'true') {
    return true;
  }
  if (str === 'false') {
    return false;
  }
  throw new Error('Invalid boolean string');
};

export const rootProjectPath = path.resolve('./');

export const getProfileNameOrNull = (
  profile?: ProfileOutputDto,
): string | undefined => {
  if (!profile) {
    return;
  }
  if (profile.firstName || profile.lastName) {
    return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`;
  }
  if (profile.username) {
    return profile.username;
  }
  return profile.email;
};

export const getProfileName = (profile?: ProfileOutputDto): string => {
  const name = getProfileNameOrNull(profile);
  if (!name) {
    throw new Error('Profile name is null');
  }
  return name;
};

export const normalize = (val: number, max: number, min = 0) => {
  if (max <= min) {
    throw new Error('Max must be greater than min');
  }
  const delta = max - min;
  return (val - min) / delta;
};

export const normalizeArray = (arr: number[], max: number, min = 0) => {
  if (max <= min) {
    throw new Error('Max must be greater than min');
  }
  const delta = max - min;
  return arr.map((val) => (val - min) / delta);
};

export const secondsToHoursMinutesSeconds = (seconds: number) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + (d == 1 ? ' day ' : ' days ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hour ' : ' hours ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minute ' : ' minutes ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
  return `${dDisplay}${hDisplay}${mDisplay}${sDisplay}`.trim();
};
