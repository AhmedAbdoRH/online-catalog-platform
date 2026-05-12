export const STATIC_ASSET_VERSION = '20260510-2';

export function versionedAsset(path: string) {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}v=${STATIC_ASSET_VERSION}`;
}
