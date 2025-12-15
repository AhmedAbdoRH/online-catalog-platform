import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `qrcode.react` module
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'qrcode.react': false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: (() => {
      const patterns: Array<Record<string, string>> = [
        {
          protocol: 'https',
          hostname: 'placehold.co',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**',
        },
      ];

      // If a Supabase URL is configured in env, add its hostname so storage URLs are allowed
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl) {
          const u = new URL(supabaseUrl);
          patterns.push({ protocol: u.protocol.replace(':', ''), hostname: u.hostname, port: '', pathname: '/**' });
        }
      } catch (e) {
        // ignore malformed env
      }

      return patterns;
    })(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
