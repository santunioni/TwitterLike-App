/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'static.productionready.io'],
  },
}

module.exports = nextConfig
