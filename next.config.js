/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Usa un directorio de salida nuevo para evitar que el preview reutilice chunks huérfanos de .next.
  distDir: ".next-v0",
};

module.exports = nextConfig;
