import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
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
      {
        protocol: 'https',
        hostname: 'www.aromaespejo.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
