import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const host = request.headers.get("host") || "";
  
  const parts = host.split(".");
  
  // Check if there's a subdomain (e.g., johnfitness.trainova.com)
  // Main domain = trainova.com (2 parts) or www.trainova.com (3 parts with www)
  const isMainDomain = parts.length <= 2 || parts[0] === "www";
  
  if (!isMainDomain) {
    const subdomain = parts[0];
    const path = url.pathname;
    
    // Rewrite coach subdomain to /coach/[slug] route
    const newPath = `/coach/${subdomain}${path === "/" ? "" : path}`;
    url.pathname = newPath;
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
