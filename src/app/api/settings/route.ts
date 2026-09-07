import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioDataFresh, savePortfolioData } from "@/lib/db";
import { defaultPortfolioData } from "@/lib/defaultData";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, backupData } = await req.json();

    if (action === "reset_defaults") {
      await savePortfolioData(defaultPortfolioData);
      revalidatePath("/");
      return NextResponse.json({ success: true, message: "Reset to factory portfolio defaults." });
    }

    if (action === "import_backup") {
      if (!backupData || !backupData.hero || !backupData.projects) {
        return NextResponse.json({ error: "Invalid backup data schema." }, { status: 400 });
      }
      await savePortfolioData(backupData);
      revalidatePath("/");
      return NextResponse.json({ success: true, message: "Portfolio data restored from backup." });
    }


    if (action === "test_blob_token") {
      const { token } = await req.json();
      const testToken = token || process.env.BLOB_READ_WRITE_TOKEN;
      if (!testToken) {
        return NextResponse.json({ success: false, error: "No cloud token provided." });
      }
      try {
        const { put } = await import("@vercel/blob");
        const testPut = await put(`system_health_check_${Date.now()}.txt`, "active", {
          access: "public",
          token: testToken,
        });
        return NextResponse.json({
          success: true,
          status: "active",
          message: "Vercel Blob Storage is connected and operational!",
          url: testPut.url,
        });
      } catch (err: any) {
        const isSuspended = err?.message?.includes("suspended") || err?.name?.includes("Suspended");
        return NextResponse.json({
          success: false,
          status: isSuspended ? "suspended" : "error",
          error: err.message || "Failed to verify cloud storage token.",
        });
      }
    }

    if (action === "export_backup") {
      const data = await getPortfolioDataFresh();
      return NextResponse.json({ success: true, backup: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Operation failed" }, { status: 500 });
  }
}
