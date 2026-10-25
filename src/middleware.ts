// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define role-based routes
const roleRoutes: Record<string, string[]> = {
  SuperAdmin: ["/superadmin", "/superadmin/users", "/superadmin/project", "/superadmin/basedata", "/superadmin/tasks/", "/superadmin/log", "/superadmin/userLog", "/settings"],
  ProjectManager: ["/projectmanager", "/projectmanager/project", "/projectmanager/setting", "/settings", "/help"],
  Facilitator: ["/facilitator", "/facilitator/tasks", "/settings", "/help"],
  Reviewer: ["/reviewer", "/reviewer/tasks", "/settings", "/help"],
};

// Add "/tasks" route to allowed paths for relevant roles


// Define public routes that don't require authentication
const publicRoutes = ['/linkForm', "/login"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;


    // Allow access to public routes without authentication
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    const userRole = req.nextauth.token?.role as keyof typeof roleRoutes | null;

    if (req.nextauth.token?.must_change_password && pathname !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", req.url));
    }
    if (userRole && pathname === "/change-password") return NextResponse.next();

    // If user is not authenticated, redirect to login
    if (!userRole) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Handle login page redirect for authenticated users
    if (pathname === "/login") {
      const defaultRoute = roleRoutes[userRole][0] || "/"; // Fallback to first allowed route
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    // Check if user has access to the requested path
    const allowedPaths = roleRoutes[userRole] || [];
    const hasAccess = allowedPaths.some((path) => {
      // Ensure both "/tasks" and "/tasks/" match subpaths like "/tasks/13c4..."
      if (path === "/") return pathname === "/";
      return pathname === path || pathname.startsWith(path.endsWith("/") ? path : path + "/");
    });

    // Redirect unauthorized users to their default route
    if (!hasAccess) {
      const defaultRoute = roleRoutes[userRole][0] || "/login";
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow public routes without authentication
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // For protected routes, require a valid token
        return !!token && !!token.role;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
  }
);



export const config = {
  matcher: [
    
    "/((?!api|_next/static|_next/image|favicon.ico|login|linkForm|contact|.*\\..*).*)"
  ]
};
