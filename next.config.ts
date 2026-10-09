import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
  async rewrites() {
    // Same-origin API proxy: browser cookies stay first-party and
    // no CORS preflights are needed in dev or production.
    // Point API_URL at the Express server (default local :5000).
    const api = process.env.API_URL ?? "http://localhost:5000";
    return [{ source: "/backend/:path*", destination: `${api}/:path*` }];
  },
};

export default nextConfig;
