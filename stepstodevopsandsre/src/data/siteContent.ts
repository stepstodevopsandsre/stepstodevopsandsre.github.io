import {
  BookOpen,
  BriefcaseBusiness,
  FileStack,
  FolderKanban,
  Lightbulb,
  NotebookTabs,
  Route,
  ScrollText
} from "lucide-react";
import type {
  BlogPost,
  Category,
  InterviewTopic,
  NavItem,
  Project,
  ResourceItem,
  RoadmapStep,
  SocialLink,
  Stat
} from "@/types";

export const site = {
  name: "Developer Knowledge Hub",
  tagline: "Ship faster by documenting what you learn.",
  description:
    "A premium, extensible developer platform for publishing blog posts, interview prep, learning paths, notes, cheat sheets, and standout projects from one polished knowledge base.",
  githubUrl: "https://github.com/randhirduo-code/Medium-Blogs"
};

export const navigation: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Blogs", href: "#blogs" },
  { label: "Resources", href: "#resources" },
  { label: "Interview Questions", href: "#interview-questions" },
  { label: "Roadmaps", href: "#roadmaps" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "GitHub", href: site.githubUrl, external: true }
];

export const heroStats: Stat[] = [
  { value: "7", label: "Core content lanes" },
  { value: "Mobile-first", label: "Responsive design system" },
  { value: "GitHub Pages", label: "Static deployment ready" }
];

export const categories: Category[] = [
  {
    title: "Blogs",
    description: "Publish deep dives, build logs, architecture notes, and distilled lessons from real work.",
    href: "#blogs",
    icon: ScrollText
  },
  {
    title: "Interview Questions",
    description: "Organize topic-specific prep packs with practical answers and review prompts.",
    href: "#interview-questions",
    icon: BriefcaseBusiness
  },
  {
    title: "Learning Resources",
    description: "Curate courses, docs, videos, and guides into a clean, searchable learning trail.",
    href: "#resources",
    icon: BookOpen
  },
  {
    title: "Roadmaps",
    description: "Visualize growth paths for frontend, backend, system design, and more.",
    href: "#roadmaps",
    icon: Route
  },
  {
    title: "Cheat Sheets",
    description: "Capture fast-reference notes for syntax, commands, APIs, and debugging workflows.",
    href: "#resources",
    icon: FileStack
  },
  {
    title: "Notes",
    description: "Store concise concept breakdowns, summaries, and personal reminders in one place.",
    href: "#about",
    icon: NotebookTabs
  },
  {
    title: "Project Showcases",
    description: "Highlight outcomes, tradeoffs, stack choices, and implementation decisions clearly.",
    href: "#projects",
    icon: FolderKanban
  },
  {
    title: "Learning Signals",
    description: "Turn scattered bookmarks and half-finished ideas into a durable knowledge system.",
    href: "#resources",
    icon: Lightbulb
  }
];

export const latestBlogs: BlogPost[] = [
  {
    title: "Designing a Scalable React Folder Architecture Without Over-Engineering",
    summary: "A practical approach to components, data domains, and page-level composition for growing apps.",
    tag: "Architecture",
    readTime: "6 min read",
    href: "#"
  },
  {
    title: "From Notes to Shipping: Building a Personal Knowledge Pipeline for Developers",
    summary: "How to capture ideas, refine them into content, and publish consistently without extra friction.",
    tag: "Productivity",
    readTime: "5 min read",
    href: "#"
  },
  {
    title: "Tailwind CSS Patterns for High-Signal Interfaces That Still Feel Premium",
    summary: "A set of layout, spacing, and token strategies for building fast sites with strong visual structure.",
    tag: "Frontend",
    readTime: "8 min read",
    href: "#"
  }
];

export const interviewQuestions: InterviewTopic[] = [
  {
    title: "JavaScript Fundamentals",
    description: "Closures, event loop, prototypes, async patterns, and browser execution behavior.",
    level: "Beginner to Intermediate",
    href: "#"
  },
  {
    title: "React System Design",
    description: "State architecture, rendering tradeoffs, performance bottlenecks, and component boundaries.",
    level: "Intermediate",
    href: "#"
  },
  {
    title: "Backend and APIs",
    description: "REST design, auth, caching, rate limiting, queues, databases, and production debugging.",
    level: "Intermediate to Advanced",
    href: "#"
  }
];

export const learningResources: ResourceItem[] = [
  {
    title: "Docs-First Learning Path",
    description: "A structured path that starts from official docs before branching into curated tutorials.",
    format: "Guided Path",
    href: "#"
  },
  {
    title: "System Design Study Pack",
    description: "Reference material for scaling patterns, tradeoffs, diagrams, and interview storytelling.",
    format: "Resource Collection",
    href: "#"
  },
  {
    title: "Frontend Performance Checklist",
    description: "A practical checklist for bundle health, rendering cost, accessibility, and image strategy.",
    format: "Cheat Sheet",
    href: "#"
  }
];

export const roadmapSteps: RoadmapStep[] = [
  {
    stage: "01",
    title: "Foundations",
    description: "Master language basics, version control, debugging, and core web fundamentals."
  },
  {
    stage: "02",
    title: "Build and Ship",
    description: "Create real projects, deploy them, document decisions, and learn through iteration."
  },
  {
    stage: "03",
    title: "Scale Your Thinking",
    description: "Study architecture, testing, performance, observability, and system design tradeoffs."
  },
  {
    stage: "04",
    title: "Teach and Compound",
    description: "Turn your notes and experiments into reusable content that accelerates future work."
  }
];

export const featuredProjects: Project[] = [
  {
    title: "Knowledge Base Starter",
    description: "A reusable publishing shell for blogs, notes, guides, and static documentation on GitHub Pages.",
    stack: ["React", "TypeScript", "Tailwind"],
    href: "#"
  },
  {
    title: "Interview Prep Dashboard",
    description: "A clean content hub for question banks, topic tagging, answer frameworks, and revision flows.",
    stack: ["Vite", "Static Data", "Responsive UI"],
    href: "#"
  }
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: site.githubUrl },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "X", href: "https://x.com/" },
  { label: "Email", href: "mailto:randhirduo@gmail.com" }
];
