export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
export const SITE_NAME = "Universo Soda/Cerati";

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, SITE_URL).toString();
}
export function truncateDescription(value: string, max = 158): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}...`;
}
