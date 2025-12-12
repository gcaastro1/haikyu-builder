// /next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'shoewxzvditgoacdpena.supabase.co' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@headlessui/react',
      '@dnd-kit/core',
    ],
  },
};

export default nextConfig;
