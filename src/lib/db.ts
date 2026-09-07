import fs from "fs";
import path from "path";
import os from "os";
import { put, list, del } from "@vercel/blob";
import {
  FullPortfolioData,
  HeroData,
  ProjectData,
  SkillData,
  ExperienceData,
  AboutData,
  MessageData,
  SiteSettingsData,
} from "./types";
import { defaultPortfolioData } from "./defaultData";
import { hashPassword } from "./auth";

const BLOB_TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN ||
  "vercel_blob_rw_WOcKtcD4V9eOVLjZ_R2ISZzTvebeG7nthMXsiT6LfOKw5CP";

const IS_SERVERLESS = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production"
);

const SEED_DATA_DIR = path.join(process.cwd(), "data");
const RUNTIME_DATA_DIR = IS_SERVERLESS ? path.join(os.tmpdir(), "portfolio_db") : SEED_DATA_DIR;

const DATA_FILE = path.join(RUNTIME_DATA_DIR, "portfolio.json");
const MESSAGES_FILE = path.join(RUNTIME_DATA_DIR, "messages.json");
const ADMIN_FILE = path.join(RUNTIME_DATA_DIR, "admin.json");

const SEED_DATA_FILE = path.join(SEED_DATA_DIR, "portfolio.json");
const SEED_MESSAGES_FILE = path.join(SEED_DATA_DIR, "messages.json");
const SEED_ADMIN_FILE = path.join(SEED_DATA_DIR, "admin.json");

// In-memory isolated state cache for sub-millisecond responses
let memoryPortfolioData: FullPortfolioData = { ...defaultPortfolioData };
let memoryMessages: MessageData[] | null = null;
let memoryAdmin: { username: string; passwordHash: string } | null = null;

// Track latest blob URLs per section to eliminate redundant cloud fetches
const sectionBlobUrls: Record<string, string> = {
  hero: "",
  about: "",
  projects: "",
  skills: "",
  experience: "",
  settings: "",
};

function ensureDataDir() {
  try {
    if (!fs.existsSync(RUNTIME_DATA_DIR)) {
      fs.mkdirSync(RUNTIME_DATA_DIR, { recursive: true });
    }
    if (IS_SERVERLESS && !fs.existsSync(DATA_FILE)) {
      if (fs.existsSync(SEED_DATA_FILE)) {
        fs.copyFileSync(SEED_DATA_FILE, DATA_FILE);
      }
    }
    if (IS_SERVERLESS && !fs.existsSync(ADMIN_FILE)) {
      if (fs.existsSync(SEED_ADMIN_FILE)) {
        fs.copyFileSync(SEED_ADMIN_FILE, ADMIN_FILE);
      }
    }
  } catch (err) {
    console.warn("ensureDataDir notice:", err);
  }
}

function persistLocalDisk(data: FullPortfolioData) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    if (!IS_SERVERLESS && fs.existsSync(SEED_DATA_FILE)) {
      fs.writeFileSync(SEED_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Local disk persist notice:", err);
  }
}

// Write an individual isolated section to Vercel Blob
async function syncSectionToCloud<T>(sectionName: string, sectionData: T): Promise<string | null> {
  if (!BLOB_TOKEN) return null;
  try {
    const timestamp = Date.now();
    const versionedPath = `portfolio_database/sections/${sectionName}_${timestamp}.json`;
    const blob = await put(versionedPath, JSON.stringify(sectionData, null, 2), {
      access: "public",
      token: BLOB_TOKEN,
    });

    if (blob?.url) {
      sectionBlobUrls[sectionName] = blob.url;

      // Clean up older blobs for this section in the background (keep latest 3)
      (async () => {
        try {
          const listRes = await list({
            prefix: `portfolio_database/sections/${sectionName}_`,
            token: BLOB_TOKEN,
          });
          const sorted = listRes.blobs.sort(
            (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
          );
          if (sorted.length > 3) {
            for (const item of sorted.slice(3)) {
              await del(item.url, { token: BLOB_TOKEN }).catch(() => {});
            }
          }
        } catch {}
      })();

      return blob.url;
    }
  } catch (err) {
    console.error(`Vercel Blob sync error for section ${sectionName}:`, err);
  }
  return null;
}

export function getPortfolioData(): FullPortfolioData {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(raw);
      memoryPortfolioData = {
        ...defaultPortfolioData,
        ...data,
        hero: { ...defaultPortfolioData.hero, ...data.hero },
        about: { ...defaultPortfolioData.about, ...data.about },
        settings: { ...defaultPortfolioData.settings, ...data.settings },
      };
      return memoryPortfolioData;
    }
    if (fs.existsSync(SEED_DATA_FILE)) {
      const raw = fs.readFileSync(SEED_DATA_FILE, "utf-8");
      const data = JSON.parse(raw);
      memoryPortfolioData = {
        ...defaultPortfolioData,
        ...data,
        hero: { ...defaultPortfolioData.hero, ...data.hero },
        about: { ...defaultPortfolioData.about, ...data.about },
        settings: { ...defaultPortfolioData.settings, ...data.settings },
      };
      return memoryPortfolioData;
    }
  } catch (err) {
    console.error("Error reading portfolio data:", err);
  }
  return memoryPortfolioData;
}

export async function getPortfolioDataFresh(): Promise<FullPortfolioData> {
  if (BLOB_TOKEN) {
    try {
      // 1. List all section blobs in one fast query
      const listResult = await list({
        prefix: "portfolio_database/sections/",
        token: BLOB_TOKEN,
      });

      if (listResult.blobs && listResult.blobs.length > 0) {
        const sections = ["hero", "about", "projects", "skills", "experience", "settings"];
        const fetchTasks: Promise<void>[] = [];

        for (const sec of sections) {
          const matchingBlobs = listResult.blobs.filter((b) =>
            b.pathname.startsWith(`portfolio_database/sections/${sec}_`)
          );

          if (matchingBlobs.length > 0) {
            const sorted = matchingBlobs.sort(
              (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            );
            const latestUrl = sorted[0].url;

            // Only fetch if this section's blob URL has changed
            if (latestUrl !== sectionBlobUrls[sec] || !(memoryPortfolioData as any)[sec]) {
              fetchTasks.push(
                (async () => {
                  try {
                    const res = await fetch(`${latestUrl}${latestUrl.includes("?") ? "&" : "?"}t=${Date.now()}`, {
                      cache: "no-store",
                      headers: { "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate" },
                    });
                    if (res.ok) {
                      const json = await res.json();
                      if (json) {
                        (memoryPortfolioData as any)[sec] = json;
                        sectionBlobUrls[sec] = latestUrl;
                      }
                    }
                  } catch (fetchErr) {
                    console.warn(`Failed to fetch section ${sec} blob:`, fetchErr);
                  }
                })()
              );
            }
          }
        }

        if (fetchTasks.length > 0) {
          await Promise.all(fetchTasks);
          persistLocalDisk(memoryPortfolioData);
        }

        return memoryPortfolioData;
      }

      // 2. Fallback to legacy single monolithic data blob if section blobs don't exist yet
      const legacyDataList = await list({
        prefix: "portfolio_database/data_",
        token: BLOB_TOKEN,
      });

      if (legacyDataList.blobs && legacyDataList.blobs.length > 0) {
        const sorted = legacyDataList.blobs.sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        const latestUrl = sorted[0].url;
        const res = await fetch(`${latestUrl}${latestUrl.includes("?") ? "&" : "?"}t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate" },
        });
        if (res.ok) {
          const cloudData = await res.json();
          if (cloudData && cloudData.hero) {
            memoryPortfolioData = {
              ...defaultPortfolioData,
              ...cloudData,
              hero: { ...defaultPortfolioData.hero, ...cloudData.hero },
              about: { ...defaultPortfolioData.about, ...cloudData.about },
              settings: { ...defaultPortfolioData.settings, ...cloudData.settings },
            };
            persistLocalDisk(memoryPortfolioData);

            // Auto-migrate to isolated section files in background
            savePortfolioData(memoryPortfolioData).catch(() => {});
            return memoryPortfolioData;
          }
        }
      }
    } catch (blobErr) {
      console.warn("getPortfolioDataFresh Blob listing warning:", blobErr);
    }
  }

  return getPortfolioData();
}

export async function savePortfolioData(data: FullPortfolioData): Promise<void> {
  memoryPortfolioData = data;
  persistLocalDisk(data);

  // Sync each isolated section concurrently to cloud storage
  if (BLOB_TOKEN) {
    await Promise.all([
      syncSectionToCloud("hero", data.hero),
      syncSectionToCloud("about", data.about),
      syncSectionToCloud("projects", data.projects),
      syncSectionToCloud("skills", data.skills),
      syncSectionToCloud("experience", data.experience),
      syncSectionToCloud("settings", data.settings),
    ]);
  }
}

// ----------------------------------------------------------------------------
// ATOMIC ISOLATED SECTION UPDATERS
// ----------------------------------------------------------------------------

export async function updateHero(hero: Partial<HeroData>): Promise<HeroData> {
  // Ensure we have current memory state
  if (!memoryPortfolioData?.hero) {
    await getPortfolioDataFresh();
  }
  const updatedHero: HeroData = { ...memoryPortfolioData.hero, ...hero };
  memoryPortfolioData.hero = updatedHero;
  persistLocalDisk(memoryPortfolioData);

  // Sync ONLY hero to cloud
  await syncSectionToCloud("hero", updatedHero);
  return updatedHero;
}

export async function updateAbout(about: Partial<AboutData>): Promise<AboutData> {
  if (!memoryPortfolioData?.about) {
    await getPortfolioDataFresh();
  }
  const updatedAbout: AboutData = { ...memoryPortfolioData.about, ...about };
  memoryPortfolioData.about = updatedAbout;
  persistLocalDisk(memoryPortfolioData);

  // Sync ONLY about to cloud
  await syncSectionToCloud("about", updatedAbout);
  return updatedAbout;
}

export async function updateSettings(settings: Partial<SiteSettingsData>): Promise<SiteSettingsData> {
  if (!memoryPortfolioData?.settings) {
    await getPortfolioDataFresh();
  }
  const updatedSettings: SiteSettingsData = { ...memoryPortfolioData.settings, ...settings };
  memoryPortfolioData.settings = updatedSettings;
  persistLocalDisk(memoryPortfolioData);

  // Sync ONLY settings to cloud
  await syncSectionToCloud("settings", updatedSettings);
  return updatedSettings;
}

// ----------------------------------------------------------------------------
// PROJECTS CRUD (ATOMIC & ISOLATED)
// ----------------------------------------------------------------------------

export function getProjects(): ProjectData[] {
  return (memoryPortfolioData.projects || []).sort((a, b) => a.order - b.order);
}

export async function saveProject(project: Partial<ProjectData> & { id?: string }): Promise<ProjectData> {
  // Fresh load if memory projects uninitialized
  if (!memoryPortfolioData.projects || memoryPortfolioData.projects.length === 0) {
    await getPortfolioDataFresh();
  }

  const projects = [...(memoryPortfolioData.projects || [])];
  let updatedProject: ProjectData;

  if (project.id) {
    const index = projects.findIndex((p) => p.id === project.id);
    if (index !== -1) {
      updatedProject = { ...projects[index], ...project } as ProjectData;
      projects[index] = updatedProject;
    } else {
      updatedProject = {
        id: project.id,
        title: project.title || "Untitled Project",
        slug: project.slug || `project-${Date.now()}`,
        subtitle: project.subtitle || "",
        category: project.category || "Spatial UI",
        status: project.status || "Production",
        featured: project.featured ?? true,
        order: project.order ?? projects.length + 1,
        thumbnail: project.thumbnail || "/images/projects/spatial-vision-os.jpg",
        gallery: project.gallery || [],
        videoUrl: project.videoUrl || null,
        techStack: project.techStack || [],
        hasCaseStudy: project.hasCaseStudy ?? Boolean(project.problem || project.solution),
        problem: project.problem || "",
        solution: project.solution || "",
        architecture: project.architecture || "",
        impact: project.impact || "",
        performance: project.performance || "",
        liveUrl: project.liveUrl || null,
        githubUrl: project.githubUrl || null,
      };
      projects.push(updatedProject);
    }
  } else {
    const newId = `proj-${Date.now()}`;
    updatedProject = {
      id: newId,
      title: project.title || "New Project",
      slug: (project.title || "new-project").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      subtitle: project.subtitle || "",
      category: project.category || "Spatial UI",
      status: project.status || "Production",
      featured: project.featured ?? true,
      order: projects.length + 1,
      thumbnail: project.thumbnail || "/images/projects/spatial-vision-os.jpg",
      gallery: project.gallery || ["/images/projects/spatial-vision-os.jpg"],
      videoUrl: project.videoUrl || null,
      techStack: project.techStack || ["Next.js", "Three.js", "TypeScript"],
      hasCaseStudy: project.hasCaseStudy ?? Boolean(project.problem || project.solution),
      problem: project.problem || "",
      solution: project.solution || "",
      architecture: project.architecture || "",
      impact: project.impact || "",
      performance: project.performance || "",
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
    };
    projects.push(updatedProject);
  }

  memoryPortfolioData.projects = projects;
  persistLocalDisk(memoryPortfolioData);

  // Sync ONLY projects to cloud
  await syncSectionToCloud("projects", projects);
  return updatedProject;
}

export async function deleteProject(id: string): Promise<boolean> {
  const initialLen = (memoryPortfolioData.projects || []).length;
  const filtered = (memoryPortfolioData.projects || []).filter((p) => p.id !== id);

  if (filtered.length !== initialLen) {
    memoryPortfolioData.projects = filtered;
    persistLocalDisk(memoryPortfolioData);
    await syncSectionToCloud("projects", filtered);
    return true;
  }
  return false;
}

export async function reorderProjects(orderedProjects: ProjectData[]): Promise<ProjectData[]> {
  const updated = orderedProjects.map((p, idx) => ({ ...p, order: idx + 1 }));
  memoryPortfolioData.projects = updated;
  persistLocalDisk(memoryPortfolioData);
  await syncSectionToCloud("projects", updated);
  return updated;
}

// ----------------------------------------------------------------------------
// SKILLS CRUD (ATOMIC & ISOLATED)
// ----------------------------------------------------------------------------

export function getSkills(): SkillData[] {
  return (memoryPortfolioData.skills || []).sort((a, b) => a.order - b.order);
}

export async function saveSkill(skill: Partial<SkillData> & { id?: string }): Promise<SkillData> {
  if (!memoryPortfolioData.skills || memoryPortfolioData.skills.length === 0) {
    await getPortfolioDataFresh();
  }

  const skills = [...(memoryPortfolioData.skills || [])];
  let updatedSkill: SkillData;

  if (skill.id) {
    const idx = skills.findIndex((s) => s.id === skill.id);
    if (idx !== -1) {
      updatedSkill = { ...skills[idx], ...skill } as SkillData;
      skills[idx] = updatedSkill;
    } else {
      updatedSkill = {
        id: skill.id,
        name: skill.name || "New Skill",
        category: skill.category || "Frontend & 3D",
        level: skill.level || 90,
        icon: skill.icon || "Sparkles",
        order: skill.order || skills.length + 1,
        highlight: skill.highlight ?? false,
        description: skill.description || "",
      };
      skills.push(updatedSkill);
    }
  } else {
    updatedSkill = {
      id: `sk-${Date.now()}`,
      name: skill.name || "New Skill",
      category: skill.category || "Frontend & 3D",
      level: skill.level || 90,
      icon: skill.icon || "Sparkles",
      order: skills.length + 1,
      highlight: skill.highlight ?? false,
      description: skill.description || "",
    };
    skills.push(updatedSkill);
  }

  memoryPortfolioData.skills = skills;
  persistLocalDisk(memoryPortfolioData);

  // Sync ONLY skills to cloud
  await syncSectionToCloud("skills", skills);
  return updatedSkill;
}

export async function deleteSkill(id: string): Promise<boolean> {
  const initialLen = (memoryPortfolioData.skills || []).length;
  const filtered = (memoryPortfolioData.skills || []).filter((s) => s.id !== id);

  if (filtered.length !== initialLen) {
    memoryPortfolioData.skills = filtered;
    persistLocalDisk(memoryPortfolioData);
    await syncSectionToCloud("skills", filtered);
    return true;
  }
  return false;
}

export async function reorderSkills(orderedSkills: SkillData[]): Promise<SkillData[]> {
  const updated = orderedSkills.map((s, idx) => ({ ...s, order: idx + 1 }));
  memoryPortfolioData.skills = updated;
  persistLocalDisk(memoryPortfolioData);
  await syncSectionToCloud("skills", updated);
  return updated;
}

// ----------------------------------------------------------------------------
// EXPERIENCE CRUD (ATOMIC & ISOLATED)
// ----------------------------------------------------------------------------

export function getExperience(): ExperienceData[] {
  return (memoryPortfolioData.experience || []).sort((a, b) => a.order - b.order);
}

export async function saveExperience(exp: Partial<ExperienceData> & { id?: string }): Promise<ExperienceData> {
  if (!memoryPortfolioData.experience || memoryPortfolioData.experience.length === 0) {
    await getPortfolioDataFresh();
  }

  const exps = [...(memoryPortfolioData.experience || [])];
  let updatedExp: ExperienceData;

  if (exp.id) {
    const idx = exps.findIndex((e) => e.id === exp.id);
    if (idx !== -1) {
      updatedExp = { ...exps[idx], ...exp } as ExperienceData;
      exps[idx] = updatedExp;
    } else {
      updatedExp = {
        id: exp.id,
        role: exp.role || "Role",
        company: exp.company || "Company",
        location: exp.location || "",
        period: exp.period || "",
        type: exp.type || "",
        order: exp.order || exps.length + 1,
        description: exp.description || "",
        achievements: exp.achievements || [],
        technologies: exp.technologies || [],
        certificateUrl: exp.certificateUrl || null,
        certificateTitle: exp.certificateTitle || null,
      };
      exps.push(updatedExp);
    }
  } else {
    updatedExp = {
      id: `exp-${Date.now()}`,
      role: exp.role || "Role Title",
      company: exp.company || "Organization",
      location: exp.location || "",
      period: exp.period || "",
      type: exp.type || "",
      order: exps.length + 1,
      description: exp.description || "",
      achievements: exp.achievements || [],
      technologies: exp.technologies || [],
      certificateUrl: exp.certificateUrl || null,
      certificateTitle: exp.certificateTitle || null,
    };
    exps.push(updatedExp);
  }

  memoryPortfolioData.experience = exps;
  persistLocalDisk(memoryPortfolioData);

  // Sync ONLY experience to cloud
  await syncSectionToCloud("experience", exps);
  return updatedExp;
}

export async function deleteExperience(id: string): Promise<boolean> {
  const initialLen = (memoryPortfolioData.experience || []).length;
  const filtered = (memoryPortfolioData.experience || []).filter((e) => e.id !== id);

  if (filtered.length !== initialLen) {
    memoryPortfolioData.experience = filtered;
    persistLocalDisk(memoryPortfolioData);
    await syncSectionToCloud("experience", filtered);
    return true;
  }
  return false;
}

export async function reorderExperience(orderedExp: ExperienceData[]): Promise<ExperienceData[]> {
  const updated = orderedExp.map((e, idx) => ({ ...e, order: idx + 1 }));
  memoryPortfolioData.experience = updated;
  persistLocalDisk(memoryPortfolioData);
  await syncSectionToCloud("experience", updated);
  return updated;
}

// ----------------------------------------------------------------------------
// INQUIRIES / MESSAGES
// ----------------------------------------------------------------------------

export function getMessages(): MessageData[] {
  if (memoryMessages) return memoryMessages;
  ensureDataDir();
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      memoryMessages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
      return memoryMessages!;
    }
  } catch {}
  return memoryMessages || [];
}

export function saveMessage(msg: { name: string; email: string; subject?: string; message: string }): MessageData {
  ensureDataDir();
  const messages = getMessages();
  const newMsg: MessageData = {
    id: `msg-${Date.now()}`,
    name: msg.name,
    email: msg.email,
    subject: msg.subject || "Portfolio Inquiry",
    message: msg.message,
    status: "UNREAD",
    createdAt: new Date().toISOString(),
  };
  messages.unshift(newMsg);
  memoryMessages = messages;
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write messages to disk, saved in-memory:", err);
  }
  return newMsg;
}

export function updateMessageStatus(id: string, status: "UNREAD" | "READ" | "ARCHIVED"): boolean {
  const messages = getMessages();
  const msg = messages.find((m) => m.id === id);
  if (msg) {
    msg.status = status;
    memoryMessages = messages;
    try {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not write messages to disk, updated in-memory:", err);
    }
    return true;
  }
  return false;
}

export function deleteMessage(id: string): boolean {
  const messages = getMessages();
  const filtered = messages.filter((m) => m.id !== id);
  if (filtered.length !== messages.length) {
    memoryMessages = filtered;
    try {
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not write messages to disk, updated in-memory:", err);
    }
    return true;
  }
  return false;
}

// ----------------------------------------------------------------------------
// ADMIN CREDENTIALS STORE
// ----------------------------------------------------------------------------

export function getAdminUser(): { username: string; passwordHash: string } {
  if (memoryAdmin) return memoryAdmin;
  ensureDataDir();
  try {
    if (fs.existsSync(ADMIN_FILE)) {
      memoryAdmin = JSON.parse(fs.readFileSync(ADMIN_FILE, "utf-8"));
      return memoryAdmin!;
    }
    if (fs.existsSync(SEED_ADMIN_FILE)) {
      memoryAdmin = JSON.parse(fs.readFileSync(SEED_ADMIN_FILE, "utf-8"));
      return memoryAdmin!;
    }
  } catch {}
  memoryAdmin = {
    username: "admin",
    passwordHash: hashPassword("admin123"),
  };
  return memoryAdmin;
}

export function updateAdminPassword(newPassword: string, newUsername?: string): boolean {
  ensureDataDir();
  const current = getAdminUser();
  if (newPassword) {
    current.passwordHash = hashPassword(newPassword);
  }
  if (newUsername && newUsername.trim()) {
    current.username = newUsername.trim();
  }
  memoryAdmin = current;
  try {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(current, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist admin to disk, saved in-memory:", err);
  }
  return true;
}
