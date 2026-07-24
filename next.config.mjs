import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Explicitly lock turbopack to this project folder
    root: __dirname, 
  },
  // ... keep any of your other existing config options here
};

export default nextConfig;
