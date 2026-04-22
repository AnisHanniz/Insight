import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If the user is trying to access the admin area
    if (path.startsWith("/admin")) {
      // If the user is not an admin, redirect to the home page
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
  matcher: ["/admin/:path*", "/profile"], // Protect admin and profile pages
};
