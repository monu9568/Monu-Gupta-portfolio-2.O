import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { put } from "@vercel/blob";
import { verifySessionToken } from "@/lib/auth";

const BLOB_TOKEN = (process.env.BLOB_READ_WRITE_TOKEN || "").trim();

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
};

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
    }

    const formData = await req.formData();
    const chunk = formData.get("chunk") as Blob;
    const uploadId = (formData.get("uploadId") as string) || `upl_${Date.now()}`;
    const chunkIndex = parseInt((formData.get("chunkIndex") as string) || "0", 10);
    const totalChunks = parseInt((formData.get("totalChunks") as string) || "1", 10);
    const fileName = (formData.get("fileName") as string) || `file_${Date.now()}`;
    const category = (formData.get("category") as string) || "uploads";
    const contentType = (formData.get("contentType") as string) || "application/octet-stream";

    if (!chunk) {
      return NextResponse.json({ error: "Missing chunk data" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const tempUploadDir = path.join(os.tmpdir(), "portfolio_chunks", uploadId);
    if (!fs.existsSync(tempUploadDir)) {
      fs.mkdirSync(tempUploadDir, { recursive: true });
    }

    // Save chunk part to disk
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    const partPath = path.join(tempUploadDir, `part_${chunkIndex}`);
    fs.writeFileSync(partPath, chunkBuffer);

    // If not the final chunk, acknowledge receipt
    if (chunkIndex < totalChunks - 1) {
      return NextResponse.json(
        { success: true, chunkReceived: chunkIndex, totalChunks, complete: false },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // --- Final chunk received: assemble all parts ---
    const isVideo = Boolean(fileName.match(/\.(mp4|webm|mov|ogg|mkv|avi)$/i) || contentType.startsWith("video/"));
    const isPdf = Boolean(fileName.toLowerCase().endsWith(".pdf") || contentType.includes("pdf"));

    const combinedBuffers: Buffer[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const p = path.join(tempUploadDir, `part_${i}`);
      if (fs.existsSync(p)) {
        combinedBuffers.push(fs.readFileSync(p));
      }
    }
    const fullBuffer = Buffer.concat(combinedBuffers);

    // Clean up temporary chunks
    try {
      for (let i = 0; i < totalChunks; i++) {
        const p = path.join(tempUploadDir, `part_${i}`);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      fs.rmdirSync(tempUploadDir);
    } catch {}

    const cleanFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    let publicUrl = "";

    // 1. Try uploading full buffer to Vercel Blob
    if (BLOB_TOKEN) {
      try {
        const blobPath = `${category}/${cleanFileName}`;
        const blob = await put(blobPath, fullBuffer, {
          access: "public",
          token: BLOB_TOKEN,
          contentType: contentType || (isVideo ? "video/mp4" : isPdf ? "application/pdf" : "image/webp"),
        });
        if (blob?.url) {
          publicUrl = blob.url;
        }
      } catch (blobErr: any) {
        console.warn("Vercel Blob write error in chunked upload:", blobErr?.message);
      }
    }

    // 2. High-speed Direct Cloud CDN Fallback for Videos and Media (Zero-config, up to 200MB)
    if (!publicUrl) {
      try {
        const catboxFormData = new FormData();
        catboxFormData.append("reqtype", "fileupload");
        const blob = new Blob([fullBuffer], {
          type: contentType || (isVideo ? "video/mp4" : isPdf ? "application/pdf" : "image/jpeg"),
        });
        catboxFormData.append("fileToUpload", blob, cleanFileName);

        const catboxRes = await fetch("https://catbox.moe/user/api.php", {
          method: "POST",
          body: catboxFormData,
          headers: {
            "User-Agent": "Mozilla/5.0 (Portfolio-Media-Uploader)",
          },
        });
        if (catboxRes.ok) {
          const resUrl = (await catboxRes.text()).trim();
          if (resUrl.startsWith("http://") || resUrl.startsWith("https://")) {
            publicUrl = resUrl;
          }
        }
      } catch (cloudErr: any) {
        console.warn("Direct Cloud CDN upload notice:", cloudErr?.message);
      }
    }

    // 3. Fallback: Local dev environment or safe small data URI
    if (!publicUrl) {
      const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      if (!isServerless) {
        try {
          const rootPublic = path.join(process.cwd(), "public");
          const targetDir = isVideo
            ? path.join(rootPublic, "video")
            : path.join(rootPublic, "images", category);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          fs.writeFileSync(path.join(targetDir, cleanFileName), fullBuffer);
          publicUrl = isVideo ? `/video/${cleanFileName}` : `/images/${category}/${cleanFileName}`;
        } catch {}
      }

      if (!publicUrl) {
        if (fullBuffer.length > 3.5 * 1024 * 1024) {
          return NextResponse.json(
            {
              error:
                "Could not upload file to cloud. Please check network connection or update your BLOB_READ_WRITE_TOKEN in Settings.",
            },
            { status: 400, headers: NO_CACHE_HEADERS }
          );
        }
        const mime = contentType || (isVideo ? "video/mp4" : isPdf ? "application/pdf" : "image/jpeg");
        publicUrl = `data:${mime};base64,${fullBuffer.toString("base64")}`;
      }
    }

    return NextResponse.json(
      {
        success: true,
        complete: true,
        url: publicUrl,
        name: cleanFileName,
        isVideo,
        isPdf,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err: any) {
    console.error("Chunked upload handler error:", err);
    return NextResponse.json({ error: err.message || "Chunked upload failed" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
