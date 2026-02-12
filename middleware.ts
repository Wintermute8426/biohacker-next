import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    'https://egyflvqtijzbkydmgafh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVneWZsdnF0aWp6Ymt5ZG1nYWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NzE3NTQsImV4cCI6MjA4NjE0Nzc1NH0.jX4FqyHeTe1Z5-lhiVtb8IdSy9w4Ht9_p7J-3x_Waq4',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Skip auth check for auth routes
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return supabaseResponse;
  }

  // Protect /app routes
  if (!user && request.nextUrl.pathname.startsWith("/app")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
