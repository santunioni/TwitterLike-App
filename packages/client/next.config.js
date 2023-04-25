/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'static.productionready.io'],
    unoptimized: true,
  },
  trailingSlash: true,
  transpilePackages: ['@packages/server'],
  output: 'export',
}

module.exports = nextConfig
