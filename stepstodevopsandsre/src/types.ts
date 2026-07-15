import { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type Stat = {
  label: string;
  value: string;
};

export type Category = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type BlogPost = {
  title: string;
  summary: string;
  tag: string;
  readTime: string;
  href: string;
};

export type InterviewTopic = {
  title: string;
  description: string;
  level: string;
  href: string;
};

export type ResourceItem = {
  title: string;
  description: string;
  format: string;
  href: string;
};

export type RoadmapStep = {
  title: string;
  description: string;
  stage: string;
};

export type Project = {
  title: string;
  description: string;
  stack: string[];
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
};
