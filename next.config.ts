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
    // Server URL resolution: NEXT_BACKEND_URL (.env) → API_URL → local.
    const api =
      process.env.NEXT_BACKEND_URL ??
      process.env.API_URL ??
      "http://localhost:5000";
    return [{ source: "/backend/:path*", destination: `${api}/:path*` }];
  },
};

export default nextConfig;
