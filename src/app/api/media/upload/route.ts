import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Authenticate admin session
        const cookieHeader = request.headers.get("cookie") || "";
        const sessionCookie = cookieHeader
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("admin_session="))
          ?.split("=")[1];

        if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
          throw new Error("Unauthorized access. Please log into admin first.");
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/avif",
            "image/svg+xml",
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "application/pdf",
          ],
          maximumSizeInBytes: 250 * 1024 * 1024, // 250MB direct upload support for large video reels
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async () => {
        // Executed on Vercel Edge upon stream completion
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Direct upload token generation failed" },
      { status: 400 }
    );
  }
}
