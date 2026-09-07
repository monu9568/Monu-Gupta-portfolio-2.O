import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const BLOB_TOKEN = (process.env.BLOB_READ_WRITE_TOKEN || "").trim();

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      token: BLOB_TOKEN,
      onBeforeGenerateToken: async (pathname) => {
        return {
          maximumSizeInBytes: 250 * 1024 * 1024, // 250MB direct client streaming support
          tokenPayload: JSON.stringify({
            uploadedAt: new Date().toISOString(),
            pathname,
          }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Direct upload token error:", error);
    return NextResponse.json(
      { error: error.message || "Direct upload token generation failed" },
      { status: 400 }
    );
  }
}
