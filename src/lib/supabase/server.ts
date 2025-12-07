import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// NOTE:
// In Next.js 15, `cookies()` is an async dynamic API and **must be awaited**
// before using its value. We therefore make `createClient` async and await
// `cookies()` once, then pass the resulting cookieStore into Supabase.
export async function createClient() {
  const cookieStore = await cookies()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const stub = {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        refreshSession: async () => ({ data: null, error: null }),
      },
      from: (_table: string) => {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          order: () => chain,
          neq: () => chain,
          limit: () => chain,
          single: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          maybeSingle: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          insert: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          update: async () => ({ data: null, error: { message: "Supabase not configured" } }),
        }
        return chain
      },
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          remove: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          getPublicUrl: (_path: string) => ({ data: { publicUrl: "" } }),
        }),
      },
    }
    return stub as any
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function createServiceRoleClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (name: string) => {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
