import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose: string;
}

interface ManifestPayload {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: string;
  orientation: string;
  background_color: string;
  theme_color: string;
  icons: ManifestIcon[];
}

const FALLBACK_THEME_COLOR = '#00D1C9';
const FALLBACK_BG_COLOR = '#FFFFFF';
const PLATFORM_LOGO = '/logo.png';

function buildIcons(logoUrl: string | null | undefined, slug: string): ManifestIcon[] {
  const base = logoUrl && logoUrl.length > 0 ? logoUrl : PLATFORM_LOGO;
  // Supabase Storage / many image CDNs accept ?w= / ?h= / ?fit= query params for transforms.
  // We append a cache-buster per slug so each merchant's manifest has its own fingerprint.
  return [
    {
      src: `${base}?w=192&h=192&fit=crop&q=90&s=${encodeURIComponent(slug)}`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: `${base}?w=512&h=512&fit=crop&q=90&s=${encodeURIComponent(slug)}`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug' },
      { status: 400, headers: { 'Cache-Control': 'no-cache' } }
    );
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase env not configured' },
        { status: 500, headers: { 'Cache-Control': 'no-cache' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: catalog, error } = await supabase
      .from('catalogs')
      .select('name, display_name, slogan, logo_url, theme')
      .eq('name', slug)
      .maybeSingle();

    if (error) {
      console.error('[manifest] supabase error:', error.message);
    }

    const displayName = (catalog?.display_name as string | null) || (catalog?.name as string | null) || slug;
    const slogan = (catalog?.slogan as string | null) || 'كتالوج إلكتروني';
    const logoUrl = (catalog?.logo_url as string | null) || null;

    const payload: ManifestPayload = {
      name: displayName,
      short_name: displayName,
      description: slogan,
      start_url: `/${slug}`,
      scope: `/${slug}/`,
      display: 'standalone',
      orientation: 'portrait-primary',
      background_color: FALLBACK_BG_COLOR,
      theme_color: FALLBACK_THEME_COLOR,
      icons: buildIcons(logoUrl, slug),
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'Content-Type': 'application/manifest+json; charset=utf-8',
      },
    });
  } catch (err) {
    console.error('[manifest] unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500, headers: { 'Cache-Control': 'no-cache' } }
    );
  }
}
