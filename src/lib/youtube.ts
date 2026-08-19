const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
]);

function asVideoId(value: string | undefined | null): string | null {
  if (!value) return null;
  const id = value.trim();
  return YOUTUBE_ID_PATTERN.test(id) ? id : null;
}

/**
 * Extracts a YouTube video ID from common URL formats, or from a raw 11-char ID.
 * Returns null when the input is empty or not a recognized YouTube video link.
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const rawId = asVideoId(trimmed);
  if (rawId) return rawId;

  let parsed: URL;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(withProtocol);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();

  if (host === 'youtu.be') {
    return asVideoId(parsed.pathname.split('/').filter(Boolean)[0]);
  }

  if (!YOUTUBE_HOSTS.has(host)) return null;

  const fromQuery = asVideoId(parsed.searchParams.get('v'));
  if (fromQuery) return fromQuery;

  const parts = parsed.pathname.split('/').filter(Boolean);
  if (parts.length >= 2 && ['embed', 'shorts', 'live', 'v'].includes(parts[0].toLowerCase())) {
    return asVideoId(parts[1]);
  }

  return null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

export function normalizeYouTubeUrl(url: string | null | undefined): string | null {
  if (url == null) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  return extractYouTubeId(trimmed) ? trimmed : null;
}
