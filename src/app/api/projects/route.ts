import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPortfolioDataFresh, saveProject, deleteProject } from "@/lib/db";
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
    const projects = data.projects.sort((a, b) => a.order - b.order);
    return NextResponse.json(projects, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load projects" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
    }

    const projectData = await req.json();
    const saved = await saveProject(projectData);
    
    try {
      revalidatePath("/", "page");
      revalidatePath("/admin", "page");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, project: saved }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save project" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_CACHE_HEADERS });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing project id" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const success = await deleteProject(id);

    try {
      revalidatePath("/", "page");
      revalidatePath("/admin", "page");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success }, { headers: NO_CACHE_HEADERS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete project" }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

