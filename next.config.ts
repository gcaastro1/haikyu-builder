import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'shoewxzvditgoacdpena.supabase.co' },
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
