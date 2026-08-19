const assert = require('assert');

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtube-nocookie.com',
]);

function asVideoId(value) {
  if (!value) return null;
  const id = value.trim();
  return YOUTUBE_ID_PATTERN.test(id) ? id : null;
}

function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const rawId = asVideoId(trimmed);
  if (rawId) return rawId;
  let parsed;
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

const ID = 'dQw4w9WgXcQ';
const cases = [
  [`https://www.youtube.com/watch?v=${ID}`, ID],
  [`https://youtu.be/${ID}`, ID],
  [`https://www.youtube.com/shorts/${ID}`, ID],
  [`https://www.youtube.com/embed/${ID}`, ID],
  [`https://m.youtube.com/watch?v=${ID}`, ID],
  [`https://youtube.com/watch?v=${ID}&t=30s`, ID],
  [`https://youtu.be/${ID}?si=abc`, ID],
  [`www.youtube.com/watch?v=${ID}`, ID],
  [ID, ID],
  ['https://vimeo.com/123', null],
  ['', null],
  ['not a url', null],
];

for (const [input, expected] of cases) {
  assert.strictEqual(extractYouTubeId(input), expected, `Failed for ${input}`);
}

console.log(`youtube helper: ${cases.length} cases passed`);
