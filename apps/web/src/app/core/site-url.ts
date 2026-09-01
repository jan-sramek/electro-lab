import { BUILD_SITE_ORIGIN } from './build-site-origin';

export function siteOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return BUILD_SITE_ORIGIN.replace(/\/$/, '');
}

export function absoluteSiteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const origin = siteOrigin();
  return origin ? `${origin}${normalized}` : normalized;
}
