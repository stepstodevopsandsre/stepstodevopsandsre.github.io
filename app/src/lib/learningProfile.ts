export type LearningContentType = "blog" | "interview";

export type LearningContent = {
  type: LearningContentType;
  slug: string;
  title: string;
  href: string;
  topics: string[];
};

export type ReadRecord = LearningContent & {
  progress: number;
  completed: boolean;
  lastOpenedAt: string;
};

export type LearningProfile = {
  schemaVersion: 1;
  profileId: string;
  lastActiveAt: string;
  companionEnabled: boolean;
  reads: ReadRecord[];
  topicScores: Record<string, number>;
  counts: {
    articlesOpened: number;
    questionsOpened: number;
    articlesCompleted: number;
    questionsCompleted: number;
    codeBlocksCopied: number;
  };
};

const STORAGE_KEY = "sr-learning-profile-v1";
const MAX_READS = 24;
const now = () => new Date().toISOString();

const createProfile = (): LearningProfile => ({
  schemaVersion: 1,
  profileId: globalThis.crypto?.randomUUID?.() ?? `sr-${Date.now().toString(36)}`,
  lastActiveAt: now(),
  companionEnabled: true,
  reads: [],
  topicScores: {},
  counts: {
    articlesOpened: 0,
    questionsOpened: 0,
    articlesCompleted: 0,
    questionsCompleted: 0,
    codeBlocksCopied: 0
  }
});

const normaliseProfile = (value: unknown): LearningProfile => {
  const base = createProfile();
  if (!value || typeof value !== "object") return base;
  const candidate = value as Partial<LearningProfile>;
  return {
    ...base,
    ...candidate,
    companionEnabled: candidate.companionEnabled !== false,
    reads: Array.isArray(candidate.reads) ? candidate.reads.slice(0, MAX_READS) : [],
    topicScores: candidate.topicScores && typeof candidate.topicScores === "object" ? candidate.topicScores : {},
    counts: { ...base.counts, ...(candidate.counts ?? {}) }
  };
};

export const readLearningProfile = (): LearningProfile => {
  if (typeof window === "undefined") return createProfile();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normaliseProfile(JSON.parse(raw)) : createProfile();
  } catch {
    return createProfile();
  }
};

export const writeLearningProfile = (profile: LearningProfile) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Storage can be disabled or full. The site remains usable without it.
  }
};

export const updateLearningProfile = (update: (profile: LearningProfile) => void) => {
  const profile = readLearningProfile();
  update(profile);
  profile.lastActiveAt = now();
  writeLearningProfile(profile);
  return profile;
};

export const recordContentOpened = (content: LearningContent) => updateLearningProfile((profile) => {
  const existing = profile.reads.find((item) => item.slug === content.slug && item.type === content.type);
  const openedAt = now();
  if (existing) Object.assign(existing, content, { lastOpenedAt: openedAt });
  else profile.reads.unshift({ ...content, progress: 0, completed: false, lastOpenedAt: openedAt });
  profile.reads = profile.reads.slice(0, MAX_READS);
  const countKey = content.type === "blog" ? "articlesOpened" : "questionsOpened";
  profile.counts[countKey] += existing ? 0 : 1;
  content.topics.forEach((topic) => {
    profile.topicScores[topic] = (profile.topicScores[topic] ?? 0) + (existing ? 0.15 : 1);
  });
});

export const recordReadingProgress = (content: LearningContent, progress: number) => updateLearningProfile((profile) => {
  const item = profile.reads.find((entry) => entry.slug === content.slug && entry.type === content.type);
  if (!item) return;
  const nextProgress = Math.max(item.progress, Math.min(100, Math.round(progress)));
  const wasCompleted = item.completed;
  item.progress = nextProgress;
  item.completed = nextProgress >= 90;
  if (!wasCompleted && item.completed) {
    const countKey = content.type === "blog" ? "articlesCompleted" : "questionsCompleted";
    profile.counts[countKey] += 1;
  }
});

export const recordCodeCopied = () => updateLearningProfile((profile) => {
  profile.counts.codeBlocksCopied += 1;
});

export const setCompanionEnabled = (enabled: boolean) => updateLearningProfile((profile) => {
  profile.companionEnabled = enabled;
});

export const getLastRead = (profile: LearningProfile) => profile.reads[0];
