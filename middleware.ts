import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/home",
  "/battles",
  "/practice",
  "/contests",
  "/leaderboard",
  "/profile",
  "/progress",
  "/achievements",
  "/settings",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (accessToken) {
    return NextResponse.next();
  }

  if (refreshToken) {
    try {
      const refreshRes = await fetch(
        new URL("/backend/api/v1/auth/refresh", req.url),
        {
          method: "POST",
          headers: { Cookie: `refreshToken=${refreshToken}` },
        }
      );

      if (refreshRes.ok) {
        const response = NextResponse.next();
        const setCookies = refreshRes.headers.getSetCookie?.() ?? [];
        for (const c of setCookies) {
          response.headers.append("set-cookie", c);
        }
        return response;
      }
    } catch (err) {
      console.error("Middleware refresh failed:", err);
    }
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/home/:path*",
    "/battles/:path*",
    "/practice/:path*",
    "/contests/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
    "/progress/:path*",
    "/achievements/:path*",
    "/settings/:path*",
  ],
};