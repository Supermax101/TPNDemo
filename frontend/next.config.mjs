/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/tpn/:path*',
        destination: 'http://localhost:5002/tpn/:path*',
      },
    ];
  },
};

export default nextConfig;
