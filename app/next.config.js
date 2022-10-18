/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['nutflix-thumbnails.ap-south-1.linodeobjects.com'],
  },
}

module.exports = nextConfig
