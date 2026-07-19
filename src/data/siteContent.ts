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
  name: "Steps to DevOps & SRE",
  tagline: "Production notes, observability guides, and hands-on reliability learning.",
  description:
    "A premium engineering knowledge hub for DevOps, SRE, platform engineering, and observability. Canonical notes stay in Notion, curated learning stays on the site, and production-ready blog pages are delivered through a serverless content pipeline.",
  githubUrl: "https://github.com/stepstodevopsandsre/stepstodevopsandsre.github.io"
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
  { value: "Notion", label: "Source of truth" },
  { value: "GitHub Pages", label: "Static frontend" },
  { value: "Netlify API", label: "Serverless content layer" }
];

export const categories: Category[] = [
  {
    title: "Blogs",
    description: "Ship deep-dive engineering writeups from canonical Notion pages without duplicating content.",
    href: "#blogs",
    icon: ScrollText
  },
  {
    title: "Interview Questions",
    description: "Structure SRE, cloud, Kubernetes, and Linux prep into reusable topic clusters.",
    href: "#interview-questions",
    icon: BriefcaseBusiness
  },
  {
    title: "Learning Resources",
    description: "Turn docs, runbooks, videos, and notes into a cleaner path through infrastructure topics.",
    href: "#resources",
    icon: BookOpen
  },
  {
    title: "Roadmaps",
    description: "Map deliberate progression from foundations to production-grade SRE thinking.",
    href: "#roadmaps",
    icon: Route
  },
  {
    title: "Cheat Sheets",
    description: "Keep PromQL, kubectl, Linux, Terraform, and cloud debugging notes ready at hand.",
    href: "#resources",
    icon: FileStack
  },
  {
    title: "Notes",
    description: "Preserve refined learnings instead of losing them in one-off experiments and scratchpads.",
    href: "#about",
    icon: NotebookTabs
  },
  {
    title: "Project Showcases",
    description: "Document implementation choices, tradeoffs, and production lessons from real systems work.",
    href: "#projects",
    icon: FolderKanban
  },
  {
    title: "Learning Signals",
    description: "Convert fragmented bookmarks into a durable engineering memory system that compounds.",
    href: "#resources",
    icon: Lightbulb
  }
];

export const latestBlogs: BlogPost[] = [
  {
    slug: "grafana-observability-p95-p99-latency",
    notionPageId: "3a15aace-fb86-8180-b37a-e46f5847cad7",
    title: "Grafana Observability for p95 & p99 Latency (PromQL + Dashboard Setup)",
    summary:
      "A Notion-backed observability deep dive covering histogram quantiles, PromQL query shape, Grafana panels, and the production mistakes that make tail-latency dashboards lie.",
    tag: "Observability",
    readTime: "12 min read",
    href: "#/blog/grafana-observability-p95-p99-latency"
  }
];

export const interviewQuestions: InterviewTopic[] = [
  {
    title: "SRE Foundations",
    description: "Linux internals, networking, Prometheus, incident response, and cloud tradeoffs from an SRE lens.",
    level: "SRE Foundations",
    href: "#"
  },
  {
    title: "Kubernetes and Platform Reliability",
    description: "Control plane concepts, workload debugging, ingress behavior, scaling, and platform boundaries.",
    level: "Intermediate",
    href: "#"
  },
  {
    title: "Cloud and Production Scenarios",
    description: "OCI, AWS, Terraform, observability, RCA, and automation scenarios grounded in production operations.",
    level: "Advanced",
    href: "#"
  }
];

export const learningResources: ResourceItem[] = [
  {
    title: "Observability Learning Trail",
    description: "A focused path through metrics, logs, tracing, PromQL, dashboards, and SLO-driven thinking.",
    format: "Guided Path",
    href: "#"
  },
  {
    title: "Cloud Reliability Toolkit",
    description: "A curated set of docs, commands, and workflows for Terraform, cloud automation, and incident readiness.",
    format: "Resource Collection",
    href: "#"
  },
  {
    title: "PromQL and Dashboard Notes",
    description: "A compact reference for query composition, histogram pitfalls, and Grafana panel decisions.",
    format: "Cheat Sheet",
    href: "#"
  }
];

export const roadmapSteps: RoadmapStep[] = [
  {
    stage: "01",
    title: "Foundations",
    description: "Build Linux, networking, Git, shell, and debugging fluency that supports every higher-order topic."
  },
  {
    stage: "02",
    title: "Operate Systems",
    description: "Learn observability, CI/CD, automation, and incident handling by running realistic workflows end to end."
  },
  {
    stage: "03",
    title: "Scale Reliability",
    description: "Study platform patterns, distributed systems tradeoffs, SLOs, and production resilience."
  },
  {
    stage: "04",
    title: "Publish and Compound",
    description: "Turn working notes into durable references, public blogs, and project artifacts that sharpen future decisions."
  }
];

export const featuredProjects: Project[] = [
  {
    title: "Notion-to-Pages Blog Pipeline",
    description: "A static GitHub Pages frontend paired with a Netlify serverless bridge that pulls canonical blog content directly from Notion.",
    stack: ["GitHub Pages", "Netlify Functions", "Notion API"],
    href: "#"
  },
  {
    title: "Observability Knowledge Hub",
    description: "A premium editorial shell for learning resources, roadmaps, SRE notes, and production-focused article publishing.",
    stack: ["Vite", "React", "Framer Motion"],
    href: "#"
  }
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: site.githubUrl },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "X", href: "https://x.com/" },
  { label: "Email", href: "mailto:randhirduo@gmail.com" }
];
