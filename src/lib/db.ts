import fs from "fs";
import path from "path";
import os from "os";
import { v2 as cloudinary } from "cloudinary";
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

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "j2j07xwi";
const API_KEY = process.env.CLOUDINARY_API_KEY || "483862826493582";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "dffM_E_mH8CsGajHlHvDU7UJRDE";

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

const HAS_CLOUDINARY = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

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
    if (fs.existsSync(SEED_DATA_FILE)) {
      try {
        fs.writeFileSync(SEED_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
      } catch {}
    }
  } catch (err) {
    console.warn("Local disk persist notice:", err);
  }
}

async function syncSectionToCloud<T>(sectionName: string, sectionData: T): Promise<string | null> {
  if (!HAS_CLOUDINARY) return null;

  try {
    // We synchronize the ENTIRE state so there's a single source of truth across all serverless nodes
    const jsonStr = JSON.stringify(memoryPortfolioData, null, 2);
    const buffer = Buffer.from(jsonStr);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `portfolio_database`,
          resource_type: "raw",
          public_id: `portfolio_latest.json`,
          overwrite: true,
          invalidate: true,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    if (uploadResult?.secure_url) {
      return uploadResult.secure_url;
    }
  } catch (err: any) {
    console.warn(`Cloudinary DB sync notice:`, err?.message);
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
        hero: { ...defaultPortfolioData.hero, ...(data.hero || {}) },
        about: { ...defaultPortfolioData.about, ...(data.about || {}) },
        settings: { ...defaultPortfolioData.settings, ...(data.settings || {}) },
      };
      return memoryPortfolioData;
    }
    if (fs.existsSync(SEED_DATA_FILE)) {
      const raw = fs.readFileSync(SEED_DATA_FILE, "utf-8");
      const data = JSON.parse(raw);
      memoryPortfolioData = {
        ...defaultPortfolioData,
        ...data,
        hero: { ...defaultPortfolioData.hero, ...(data.hero || {}) },
        about: { ...defaultPortfolioData.about, ...(data.about || {}) },
        settings: { ...defaultPortfolioData.settings, ...(data.settings || {}) },
      };
      return memoryPortfolioData;
    }
  } catch (err) {
    console.error("Error reading portfolio data:", err);
  }
  return memoryPortfolioData;
}

export async function getPortfolioDataFresh(): Promise<FullPortfolioData> {
  const current = getPortfolioData();

  if (HAS_CLOUDINARY) {
    try {
      // Use Admin API to get the latest versioned URL, completely bypassing CDN caches!
      const result = await cloudinary.api.resource("portfolio_database/portfolio_latest.json", {
        resource_type: "raw"
      });
      
      if (result && result.secure_url) {
        const latestUrl = result.secure_url;
        
        // Fetch the actual JSON
        const res = await fetch(`${latestUrl}?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate" },
        });
        
        if (res.ok) {
          const text = await res.text();
          if (text.startsWith("{")) {
            const json = JSON.parse(text);
            if (json && json.hero) {
              memoryPortfolioData = {
                ...defaultPortfolioData,
                ...json,
                hero: { ...defaultPortfolioData.hero, ...(json.hero || {}) },
                about: { ...defaultPortfolioData.about, ...(json.about || {}) },
                settings: { ...defaultPortfolioData.settings, ...(json.settings || {}) },
              };
              persistLocalDisk(memoryPortfolioData);
              return memoryPortfolioData;
            }
          }
        }
      }
    } catch (err: any) {
      // If resource not found (404), it just hasn't been uploaded yet, which is fine.
      if (err?.http_code !== 404 && err?.error?.http_code !== 404) {
        console.warn("getPortfolioDataFresh Cloudinary warning:", err?.message || err);
      }
    }
  }

  return current;
}

export async function savePortfolioData(data: FullPortfolioData): Promise<void> {
  memoryPortfolioData = data;
  persistLocalDisk(data);

  // Sync to Cloudinary if configured
  if (HAS_CLOUDINARY) {
    await syncSectionToCloud("full", data);
  }
}

// ----------------------------------------------------------------------------
// ATOMIC ISOLATED SECTION UPDATERS
// ----------------------------------------------------------------------------

export async function updateHero(hero: Partial<HeroData>): Promise<HeroData> {
  const current = await getPortfolioDataFresh();
  const updatedHero: HeroData = { ...current.hero, ...hero };
  current.hero = updatedHero;
  memoryPortfolioData = current;
  persistLocalDisk(memoryPortfolioData);

  await syncSectionToCloud("hero", updatedHero);
  return updatedHero;
}

export async function updateAbout(about: Partial<AboutData>): Promise<AboutData> {
  const current = await getPortfolioDataFresh();
  const updatedAbout: AboutData = { ...current.about, ...about };
  current.about = updatedAbout;
  memoryPortfolioData = current;
  persistLocalDisk(memoryPortfolioData);

  await syncSectionToCloud("about", updatedAbout);
  return updatedAbout;
}

export async function updateSettings(settings: Partial<SiteSettingsData>): Promise<SiteSettingsData> {
  const current = await getPortfolioDataFresh();
  const updatedSettings: SiteSettingsData = { ...current.settings, ...settings };
  current.settings = updatedSettings;
  memoryPortfolioData = current;
  persistLocalDisk(memoryPortfolioData);

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
  const current = await getPortfolioDataFresh();
  const projects = [...(current.projects || [])];
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

  current.projects = projects;
  memoryPortfolioData = current;
  persistLocalDisk(memoryPortfolioData);

  // Sync ONLY projects to cloud
  await syncSectionToCloud("projects", projects);
  return updatedProject;
}

export async function deleteProject(id: string): Promise<boolean> {
  const current = await getPortfolioDataFresh();
  const initialLen = (current.projects || []).length;
  const filtered = (current.projects || []).filter((p) => p.id !== id);

  if (filtered.length !== initialLen) {
    current.projects = filtered;
    memoryPortfolioData = current;
    persistLocalDisk(memoryPortfolioData);
    await syncSectionToCloud("projects", filtered);
    return true;
  }
  return false;
}

export async function reorderProjects(orderedProjects: ProjectData[]): Promise<ProjectData[]> {
  const current = await getPortfolioDataFresh();
  const updated = orderedProjects.map((p, idx) => ({ ...p, order: idx + 1 }));
  current.projects = updated;
  memoryPortfolioData = current;
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
  const current = await getPortfolioDataFresh();
  const skills = [...(current.skills || [])];
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

  current.skills = skills;
  memoryPortfolioData = current;
  persistLocalDisk(memoryPortfolioData);

  // Sync ONLY skills to cloud
  await syncSectionToCloud("skills", skills);
  return updatedSkill;
}

export async function deleteSkill(id: string): Promise<boolean> {
  const current = await getPortfolioDataFresh();
  const initialLen = (current.skills || []).length;
  const filtered = (current.skills || []).filter((s) => s.id !== id);

  if (filtered.length !== initialLen) {
    current.skills = filtered;
    memoryPortfolioData = current;
    persistLocalDisk(memoryPortfolioData);
    await syncSectionToCloud("skills", filtered);
    return true;
  }
  return false;
}

export async function reorderSkills(orderedSkills: SkillData[]): Promise<SkillData[]> {
  const current = await getPortfolioDataFresh();
  const updated = orderedSkills.map((s, idx) => ({ ...s, order: idx + 1 }));
  current.skills = updated;
  memoryPortfolioData = current;
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
  const current = await getPortfolioDataFresh();
  const exps = [...(current.experience || [])];
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

  current.experience = exps;
  memoryPortfolioData = current;
  persistLocalDisk(memoryPortfolioData);

  // Sync ONLY experience to cloud
  await syncSectionToCloud("experience", exps);
  return updatedExp;
}

export async function deleteExperience(id: string): Promise<boolean> {
  const current = await getPortfolioDataFresh();
  const initialLen = (current.experience || []).length;
  const filtered = (current.experience || []).filter((e) => e.id !== id);

  if (filtered.length !== initialLen) {
    current.experience = filtered;
    memoryPortfolioData = current;
    persistLocalDisk(memoryPortfolioData);
    await syncSectionToCloud("experience", filtered);
    return true;
  }
  return false;
}

export async function reorderExperience(orderedExp: ExperienceData[]): Promise<ExperienceData[]> {
  const current = await getPortfolioDataFresh();
  const updated = orderedExp.map((e, idx) => ({ ...e, order: idx + 1 }));
  current.experience = updated;
  memoryPortfolioData = current;
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
