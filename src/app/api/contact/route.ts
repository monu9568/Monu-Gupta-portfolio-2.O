import { NextRequest, NextResponse } from "next/server";
import { saveMessage, getMessages, updateMessageStatus, deleteMessage } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

// In-memory rate limiting tracker (IP -> timestamp[])
const rateLimitMap = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const recent = timestamps.filter((t) => now - t < 60000); // 1 minute window

    if (recent.length >= 5) {
      return NextResponse.json({ error: "Too many inquiries sent. Please wait a minute." }, { status: 429 });
    }

    recent.push(now);
    rateLimitMap.set(ip, recent);

    const body = await req.json();
    const { name, email, subject, message, website_hp } = body;

    // Honeypot anti-spam check
    if (website_hp) {
      // Return fake success for bot
      return NextResponse.json({ success: true, message: "Inquiry received" });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Please provide your name, email, and message." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const saved = saveMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject ? subject.trim() : "Portfolio Collaboration Inquiry",
      message: message.trim(),
    });

    return NextResponse.json({ success: true, message: "Your message has been delivered to the developer.", data: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to deliver message" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = getMessages();
    return NextResponse.json(messages);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load messages" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const ok = updateMessageStatus(id, status);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update status" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing message id" }, { status: 400 });
    }

    const ok = deleteMessage(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete message" }, { status: 500 });
  }
}
