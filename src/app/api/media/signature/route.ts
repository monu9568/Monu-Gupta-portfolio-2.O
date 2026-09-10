import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
};

async function verifySessionTokenEdge(token: string): Promise<boolean> {
  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return false;

    const secret = process.env.ADMIN_SECRET || "liquid-glass-visionos-admin-secret-key-2026";
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(encodedPayload));
    const bytes = new Uint8Array(sigBuf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSig = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (signature !== expectedSig) return false;

    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Authentication
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !(await verifySessionTokenEdge(sessionCookie))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
    }

    // 2. Parse request
    const body = await req.json().catch(() => ({}));
    const folder = body.folder || "portfolio/uploads";

    // 3. Read Cloudinary Config with fallback
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "j2j07xwi";
    const apiKey = process.env.CLOUDINARY_API_KEY || "483862826493582";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "dffM_E_mH8CsGajHlHvDU7UJRDE";

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured on server" },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }

    // 4. Generate Cloudinary Signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(strToSign);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // 5. Return payload for client direct upload
    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName
    }, { headers: NO_CACHE_HEADERS });

  } catch (err: any) {
    console.error("Signature generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
