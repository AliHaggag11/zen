import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'gjaqqmiqxnciucgfafky.supabase.co', // Add your Supabase storage domain
      'localhost' // Allow local development
    ],
  },
};

export default nextConfig;
