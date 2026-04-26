/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  transpilePackages: ['three'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glb$/,
      type: 'asset/resource',
    })
    return config
  },
}

export default nextConfig
