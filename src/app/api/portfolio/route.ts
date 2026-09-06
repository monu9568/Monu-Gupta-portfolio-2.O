import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, getPortfolioDataFresh, updateHero, updateAbout, updateSettings, saveSkill, deleteSkill, saveExperience, deleteExperience, savePortfolioData } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
};

export async function GET() {
  try {
    const data = await getPortfolioDataFresh();
    return NextResponse.json(data, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load portfolio" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
    }

    const body = await req.json();
    const { section, data } = body;

    let responsePayload: any = { success: true };

    if (section === "hero") {
      const updated = await updateHero(data);
      responsePayload = { success: true, hero: updated };
    } else if (section === "about") {
      const updated = await updateAbout(data);
      responsePayload = { success: true, about: updated };
    } else if (section === "settings") {
      const updated = await updateSettings(data);
      responsePayload = { success: true, settings: updated };
    } else if (section === "skill") {
      const updated = await saveSkill(data);
      responsePayload = { success: true, skill: updated };
    } else if (section === "experience") {
      const updated = await saveExperience(data);
      responsePayload = { success: true, experience: updated };
    } else if (section === "reorder_projects") {
      const freshData = await getPortfolioDataFresh();
      await savePortfolioData({
        ...freshData,
        projects: data.map((p: any, idx: number) => ({ ...p, order: idx + 1 })),
      });
      responsePayload = { success: true };
    } else if (section === "reorder_skills") {
      const freshData = await getPortfolioDataFresh();
      await savePortfolioData({
        ...freshData,
        skills: data.map((s: any, idx: number) => ({ ...s, order: idx + 1 })),
      });
      responsePayload = { success: true };
    } else if (section === "reorder_experience") {
      const freshData = await getPortfolioDataFresh();
      await savePortfolioData({
        ...freshData,
        experience: data.map((e: any, idx: number) => ({ ...e, order: idx + 1 })),
      });
      responsePayload = { success: true };
    } else if (section === "full") {
      await savePortfolioData(data);
      responsePayload = { success: true };
    } else {
      return NextResponse.json({ error: "Invalid section" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    // Immediately purge and revalidate frontend & admin caches
    try {
      revalidatePath("/", "page");
      revalidatePath("/admin", "page");
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    return NextResponse.json(responsePayload, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id || !type) {
      return NextResponse.json({ error: "Missing id or type" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    if (type === "skill") {
      await deleteSkill(id);
    } else if (type === "experience") {
      await deleteExperience(id);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    try {
      revalidatePath("/", "page");
      revalidatePath("/admin", "page");
      revalidatePath("/");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

