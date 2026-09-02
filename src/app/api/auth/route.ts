import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, updateAdminPassword } from "@/lib/db";
import { verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, password, newPassword } = body;

    if (action === "login") {
      const admin = getAdminUser();
      if (username !== admin.username || !verifyPassword(password, admin.passwordHash)) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const token = createSessionToken(username);
      const res = NextResponse.json({ success: true, username });
      res.cookies.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return res;
    }

    if (action === "logout") {
      const res = NextResponse.json({ success: true });
      res.cookies.delete("admin_session");
      return res;
    }

    if (action === "change_password") {
      const sessionCookie = req.cookies.get("admin_session")?.value;
      if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const admin = getAdminUser();
      if (!verifyPassword(password, admin.passwordHash)) {
        return NextResponse.json({ error: "Current password incorrect" }, { status: 400 });
      }

      if (newPassword && newPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      const { newUsername } = body;
      updateAdminPassword(newPassword, newUsername);
      return NextResponse.json({
        success: true,
        message: "Admin credentials updated successfully",
        username: newUsername || admin.username,
      });
    }


    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("admin_session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false });
  }

  const { valid, username } = verifySessionToken(sessionCookie);
  return NextResponse.json({ authenticated: valid, username });
}
