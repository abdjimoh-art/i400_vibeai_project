import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      { source: '/admin', destination: '/admin/dashboard', permanent: false },
      { source: '/parent', destination: '/parent/dashboard', permanent: false },
      { source: '/instructor', destination: '/instructor/dashboard', permanent: false },
    ]
  },
};

export default nextConfig;
