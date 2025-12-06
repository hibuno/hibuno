import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for upload routes to avoid body parsing issues with large files
  // Auth is handled in the route handlers themselves
  if (pathname.startsWith("/api/admin/upload")) {
    return NextResponse.next();
  }

  // Protect /api/admin routes
  if (pathname.startsWith("/api/admin")) {
    const adminAccess = request.cookies.get("admin_access")?.value;
    const validKey = process.env.ACCESS_KEY;

    if (!validKey || adminAccess !== validKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const response = NextResponse.next();

  // Content Security Policy configuration
  const cspDirectives = [
    // Default source - only allow same origin
    "default-src 'self'",

    // Scripts - allow self, inline scripts (needed for Next.js), and trusted CDNs
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://platform.twitter.com https://gist.github.com",

    // Styles - allow self, inline styles (needed for styled components), and trusted CDNs
    "style-src 'self' 'unsafe-inline'",

    // Images - allow self, data URIs (for inline images), UploadThing, and trusted image sources
    "img-src 'self' data: blob: https: http: https://*.ufs.sh https://*.uploadthing.com",

    // Fonts - allow self and data URIs
    "font-src 'self' data:",

    // Connect sources - allow API calls to self and UploadThing
    "connect-src 'self' https://*.uploadthing.com https://*.ingest.uploadthing.com https://uploadthing.com",

    // Frame sources - allow trusted embed providers
    "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://codepen.io https://platform.twitter.com",

    // Media - allow self, blob URLs, and trusted sources
    "media-src 'self' blob: https://www.youtube.com https://player.vimeo.com https://*.ufs.sh https://*.uploadthing.com",

    // Object and embed - disallow for security
    "object-src 'none'",
    "base-uri 'self'",

    // Form actions - only allow same origin
    "form-action 'self'",

    // Frame ancestors - prevent clickjacking
    "frame-ancestors 'self'",

    // Upgrade insecure requests
    "upgrade-insecure-requests",
  ];

  // Join directives with semicolons
  const csp = cspDirectives.join("; ");

  // Set CSP header
  response.headers.set("Content-Security-Policy", csp);

  // Additional security headers
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
