import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, X } from "lucide-react";
import type { BlogPost } from "@/types";

type BlogPreviewModalProps = {
  post: BlogPost | null;
  onClose: () => void;
};

export const BlogPreviewModal = ({ post, onClose }: BlogPreviewModalProps) => {
  useEffect(() => {
    if (!post) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [post]);

  useEffect(() => {
    if (!post) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, post]);

  return (
    <AnimatePresence>
      {post && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-preview-title"
        >
          <motion.div
            className="flex max-h-[min(88vh,52rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-canvas shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <header className="flex items-start justify-between gap-5 border-b border-border/70 px-5 py-5 sm:px-7">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  <span className="rounded-full bg-accentSoft px-3 py-1">{post.tag}</span>
                  <span className="text-muted">{post.readTime}</span>
                </div>
                <h2 id="blog-preview-title" className="mt-4 font-display text-2xl font-semibold leading-tight text-text sm:text-3xl">
                  {post.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full border border-border/70 p-2 text-muted transition hover:border-accent/40 hover:text-text"
                aria-label="Close article preview"
                title="Close article preview"
              >
                <X size={18} />
              </button>
            </header>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
              <motion.div
                className="pointer-events-none absolute right-6 top-6 text-accent/35"
                animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.8, 0.35] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              >
                <Eye size={22} />
              </motion.div>

              <p className="max-w-3xl text-base leading-8 text-muted sm:text-lg">{post.summary}</p>
            </div>

            <footer className="flex justify-end border-t border-border/70 px-5 py-4 sm:px-7">
              <a href={post.href} className="text-sm font-semibold text-accent transition hover:text-text">
                Read full article
              </a>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
