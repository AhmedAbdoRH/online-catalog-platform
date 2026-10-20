import { createPublicClient } from "@/lib/supabase/public";

export interface StorefrontMetadata {
    storeName: string;
    slogan: string;
    logoUrl: string | null;
}

interface CacheEntry {
    data: StorefrontMetadata;
    expiresAt: number;
}

// In-memory bounded cache for metadata lookups within the Worker instance.
// Keeps metadata warm without querying Supabase on repeated requests.
const METADATA_CACHE = new Map<string, CacheEntry>();
const METADATA_IN_FLIGHT = new Map<string, Promise<StorefrontMetadata>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL
const MAX_CACHE_ENTRIES = 200;

export async function getStorefrontMetadata(slug: string): Promise<StorefrontMetadata> {
    const normalizedSlug = (slug || "").trim().toLowerCase();
    if (!normalizedSlug) {
        return {
            storeName: "متجر",
            slogan: "كتالوج إلكتروني",
            logoUrl: null,
        };
    }

    const now = Date.now();
    const cached = METADATA_CACHE.get(normalizedSlug);
    if (cached && cached.expiresAt > now) {
        return cached.data;
    }

    const inFlight = METADATA_IN_FLIGHT.get(normalizedSlug);
    if (inFlight) return inFlight;

    const lookup = (async (): Promise<StorefrontMetadata> => {
        let result: StorefrontMetadata = {
            storeName: slug,
            slogan: "كتالوج إلكتروني",
            logoUrl: null,
        };
        let shouldCache = false;

        try {
            const supabase = createPublicClient();
            const { data: catalog, error } = await supabase
                .from("catalogs")
                .select("name, display_name, slogan, logo_url")
                .eq("name", normalizedSlug)
                .maybeSingle();

            if (error) {
                console.warn(`[storefront-metadata] DB error for slug "${slug}":`, error.message);
            } else if (catalog) {
                shouldCache = true;
                result = {
                    storeName: catalog.display_name || catalog.name || slug,
                    slogan: catalog.slogan || "كتالوج إلكتروني",
                    logoUrl: catalog.logo_url || null,
                };
            }
        } catch (err) {
            console.error(`[storefront-metadata] Unexpected error for slug "${slug}":`, err);
        }

        // Do not cache missing rows or transient database failures: a newly created
        // store must not inherit a stale fallback title for the full cache period.
        if (!shouldCache) return result;

        // Prune cache if limit exceeded
        if (METADATA_CACHE.size >= MAX_CACHE_ENTRIES) {
            const firstKey = METADATA_CACHE.keys().next().value;
            if (firstKey) METADATA_CACHE.delete(firstKey);
        }

        METADATA_CACHE.set(normalizedSlug, {
            data: result,
            expiresAt: now + CACHE_TTL_MS,
        });

        return result;
    })();

    METADATA_IN_FLIGHT.set(normalizedSlug, lookup);
    try {
        return await lookup;
    } finally {
        METADATA_IN_FLIGHT.delete(normalizedSlug);
    }
}
