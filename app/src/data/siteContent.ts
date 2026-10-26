import {
  Activity,
  BookOpen,
  BriefcaseBusiness,
  Cloud,
  Container,
  Cpu,
  GitBranch,
  ScrollText,
  Shield,
  Zap
} from "lucide-react";
import type {
  BlogPost,
  Category,
  InterviewQuestion,
  InterviewTopic,
  NavItem,
  ResourceItem,
  SocialLink,
  Stat
} from "@/types";

export const site = {
  name: "Steps to DevOps & SRE",
  tagline: "",
  description:
    "A collection of notes, tutorials and interview guides on DevOps, SRE, Kubernetes, Cloud Infrastructure, System Design, Chaos Engineering and Platform Engineering. ",
  githubUrl: "https://github.com/stepstodevopsandsre/stepstodevopsandsre.github.io"
};

export const navigation: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Blogs", href: "#blogs" },
  { label: "Interview Questions", href: "#interview-questions" },
  { label: "About", href: "#about" },
 /* { label: "GitHub", href: site.githubUrl, external: true }*/
];


export const categories: Category[] = [
  {
    title: "DevOps & CI/CD",
    description:
      "Pipelines, GitOps, automation and delivery workflows from real systems - not tutorial screenshots.",
    href: "#blogs",
    icon: GitBranch
  },
  {
    title: "SRE & Reliability",
    description:
      "SLOs, error budgets, incident response, runbooks and production resilience patterns that actually compound.",
    href: "#blogs",
    icon: Shield
  },
  {
    title: "Kubernetes & Containers",
    description:
      "Control plane internals, networking, scheduling, Helm and production debugging from running real workloads.",
    href: "#blogs",
    icon: Container
  },
  {
    title: "Cloud Infrastructure",
    description:
      "AWS, OCI, Terraform, IaC patterns and multi-cloud reliability from hands-on implementation.",
    href: "#blogs",
    icon: Cloud
  },
  {
    title: "Observability",
    description:
      "Metrics, logs, traces, PromQL, Grafana dashboards and SLO-driven alerting built for production.",
    href: "#blogs",
    icon: Activity
  },
  {
    title: "Chaos Engineering",
    description:
      "Fault injection, blast radius scoping and resilience testing that moves systems from fragile to antifragile.",
    href: "#blogs",
    icon: Zap
  },
  {
    title: "System Design",
    description:
      "Distributed systems, data-plane tradeoffs, consistency models and architecture patterns at scale.",
    href: "#blogs",
    icon: Cpu
  },
  {
    title: "Platform Engineering",
    description:
      "Internal developer platforms, golden paths, self-service tooling and the org patterns that make them stick.",
    href: "#blogs",
    icon: BookOpen
  }
];

export const latestBlogs: BlogPost[] = [
  {
    slug: "grafana-observability-p95-p99-latency",
    notionPageId: "3a15aace-fb86-8180-b37a-e46f5847cad7",
    title: "Grafana Observability for p95 & p99 Latency (PromQL + Dashboard Setup)",
    summary:
      "A deep dive into histogram quantiles, PromQL query shape, Grafana panel design and the production mistakes that make tail-latency dashboards lie - straight from a real observability build.",
    tag: "Observability",
    readTime: "12 min read",
    domain: "Observability",
    module: "Metrics & Dashboards",
    href: "#/blog/grafana-observability-p95-p99-latency"
  }
];

export const interviewQuestions: InterviewTopic[] = [
  {
    title: "SRE Foundations",
    description:
      "Linux internals, networking, Prometheus, incident response and cloud tradeoffs from an SRE lens.",
    level: "SRE Foundations",
    href: "#"
  },
  {
    title: "Kubernetes and Platform Reliability",
    description:
      "Control plane concepts, workload debugging, ingress behavior, scaling and platform boundaries.",
    level: "Intermediate",
    href: "#"
  },
  {
    title: "Cloud and Production Scenarios",
    description:
      "OCI, AWS, Terraform, observability, RCA and automation scenarios grounded in production operations.",
    level: "Advanced",
    href: "#"
  }
];

export const latestInterviewQuestions: InterviewQuestion[] = [
  {
    slug: "eks-complete-traffic-flow-example-com-to-container",
    question: "Complete traffic flow from user hitting example.com till app container in EKS where app is deployed",
    title: "Complete traffic flow from user hitting example.com till app container in EKS where app is deployed",
    summary: "Interview prep for EKS, Kubernetes, AWS, Traffic Flow.",
    domain: "EKS",
    difficulty: "Intermediate",
    keywords: ["EKS", "Kubernetes", "AWS", "Traffic Flow"],
    companies: [],
    href: "#/interview-questions/eks-complete-traffic-flow-example-com-to-container"
  },
  {
    slug: "manage-secrets-and-configmaps-for-apps-in-eks",
    question: "How do you manage secrets and config maps for apps deployed in EKS?",
    title: "How do you manage secrets and config maps for apps deployed in EKS?",
    summary: "Interview prep for EKS, Kubernetes, Secrets, ConfigMap, IAM.",
    domain: "EKS",
    difficulty: "Intermediate",
    keywords: ["EKS", "Kubernetes", "Secrets", "ConfigMap"],
    companies: [],
    href: "#/interview-questions/manage-secrets-and-configmaps-for-apps-in-eks"
  },
  {
    slug: "git-revert-vs-git-reset",
    question: "Git revert vs Git reset",
    title: "Git revert vs Git reset",
    summary: "Interview prep for Git.",
    domain: "Git",
    difficulty: "Beginner",
    keywords: ["Git"],
    companies: [],
    href: "#/interview-questions/git-revert-vs-git-reset"
  },
  {
    slug: "manage-roles-in-ansible",
    question: "How do you manage roles in Ansible?",
    title: "How do you manage roles in Ansible?",
    summary: "Interview prep for Ansible.",
    domain: "Ansible",
    difficulty: "Intermediate",
    keywords: ["Ansible"],
    companies: [],
    href: "#/interview-questions/manage-roles-in-ansible"
  },
  {
    slug: "terraform-lifecycle-block-and-why-it-is-needed",
    question: "What is lifecycle block in Terraform and why is it needed?",
    title: "What is lifecycle block in Terraform and why is it needed?",
    summary: "Interview prep for Terraform, Lifecycle.",
    domain: "Terraform",
    difficulty: "Advanced",
    keywords: ["Terraform", "Lifecycle"],
    companies: [],
    href: "#/interview-questions/terraform-lifecycle-block-and-why-it-is-needed"
  },
  {
    slug: "linux-load-average-and-how-to-read-it",
    question: "What is load average in Linux, and how do you read it?",
    title: "What is load average in Linux, and how do you read it?",
    summary: "Interview prep for Linux.",
    domain: "Linux",
    difficulty: "Beginner",
    keywords: ["Linux"],
    companies: [],
    href: "#/interview-questions/linux-load-average-and-how-to-read-it"
  },
  {
    slug: "kubernetes-readiness-vs-liveness-probes",
    question: "How are Kubernetes readiness and liveness probes different?",
    title: "How are Kubernetes readiness and liveness probes different?",
    summary: "Interview prep for Kubernetes.",
    domain: "Kubernetes",
    difficulty: "Intermediate",
    keywords: ["Kubernetes"],
    companies: [],
    href: "#/interview-questions/kubernetes-readiness-vs-liveness-probes"
  },
  {
    slug: "recover-terraform-state-lock-safely",
    question: "How do you recover a Terraform state lock safely?",
    title: "How do you recover a Terraform state lock safely?",
    summary: "Interview prep for Terraform.",
    domain: "Terraform",
    difficulty: "Advanced",
    keywords: ["Terraform", "Lifecycle"],
    companies: [],
    href: "#/interview-questions/recover-terraform-state-lock-safely"
  }
];

export const learningResources: ResourceItem[] = [
  {
    title: "Observability Learning Trail",
    description:
      "A focused path through metrics, logs, tracing, PromQL, dashboards and SLO-driven thinking.",
    format: "Guided Path",
    href: "#"
  },
  {
    title: "Cloud Reliability Toolkit",
    description:
      "A curated set of docs, commands and workflows for Terraform, cloud automation and incident readiness.",
    format: "Resource Collection",
    href: "#"
  },
  {
    title: "PromQL and Dashboard Notes",
    description:
      "A compact reference for query composition, histogram pitfalls and Grafana panel decisions.",
    format: "Cheat Sheet",
    href: "#"
  }
];

export const socialLinks: SocialLink[] = [
  /*{ label: "GitHub", href: site.githubUrl },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "X", href: "https://x.com/" },*/
  { label: "Email", href: "mailto:randhirduo@gmail.com" }
];

// Keep these for type compatibility - they are no longer rendered
export const featuredProjects: { title: string; description: string; stack: string[]; href: string }[] = [];
export const roadmapSteps: { stage: string; title: string; description: string }[] = [];
