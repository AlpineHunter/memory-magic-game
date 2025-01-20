/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true, // 一時的な対処として
  },
  eslint: {
    ignoreDuringBuilds: true, // ESLintエラーを無視
  },
};

module.exports = nextConfig;
