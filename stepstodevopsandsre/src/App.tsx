import { AboutSection } from "@/components/AboutSection";
import { ContentGrid } from "@/components/ContentGrid";
import { FeaturedCategories } from "@/components/FeaturedCategories";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { RoadmapTimeline } from "@/components/RoadmapTimeline";
import { featuredProjects, interviewQuestions, latestBlogs, learningResources } from "@/data/siteContent";

const cardClassName =
  "rounded-[1.75rem] border border-border/80 bg-surface/75 p-6 shadow-panel transition duration-300 hover:-translate-y-1 hover:border-accent/35 hover:bg-elevated";

function App() {
  return (
    <div className="min-h-screen bg-canvas text-text">
      <Header />
      <main>
        <Hero />
        <FeaturedCategories />

        <ContentGrid
          id="blogs"
          eyebrow="Latest Blogs"
          title="Fresh writing for developers who like specifics."
          description="Use this section for new essays, implementation notes, and technical walkthroughs that reward curious readers."
        >
          {latestBlogs.map((post) => (
            <article key={post.title} className={cardClassName}>
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  {post.tag}
                </span>
                <span className="text-sm text-muted">{post.readTime}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold text-text">{post.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{post.summary}</p>
              <a href={post.href} className="mt-6 inline-flex text-sm font-semibold text-accent">
                Read article
              </a>
            </article>
          ))}
        </ContentGrid>

        <ContentGrid
          id="interview-questions"
          eyebrow="Interview Questions"
          title="Prep with structure, not scattered tabs."
          description="Group interview content by topic and difficulty so the site becomes a study tool as well as a publishing platform."
        >
          {interviewQuestions.map((topic) => (
            <article key={topic.title} className={cardClassName}>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{topic.level}</span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-text">{topic.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{topic.description}</p>
              <a href={topic.href} className="mt-6 inline-flex text-sm font-semibold text-accent">
                Browse questions
              </a>
            </article>
          ))}
        </ContentGrid>

        <ContentGrid
          id="resources"
          eyebrow="Learning Resources"
          title="Curate signal-rich material for future you."
          description="Resources, cheat sheets, and notes belong in one system so your research becomes easier to revisit and share."
        >
          {learningResources.map((resource) => (
            <article key={resource.title} className={cardClassName}>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{resource.format}</span>
              <h3 className="mt-5 font-display text-2xl font-semibold text-text">{resource.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{resource.description}</p>
              <a href={resource.href} className="mt-6 inline-flex text-sm font-semibold text-accent">
                Open resource
              </a>
            </article>
          ))}
        </ContentGrid>

        <RoadmapTimeline />

        <ContentGrid
          id="projects"
          eyebrow="Featured Projects"
          title="Show the work behind the output."
          description="Project case studies give your portfolio depth by highlighting constraints, decisions, tradeoffs, and outcomes."
          columns="md:grid-cols-2"
        >
          {featuredProjects.map((project) => (
            <article key={project.title} className={cardClassName}>
              <h3 className="font-display text-2xl font-semibold text-text">{project.title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted">{project.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-canvas px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <a href={project.href} className="mt-6 inline-flex text-sm font-semibold text-accent">
                View showcase
              </a>
            </article>
          ))}
        </ContentGrid>

        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
