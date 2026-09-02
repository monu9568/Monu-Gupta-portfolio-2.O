import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProjects, saveProject, deleteProject } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  try {
    const projects = getProjects();
    return NextResponse.json(projects);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectData = await req.json();
    const saved = saveProject(projectData);
    revalidatePath("/");
    return NextResponse.json({ success: true, project: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("admin_session")?.value;
    if (!sessionCookie || !verifySessionToken(sessionCookie).valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing project id" }, { status: 400 });
    }

    const success = deleteProject(id);
    revalidatePath("/");
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete project" }, { status: 500 });
  }
}

