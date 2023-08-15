export const NEWS_MAX_TITLE_LENGTH = 255;
export const NEWS_MAX_CONTENT_LENGTH = 10000;

export enum NewsType {
  General = 'general',
  Activity = 'activity',
}

export const newsTypes = Object.values(NewsType);

export enum NewsContentFormat {
  Plaintext = 'plaintext',
  Delta = 'delta',
}

export const newsContentFormats = Object.values(NewsContentFormat);
