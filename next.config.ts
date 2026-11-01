import type { NextConfig } from "next";
import { BACKEND_BASE_URL } from "./lib/backend-url";

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
    // Server URL resolution lives in lib/backend-url.ts so the rewrite,
    // middleware and Server Components can never drift apart.
    return [{ source: "/backend/:path*", destination: `${BACKEND_BASE_URL}/:path*` }];
  },
};

export default nextConfig;
