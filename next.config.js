/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev }) => {
    // Evita que el servidor de desarrollo reutilice chunks huérfanos tras HMR.
    if (dev) config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
