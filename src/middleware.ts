import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Reviewer role has access only to moderation. Admin has access to all.
    if (path.startsWith("/admin/moderation")) {
      if (token?.role !== "admin" && token?.role !== "reviewer") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } else if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // A user is authorized if they have a token (are logged in)
    },
  }
);

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*", "/profile", "/wallet", "/create/:path*"], // Protect admin, profile, wallet, create pages
};
