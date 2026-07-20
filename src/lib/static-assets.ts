export const STATIC_ASSET_VERSION = '20260720-1';

export function versionedAsset(path: string) {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}v=${STATIC_ASSET_VERSION}`;
}
