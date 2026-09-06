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


    if (action === "export_backup") {
      const data = await getPortfolioDataFresh();
      return NextResponse.json({ success: true, backup: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Operation failed" }, { status: 500 });
  }
}
