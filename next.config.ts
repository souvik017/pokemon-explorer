/** @type {import('next').NextConfig} */
const nextConfig = {
   output: 'export',
  reactStrictMode: true,
  transpilePackages: ['@types'], // Helps with type imports
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false, // Set to true only if needed temporarily
  },
  // If using the Pages Router (pages directory)
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  // If using the App Router (app directory)
  // experimental: {
  //   appDir: true,
  // },
  async redirects() {
    return [
      {
        source: '/pokemon',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig