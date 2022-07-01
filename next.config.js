/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['assets.vercel.com', 'cryptologos.cc'],
  },
};

module.exports = nextConfig;
