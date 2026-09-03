/** @type {import('next').NextConfig} */
const nextConfig = {
  // libreoffice-convert / docxtemplater use Node APIs (fs, child_process),
  // so make sure this route always runs in the Node.js runtime, not the Edge runtime.
  experimental: {
    serverComponentsExternalPackages: ['docxtemplater', 'pizzip', 'libreoffice-convert'],
  },
};

module.exports = nextConfig;
