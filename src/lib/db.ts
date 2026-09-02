import fs from "fs";
import path from "path";
import os from "os";
import { FullPortfolioData, HeroData, ProjectData, SkillData, ExperienceData, AboutData, MessageData, SiteSettingsData } from "./types";
import { defaultPortfolioData } from "./defaultData";
import { hashPassword } from "./auth";

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production");

const SEED_DATA_DIR = path.join(process.cwd(), "data");
const RUNTIME_DATA_DIR = IS_SERVERLESS ? path.join(os.tmpdir(), "portfolio_db") : SEED_DATA_DIR;

const DATA_FILE = path.join(RUNTIME_DATA_DIR, "portfolio.json");
const MESSAGES_FILE = path.join(RUNTIME_DATA_DIR, "messages.json");
const ADMIN_FILE = path.join(RUNTIME_DATA_DIR, "admin.json");

const SEED_DATA_FILE = path.join(SEED_DATA_DIR, "portfolio.json");
const SEED_MESSAGES_FILE = path.join(SEED_DATA_DIR, "messages.json");
const SEED_ADMIN_FILE = path.join(SEED_DATA_DIR, "admin.json");

// In-memory fallback cache to guarantee 100% successful reads and writes in serverless
let memoryPortfolioData: FullPortfolioData | null = null;
let memoryMessages: MessageData[] | null = null;
let memoryAdmin: { username: string; passwordHash: string } | null = null;

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

export function getPortfolioData(): FullPortfolioData {
  if (memoryPortfolioData) {
    return memoryPortfolioData;
  }
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
      return memoryPortfolioData!;
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
      return memoryPortfolioData!;
    }
  } catch (err) {
    console.error("Error reading portfolio data:", err);
  }
  memoryPortfolioData = defaultPortfolioData;
  return memoryPortfolioData;
}

export function savePortfolioData(data: FullPortfolioData): void {
  memoryPortfolioData = data;
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Filesystem write fallback, retained in memory:", err);
  }
}

export function updateHero(hero: Partial<HeroData>): HeroData {
  const current = getPortfolioData();
  const updatedHero = { ...current.hero, ...hero };
  current.hero = updatedHero;
  savePortfolioData(current);
  return updatedHero;
}

export function updateAbout(about: Partial<AboutData>): AboutData {
  const current = getPortfolioData();
  const updatedAbout = { ...current.about, ...about };
  current.about = updatedAbout;
  savePortfolioData(current);
  return updatedAbout;
}

export function updateSettings(settings: Partial<SiteSettingsData>): SiteSettingsData {
  const current = getPortfolioData();
  const updated = { ...current.settings, ...settings };
  current.settings = updated;
  savePortfolioData(current);
  return updated;
}

// Projects CRUD
export function getProjects(): ProjectData[] {
  const data = getPortfolioData();
  return data.projects.sort((a, b) => a.order - b.order);
}

export function saveProject(project: Partial<ProjectData> & { id?: string }): ProjectData {
  const current = getPortfolioData();
  let updatedProject: ProjectData;

  if (project.id) {
    const index = current.projects.findIndex((p) => p.id === project.id);
    if (index !== -1) {
      updatedProject = { ...current.projects[index], ...project } as ProjectData;
      current.projects[index] = updatedProject;
    } else {
      updatedProject = {
        id: project.id,
        title: project.title || "Untitled Project",
        slug: project.slug || `project-${Date.now()}`,
        subtitle: project.subtitle || "",
        category: project.category || "Spatial UI",
        status: project.status || "Production",
        featured: project.featured ?? true,
        order: project.order ?? current.projects.length + 1,
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
      current.projects.push(updatedProject);
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
      order: current.projects.length + 1,
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
    current.projects.push(updatedProject);
  }

  savePortfolioData(current);
  return updatedProject;
}

export function deleteProject(id: string): boolean {
  const current = getPortfolioData();
  const initialLen = current.projects.length;
  current.projects = current.projects.filter((p) => p.id !== id);
  if (current.projects.length !== initialLen) {
    savePortfolioData(current);
    return true;
  }
  return false;
}

// Skills CRUD
export function getSkills(): SkillData[] {
  return getPortfolioData().skills.sort((a, b) => a.order - b.order);
}

export function saveSkill(skill: Partial<SkillData> & { id?: string }): SkillData {
  const current = getPortfolioData();
  let updatedSkill: SkillData;

  if (skill.id) {
    const idx = current.skills.findIndex((s) => s.id === skill.id);
    if (idx !== -1) {
      updatedSkill = { ...current.skills[idx], ...skill } as SkillData;
      current.skills[idx] = updatedSkill;
    } else {
      updatedSkill = {
        id: skill.id,
        name: skill.name || "New Skill",
        category: skill.category || "Frontend & 3D",
        level: skill.level || 90,
        icon: skill.icon || "Sparkles",
        order: skill.order || current.skills.length + 1,
        highlight: skill.highlight ?? false,
        description: skill.description || "",
      };
      current.skills.push(updatedSkill);
    }
  } else {
    updatedSkill = {
      id: `sk-${Date.now()}`,
      name: skill.name || "New Skill",
      category: skill.category || "Frontend & 3D",
      level: skill.level || 90,
      icon: skill.icon || "Sparkles",
      order: current.skills.length + 1,
      highlight: skill.highlight ?? false,
      description: skill.description || "",
    };
    current.skills.push(updatedSkill);
  }

  savePortfolioData(current);
  return updatedSkill;
}

export function deleteSkill(id: string): boolean {
  const current = getPortfolioData();
  const initialLen = current.skills.length;
  current.skills = current.skills.filter((s) => s.id !== id);
  if (current.skills.length !== initialLen) {
    savePortfolioData(current);
    return true;
  }
  return false;
}

// Experience CRUD
export function getExperience(): ExperienceData[] {
  return getPortfolioData().experience.sort((a, b) => a.order - b.order);
}

export function saveExperience(exp: Partial<ExperienceData> & { id?: string }): ExperienceData {
  const current = getPortfolioData();
  let updatedExp: ExperienceData;

  if (exp.id) {
    const idx = current.experience.findIndex((e) => e.id === exp.id);
    if (idx !== -1) {
      updatedExp = { ...current.experience[idx], ...exp } as ExperienceData;
      current.experience[idx] = updatedExp;
    } else {
      updatedExp = {
        id: exp.id,
        role: exp.role || "Role",
        company: exp.company || "Company",
        location: exp.location || "",
        period: exp.period || "",
        type: exp.type || "",
        order: exp.order || current.experience.length + 1,
        description: exp.description || "",
        achievements: exp.achievements || [],
        technologies: exp.technologies || [],
        certificateUrl: exp.certificateUrl || null,
        certificateTitle: exp.certificateTitle || null,
      };
      current.experience.push(updatedExp);
    }
  } else {
    updatedExp = {
      id: `exp-${Date.now()}`,
      role: exp.role || "Role Title",
      company: exp.company || "Organization",
      location: exp.location || "",
      period: exp.period || "",
      type: exp.type || "",
      order: current.experience.length + 1,
      description: exp.description || "",
      achievements: exp.achievements || [],
      technologies: exp.technologies || [],
      certificateUrl: exp.certificateUrl || null,
      certificateTitle: exp.certificateTitle || null,
    };
    current.experience.push(updatedExp);
  }

  savePortfolioData(current);
  return updatedExp;
}

export function deleteExperience(id: string): boolean {
  const current = getPortfolioData();
  const initialLen = current.experience.length;
  current.experience = current.experience.filter((e) => e.id !== id);
  if (current.experience.length !== initialLen) {
    savePortfolioData(current);
    return true;
  }
  return false;
}

export function reorderProjects(orderedProjects: ProjectData[]): ProjectData[] {
  const current = getPortfolioData();
  current.projects = orderedProjects.map((p, idx) => ({ ...p, order: idx + 1 }));
  savePortfolioData(current);
  return current.projects;
}

export function reorderSkills(orderedSkills: SkillData[]): SkillData[] {
  const current = getPortfolioData();
  current.skills = orderedSkills.map((s, idx) => ({ ...s, order: idx + 1 }));
  savePortfolioData(current);
  return current.skills;
}

export function reorderExperience(orderedExp: ExperienceData[]): ExperienceData[] {
  const current = getPortfolioData();
  current.experience = orderedExp.map((e, idx) => ({ ...e, order: idx + 1 }));
  savePortfolioData(current);
  return current.experience;
}

// Inquiries / Messages
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

// Admin credentials store
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

