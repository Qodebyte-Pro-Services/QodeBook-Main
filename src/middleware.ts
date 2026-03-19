import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getRequiredPermissions } from "./models/types/constants/route-permissions";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("authToken")?.value;
  const staffRolesCookie = request.cookies.get("staff_roles")?.value;
  const { pathname } = request.nextUrl;

  // All the public routes (auth pages) -> so basically both the admin and staff dey included here
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify-otp-code") ||
    pathname.startsWith("/verify-code") ||
    pathname.startsWith("/verify-otp-password") ||
    pathname.startsWith("/staff/login") ||
    pathname.startsWith("/staff/verify") ||
    pathname.startsWith("/plans") ||
    pathname === "/unauthorized";


  const isProtectedRoute = !isAuthRoute && 
    !pathname.startsWith("/_next") && 
    !pathname.startsWith("/api") && 
    !pathname.startsWith("/vercel.png") &&
    !pathname.includes("."); // Exclude files with extensions (static assets)

  // 1. If no authToken and trying to access a protected route -> redirect to login
  if (!authToken && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authToken exists and trying to access auth routes -> redirect to dashboard (/)
  if (authToken && isAuthRoute && pathname !== "/unauthorized") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Permission Validation for Staff
  if (authToken && isProtectedRoute && staffRolesCookie) {
    try {
      const staffRoles = JSON.parse(staffRolesCookie);
      const userPermissions: string[] = staffRoles.permissions || [];
      const requiredPermissions = getRequiredPermissions(pathname);

      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some(permission => 
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      }
    } catch (error) {
      console.error("Error parsing staff_roles cookie:", error);
      // If parsing fails, we might want to redirect to login or just let it through
      // For safety, redirected to unauthorized if it's a protected route
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - vercel.png (vercel file)
     * - static files (e.g. .svg, .png, .jpg, etc)
     */
    "/((?!api|_next/static|_next/image|vercel.png|.*\\..*).*)",
  ],
};
