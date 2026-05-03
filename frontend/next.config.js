/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['192.168.1.104', 'localhost', '127.0.0.1'],
  images: {
    unoptimized: true,
  },
}
module.exports = nextConfig
