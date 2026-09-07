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
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !(await verifySessionTokenEdge(sessionCookie))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const isVideo = file.type.startsWith("video/") || Boolean(file.name.match(/\.(mp4|webm|mov|ogg|mkv|avi)$/i));
    const isPdf = file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // Forward file stream to high-speed cloud CDN
    const catboxForm = new FormData();
    catboxForm.append("reqtype", "fileupload");
    catboxForm.append("fileToUpload", file, cleanFileName);

    const cdnRes = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: catboxForm,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PortfolioUploader/2.0",
      },
    });

    if (cdnRes.ok) {
      const publicUrl = (await cdnRes.text()).trim();
      if (publicUrl.startsWith("http://") || publicUrl.startsWith("https://")) {
        return NextResponse.json(
          {
            success: true,
            url: publicUrl,
            name: cleanFileName,
            isVideo,
            isPdf,
          },
          { headers: NO_CACHE_HEADERS }
        );
      }
    }

    return NextResponse.json(
      { error: "Upload provider failed to return a valid URL." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("Stream upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to stream upload file." },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
