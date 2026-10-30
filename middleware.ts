import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/home", "/app"]; // adjust to your actual protected routes

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // Access token present — let it through, page/layout will verify it
  if (accessToken) {
    return NextResponse.next();
  }

  // No access token but refresh token exists — try silent refresh
  if (refreshToken) {
    try {
      const refreshRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`,
        {
          method: "POST",
          headers: { Cookie: `refreshToken=${refreshToken}` },
        }
      );

      if (refreshRes.ok) {
        const setCookieHeader = refreshRes.headers.get("set-cookie");
        const response = NextResponse.next();

        if (setCookieHeader) {
          // Forward the new accessToken cookie to the browser
          response.headers.append("set-cookie", setCookieHeader);
        }

        return response;
      }
    } catch (err) {
      console.error("Middleware refresh failed:", err);
    }
  }

  // Both tokens missing/invalid — redirect to login
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/home/:path*", "/app/:path*"], 
};