export const WHEP_URL = process.env.WHEP_URL as string;

export const NOTIFICATION_BUS_URL = new URL(
  process.env.NOTIFICATION_BUS_URL as string,
);

export const FILE_STORAGE_URL = new URL(process.env.FILE_STORAGE_URL as string);
