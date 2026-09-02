export interface HeroStat {
  id: string;
  value: string;
  label: string;
  color?: string; // "text-white" | "text-cyan-400" | "text-indigo-400" | "text-emerald-400" | "text-amber-400"
}

export interface HeroData {
  id: string;
  name: string;
  title: string;
  tagline: string;
  availabilityTag: string;
  showAvailabilityTag?: boolean;
  showIdentitySubtitle?: boolean;
  headlinePrefix?: string;
  headlineGradient?: string;
  headlineSuffix?: string;
  bio: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  email: string;
  avatarUrl: string;
  showStats?: boolean;
  stats?: HeroStat[];
  cubeFrontImg: string;
  cubeRightImg: string;
  cubeBackImg: string;
  cubeLeftImg: string;
  cubeTopImg: string;
  cubeBottomImg: string;

  // Contact / Enquiry Form Controls
  contactBadge?: string;
  contactHeadingPrefix?: string;
  contactHeadingGradient?: string;
  contactSubtitle?: string;
  contactDirectEmailLabel?: string;
  contactFormTitle?: string;
  contactFormSubtitle?: string;
  contactSubmitButtonText?: string;
  showGithubLink?: boolean;
  showLinkedinLink?: boolean;
  showTwitterLink?: boolean;
}

export interface ProjectData {
  id: string;
  title: string;
  slug: string;
  showSlug?: boolean;
  subtitle: string;
  showSubtitle?: boolean;
  category: string;
  showCategory?: boolean;
  status: string;
  showStatus?: boolean;
  featured: boolean;
  order: number;
  thumbnail: string;
  gallery: string[];
  videoUrl?: string | null;
  techStack: string[];
  showTechStack?: boolean;
  hasCaseStudy?: boolean;
  problem: string;
  solution: string;
  architecture: string;
  impact: string;
  performance: string;
  liveUrl?: string | null;
  githubUrl?: string | null;
}

export interface SkillData {
  id: string;
  name: string;
  category: "Frontend & 3D" | "Backend & Cloud" | "AI & Data" | "Spatial & Design" | string;
  level: number;
  icon?: string | null;
  order: number;
  highlight: boolean;
  description?: string | null;
}

export interface ExperienceData {
  id: string;
  role: string;
  company: string;
  location?: string | null;
  period: string;
  type: "Full-time" | "Contract" | "Open Source" | "Education" | string;
  order: number;
  description: string;
  achievements: string[];
  technologies: string[];
  certificateUrl?: string | null;
  certificateTitle?: string | null;
}

export interface HardwareSpec {
  label: string;
  value: string;
}

export interface CorePrinciple {
  id?: string;
  title: string;
  desc: string;
  icon?: string;
  visible?: boolean;
}

export interface AboutData {
  id: string;
  badge?: string;
  titlePrefix?: string;
  titleGradient?: string;
  subtitle?: string;
  storyTitle?: string;
  showStoryTitle?: boolean;
  storyParagraph1: string;
  showStoryParagraph1?: boolean;
  storyParagraph2: string;
  showStoryParagraph2?: boolean;
  additionalParagraphs?: string[];
  showHardwareSpecs?: boolean;
  hardwareTitle?: string;
  hardwareSpecs: HardwareSpec[];
  showPhotoCard?: boolean;
  photoUrl?: string;
  photoOverlayTag?: string;
  photoOverlayName?: string;
  showPhilosophy?: boolean;
  philosophyTitle: string;
  philosophyText: string;
  coreValues: CorePrinciple[];
}

export interface MessageData {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  icon?: string;
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
}

export interface SiteSettingsData {
  id: string;
  siteTitle: string;
  metaDesc: string;
  ogImageUrl?: string | null;
  accentColor: string;
  analyticsEnabled: boolean;
  // Header / Navbar Controls
  headerMonogram?: string;
  showHeaderCmsLink?: boolean;
  navItems?: NavItem[];
  // Footer Controls
  showFooter?: boolean;
  footerMonogram?: string;
  footerName?: string;
  footerCopyright?: string;
  footerStatusTag?: string;
  showLiveClock?: boolean;
  showBackToTop?: boolean;
  footerLinks?: FooterLink[];
  // Security & Asset Protection Controls (Configurable by Admin)
  blockScreenshots?: boolean;
  disableRightClick?: boolean;
  disableMediaSave?: boolean;
}


export interface FullPortfolioData {
  hero: HeroData;
  projects: ProjectData[];
  skills: SkillData[];
  experience: ExperienceData[];
  about: AboutData;
  settings: SiteSettingsData;
}
