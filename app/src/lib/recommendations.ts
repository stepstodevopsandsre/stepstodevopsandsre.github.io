import type { BlogPost, InterviewQuestion } from "@/types";
import type { LearningContent, LearningProfile } from "./learningProfile";

const relatedTopics: Record<string, string[]> = {
  linux: ["bash", "networking", "ansible", "observability"],
  terraform: ["aws", "kubernetes", "ansible", "ci/cd"],
  kubernetes: ["docker", "eks", "networking", "observability"],
  docker: ["kubernetes", "eks", "ci/cd"],
  ansible: ["linux", "terraform", "configuration management"],
  observability: ["prometheus", "grafana", "sre", "kubernetes"]
};

const normalise = (value: string) => value.trim().toLowerCase();

const toContent = (item: BlogPost | InterviewQuestion): LearningContent => {
  const isQuestion = "question" in item;
  const topics = isQuestion
    ? [item.domain, ...item.keywords]
    : [item.domain ?? "", item.module ?? "", item.tag];
  return {
    type: isQuestion ? "interview" : "blog",
    slug: item.slug,
    title: isQuestion ? item.question : item.title,
    href: item.href,
    topics: [...new Set(topics.filter(Boolean))]
  };
};

export const getRecommendation = (
  profile: LearningProfile,
  current: LearningContent | undefined,
  blogs: BlogPost[],
  questions: InterviewQuestion[]
) => {
  const pool = [...blogs, ...questions].map(toContent);
  const readSlugs = new Set(profile.reads.map((item) => item.slug));
  const currentTopics = new Set((current?.topics ?? []).map(normalise));
  const topTopics = Object.entries(profile.topicScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([topic]) => normalise(topic));
  const expandedTopics = new Set(topTopics);
  topTopics.forEach((topic) => (relatedTopics[topic] ?? []).forEach((related) => expandedTopics.add(related)));

  return pool
    .filter((item) => item.slug !== current?.slug && !readSlugs.has(item.slug))
    .map((item) => {
      const topics = item.topics.map(normalise);
      const directMatch = topics.filter((topic) => currentTopics.has(topic)).length;
      const relatedMatch = topics.filter((topic) => expandedTopics.has(topic)).length;
      return { item, score: directMatch * 4 + relatedMatch * 2 };
    })
    .sort((a, b) => b.score - a.score)[0]?.item;
};

export const getRecommendationReason = (profile: LearningProfile, recommendation?: LearningContent) => {
  if (!recommendation) return "A useful next step from the topics you have explored.";
  const topTopic = Object.entries(profile.topicScores).sort(([, a], [, b]) => b - a)[0]?.[0];
  return topTopic
    ? `Because you explored ${topTopic}, this is a useful next step.`
    : "A useful next step from the topics you have explored.";
};
