import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, getPortfolioDataFresh, updateHero, updateAbout, updateSettings, saveSkill, deleteSkill, saveExperience, deleteExperience, savePortfolioData } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
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
      const updated = updateHero(data);
      responsePayload = { success: true, hero: updated };
    } else if (section === "about") {
      const updated = updateAbout(data);
      responsePayload = { success: true, about: updated };
    } else if (section === "settings") {
      const updated = updateSettings(data);
      responsePayload = { success: true, settings: updated };
    } else if (section === "skill") {
      const updated = saveSkill(data);
      responsePayload = { success: true, skill: updated };
    } else if (section === "experience") {
      const updated = saveExperience(data);
      responsePayload = { success: true, experience: updated };
    } else if (section === "reorder_projects") {
      savePortfolioData({
        ...getPortfolioData(),
        projects: data.map((p: any, idx: number) => ({ ...p, order: idx + 1 })),
      });
      responsePayload = { success: true };
    } else if (section === "reorder_skills") {
      savePortfolioData({
        ...getPortfolioData(),
        skills: data.map((s: any, idx: number) => ({ ...s, order: idx + 1 })),
      });
      responsePayload = { success: true };
    } else if (section === "reorder_experience") {
      savePortfolioData({
        ...getPortfolioData(),
        experience: data.map((e: any, idx: number) => ({ ...e, order: idx + 1 })),
      });
      responsePayload = { success: true };
    } else if (section === "full") {
      savePortfolioData(data);
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
      deleteSkill(id);
    } else if (type === "experience") {
      deleteExperience(id);
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

