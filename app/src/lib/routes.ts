export const BLOG_ROUTE_PREFIX = "#/blog/";
export const INTERVIEW_QUESTION_ROUTE_PREFIX = "#/interview-questions/";
export const PRACTICE_PROBLEM_ROUTE_PREFIX = "#/practice/";

export type AppRoute =
  | { name: "home" }
  | { name: "blog"; slug: string }
  | { name: "interviewQuestion"; slug: string }
  | { name: "practiceProblem"; slug: string };

export const getRouteFromHash = (hash: string): AppRoute => {
  if (hash.startsWith(BLOG_ROUTE_PREFIX)) {
    const slug = hash.slice(BLOG_ROUTE_PREFIX.length).trim();

    if (slug) {
      return { name: "blog", slug: decodeURIComponent(slug) };
    }
  }

  if (hash.startsWith(INTERVIEW_QUESTION_ROUTE_PREFIX)) {
    const slug = hash.slice(INTERVIEW_QUESTION_ROUTE_PREFIX.length).trim();

    if (slug) {
      return { name: "interviewQuestion", slug: decodeURIComponent(slug) };
    }
  }

  if (hash.startsWith(PRACTICE_PROBLEM_ROUTE_PREFIX)) {
    const slug = hash.slice(PRACTICE_PROBLEM_ROUTE_PREFIX.length).trim();

    if (slug) {
      return { name: "practiceProblem", slug: decodeURIComponent(slug) };
    }
  }

  return { name: "home" };
};

export const getBlogHref = (slug: string) => `${BLOG_ROUTE_PREFIX}${encodeURIComponent(slug)}`;
export const getInterviewQuestionHref = (slug: string) =>
  `${INTERVIEW_QUESTION_ROUTE_PREFIX}${encodeURIComponent(slug)}`;
export const getPracticeProblemHref = (slug: string) =>
  `${PRACTICE_PROBLEM_ROUTE_PREFIX}${encodeURIComponent(slug)}`;
