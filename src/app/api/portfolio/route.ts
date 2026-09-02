import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioData, updateHero, updateAbout, updateSettings, saveSkill, deleteSkill, saveExperience, deleteExperience, savePortfolioData } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";


export async function GET() {
  try {
    const data = getPortfolioData();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load portfolio" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { section, data } = body;

    if (section === "hero") {
      const updated = updateHero(data);
      return NextResponse.json({ success: true, hero: updated });
    }

    if (section === "about") {
      const updated = updateAbout(data);
      return NextResponse.json({ success: true, about: updated });
    }

    if (section === "settings") {
      const updated = updateSettings(data);
      return NextResponse.json({ success: true, settings: updated });
    }

    if (section === "skill") {
      const updated = saveSkill(data);
      return NextResponse.json({ success: true, skill: updated });
    }

    if (section === "experience") {
      const updated = saveExperience(data);
      return NextResponse.json({ success: true, experience: updated });
    }

    if (section === "reorder_projects") {
      const updated = savePortfolioData({
        ...getPortfolioData(),
        projects: data.map((p: any, idx: number) => ({ ...p, order: idx + 1 })),
      });
      return NextResponse.json({ success: true });
    }

    if (section === "reorder_skills") {
      const updated = savePortfolioData({
        ...getPortfolioData(),
        skills: data.map((s: any, idx: number) => ({ ...s, order: idx + 1 })),
      });
      return NextResponse.json({ success: true });
    }

    if (section === "reorder_experience") {
      const updated = savePortfolioData({
        ...getPortfolioData(),
        experience: data.map((e: any, idx: number) => ({ ...e, order: idx + 1 })),
      });
      return NextResponse.json({ success: true });
    }

    if (section === "full") {
      savePortfolioData(data);
      revalidatePath("/");
      return NextResponse.json({ success: true });
    }

    revalidatePath("/");
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id || !type) {
      return NextResponse.json({ error: "Missing id or type" }, { status: 400 });
    }

    if (type === "skill") {
      deleteSkill(id);
      return NextResponse.json({ success: true });
    }

    if (type === "experience") {
      deleteExperience(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete" }, { status: 500 });
  }
}
