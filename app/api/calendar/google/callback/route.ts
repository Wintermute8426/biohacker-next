import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // This is the user ID
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/app/calendar?error=oauth_denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/app/calendar?error=invalid_callback`);
  }

  const supabase = await createClient();

  // Verify user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user || user.id !== state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/app/calendar?error=unauthorized`);
  }

  // Exchange code for tokens
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/calendar/google/callback`;

  if (!clientId || !clientSecret) {
    console.error("Missing Google OAuth credentials");
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/app/calendar?error=config_error`);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const tokens = await tokenResponse.json();

    // Get user's Google account info
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    // Calculate token expiry
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expires_in);

    // Store connection in database
    const { error: dbError } = await supabase
      .from("calendar_connections")
      .upsert({
        user_id: user.id,
        provider: "google",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: expiryDate.toISOString(),
        calendar_email: userInfo.email,
        calendar_name: userInfo.name,
        sync_enabled: true,
        sync_status: "active",
        last_sync_at: null,
        sync_error: null,
      }, {
        onConflict: "user_id,provider",
      });

    if (dbError) {
      console.error("Failed to store calendar connection:", dbError);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/app/calendar?error=db_error`);
    }

    // Success - redirect back to calendar
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/app/calendar?success=google_connected`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/app/calendar?error=token_exchange_failed`);
  }
}
