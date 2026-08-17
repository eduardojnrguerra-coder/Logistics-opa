import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/reset-password", "/auth/callback", "/unauthorized"];

// Refreshes the Supabase session on every request and turns away anonymous
// traffic before it reaches a page.
//
// The redirect has to happen here rather than in a layout: layouts and pages
// render in parallel, so a page's data fetch would already have run (and
// thrown a raw "permission denied" from RLS) before a layout-level redirect
// took effect. Which app a signed-in user belongs to — ops, driver, or
// customer portal — is still decided in the layouts, since that needs a
// profile lookup that does not belong on every request.
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!user && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
