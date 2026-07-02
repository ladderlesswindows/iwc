/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://simplewindows.vercel.app',
        permanent: false,
      },
      {
        source: '/simple',
        destination: 'https://simplewindows.vercel.app',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
