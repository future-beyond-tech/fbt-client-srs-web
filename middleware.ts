import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/vehicles", "/sales", "/search"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token");
  if (token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/vehicles/:path*", "/sales/:path*", "/search/:path*"],
};
