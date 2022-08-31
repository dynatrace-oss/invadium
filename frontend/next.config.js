/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  publicRuntimeConfig: {
    backendUrl: process.env.NEXT_BACKEND_API_URL,
  },
};

module.exports = nextConfig;
