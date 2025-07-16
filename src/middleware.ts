import { authMiddleware } from "@civic/auth/nextjs/middleware"

export default authMiddleware();

export const config = {
  // Only protect specific routes that need authentication
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    // Add other protected routes as needed
    // Do NOT include listings, home page, or other public routes
  ],
} 