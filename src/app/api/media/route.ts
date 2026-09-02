import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { verifySessionToken } from "@/lib/auth";
import { put, del, list } from "@vercel/blob";
import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary if credentials are provided in environment
if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const BLOB_TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN ||
  "vercel_blob_rw_WOcKtcD4V9eOVLjZ_R2ISZzTvebeG7nthMXsiT6LfOKw5CP";

const HAS_VERCEL_BLOB = Boolean(BLOB_TOKEN);
const HAS_CLOUDINARY = Boolean(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY));

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assets: { name: string; url: string; category: string; size: number; isVideo: boolean; isPdf: boolean }[] = [];

    // 1. If Vercel Blob is configured, list cloud blobs
    if (HAS_VERCEL_BLOB) {
      try {
        const { blobs } = await list({ token: BLOB_TOKEN });
        for (const b of blobs) {
          const isPdf = b.pathname.toLowerCase().endsWith(".pdf");
          const isVid = Boolean(b.pathname.match(/\.(mp4|webm|mov|ogg|mkv)$/i));
          let category = "uploads";
          if (isVid) category = "video";
          else if (isPdf) category = "certificates";
          else if (b.pathname.includes("projects")) category = "projects";
          else if (b.pathname.includes("personal")) category = "personal";

          assets.push({
            name: b.pathname.split("/").pop() || b.pathname,
            url: b.url,
            category,
            size: b.size,
            isVideo: isVid,
            isPdf,
          });
        }
      } catch (blobErr) {
        console.warn("Vercel Blob list notice:", blobErr);
      }
    }


    // 2. Scan local public assets (bundled or seeded)
    try {
      const rootPublic = path.join(process.cwd(), "public");
      const imagesDir = path.join(rootPublic, "images");
      const categories = ["personal", "projects", "ui", "uploads", "certificates", "about"];

      for (const cat of categories) {
        const catDir = path.join(imagesDir, cat);
        if (fs.existsSync(catDir)) {
          const files = fs.readdirSync(catDir);
          for (const file of files) {
            if (file.match(/\.(png|jpg|jpeg|webp|svg|gif|avif|pdf)$/i)) {
              const filePath = path.join(catDir, file);
              const stats = fs.statSync(filePath);
              const isPdf = Boolean(file.toLowerCase().endsWith(".pdf"));
              const localUrl = `/images/${cat}/${file}`;
              if (!assets.some((a) => a.url === localUrl)) {
                assets.push({
                  name: file,
                  url: localUrl,
                  category: cat === "about" ? "personal" : cat,
                  size: stats.size,
                  isVideo: false,
                  isPdf,
                });
              }
            }
          }
        }
      }

      const videoDir = path.join(rootPublic, "video");
      if (fs.existsSync(videoDir)) {
        const files = fs.readdirSync(videoDir);
        for (const file of files) {
          if (file.match(/\.(mp4|webm|mov|ogg|mkv)$/i)) {
            const filePath = path.join(videoDir, file);
            const stats = fs.statSync(filePath);
            const localUrl = `/video/${file}`;
            if (!assets.some((a) => a.url === localUrl)) {
              assets.push({
                name: file,
                url: localUrl,
                category: "video",
                size: stats.size,
                isVideo: true,
                isPdf: false,
              });
            }
          }
        }
      }
    } catch {
      // Local filesystem read fallback
    }

    return NextResponse.json(assets);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to scan media" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "projects";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Security validation: size limit (50MB for video, 20MB for images/docs)
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isVideo = file.type.startsWith("video/") || Boolean(file.name.match(/\.(mp4|webm|mov|ogg|mkv)$/i));
    const maxSizeBytes = isVideo ? 50 * 1024 * 1024 : 20 * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `File size exceeds the limit (${isVideo ? "50MB" : "20MB"}).` },
        { status: 400 }
      );
    }

    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    let publicUrl: string = "";

    // 1. Primary: Vercel Blob Storage (Native 1-click cloud storage on Vercel)
    if (HAS_VERCEL_BLOB) {
      try {
        const blobPath = `${category}/${cleanFileName}`;
        const blobResult = await put(blobPath, buffer, {
          access: "public",
          token: BLOB_TOKEN,
          contentType: file.type || (isPdf ? "application/pdf" : isVideo ? "video/mp4" : "image/webp"),
        });
        publicUrl = blobResult.url;
      } catch (blobErr) {
        console.error("Vercel Blob upload failed, trying next provider:", blobErr);
      }

    }

    // 2. Secondary: Cloudinary Storage
    if (!publicUrl && HAS_CLOUDINARY) {
      try {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `portfolio/${category}`,
              resource_type: isVideo ? "video" : (isPdf ? "raw" : "image"),
              public_id: cleanFileName.split(".")[0],
            },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
          uploadStream.end(buffer);
        });
        if (uploadResult?.secure_url) {
          publicUrl = uploadResult.secure_url;
        }
      } catch (cloudErr) {
        console.error("Cloudinary upload failed:", cloudErr);
      }
    }

    // 3. Fallback: Local development or Serverless optimization
    if (!publicUrl) {
      const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production");

      if (isServerless) {
        // Optimized WebP Data URI for serverless without cloud keys
        if (!isPdf && !isVideo) {
          try {
            const compressed = await sharp(buffer)
              .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
              .webp({ quality: 84 })
              .toBuffer();
            publicUrl = `data:image/webp;base64,${compressed.toString("base64")}`;
          } catch {
            publicUrl = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
          }
        } else {
          const mimeType = file.type || (isPdf ? "application/pdf" : "video/mp4");
          publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
        }
      } else {
        // Local dev environment: write directly to public directory
        try {
          let targetDir: string;
          if (isVideo || category === "video") {
            targetDir = path.join(process.cwd(), "public", "video");
            publicUrl = `/video/${cleanFileName}`;
          } else {
            targetDir = path.join(process.cwd(), "public", "images", category);
            publicUrl = `/images/${category}/${cleanFileName}`;
          }

          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          const targetPath = path.join(targetDir, cleanFileName);
          fs.writeFileSync(targetPath, buffer);
        } catch {
          const mimeType = file.type || (isPdf ? "application/pdf" : isVideo ? "video/mp4" : "image/jpeg");
          publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
        }
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: cleanFileName,
      isVideo,
      isPdf,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 });
    }

    // 1. Delete from Vercel Blob if it's a Vercel Blob URL
    if (fileUrl.includes("vercel-storage.com") && HAS_VERCEL_BLOB) {
      try {
        await del(fileUrl, { token: BLOB_TOKEN });
        return NextResponse.json({ success: true, message: "Cloud asset deleted successfully" });
      } catch (delErr: any) {
        return NextResponse.json({ error: delErr.message || "Failed to delete from Vercel Blob" }, { status: 500 });
      }
    }


    // 2. Delete from Cloudinary if it's a Cloudinary URL
    if (fileUrl.includes("cloudinary.com") && HAS_CLOUDINARY) {
      try {
        const publicIdMatch = fileUrl.match(/\/portfolio\/([^.]+)/);
        if (publicIdMatch) {
          await cloudinary.uploader.destroy(`portfolio/${publicIdMatch[1]}`);
        }
        return NextResponse.json({ success: true, message: "Cloud asset deleted successfully" });
      } catch (delErr: any) {
        return NextResponse.json({ error: delErr.message || "Failed to delete from Cloudinary" }, { status: 500 });
      }
    }

    // 3. Local file deletion with directory traversal protection
    const cleanRelPath = fileUrl.replace(/^\/+/, "");
    const rootPublic = path.join(process.cwd(), "public");
    const fullPath = path.resolve(rootPublic, cleanRelPath);

    if (!fullPath.startsWith(rootPublic)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      fs.unlinkSync(fullPath);
      return NextResponse.json({ success: true, message: "File deleted successfully" });
    }

    return NextResponse.json({ success: true, message: "Deleted from registry" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete file" }, { status: 500 });
  }
}

