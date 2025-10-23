// /next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shoewxzvditgoacdpena.supabase.co',
      },
    ],
  },
};

export default nextConfig;