import { useEffect, useState } from "react";
import { Check, Share2 } from "lucide-react";

type ShareButtonProps = {
  href: string;
  title: string;
};

const copyToClipboard = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard copy failed");
};

export const ShareButton = ({ href, title }: ShareButtonProps) => {
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!shared) return;
    const timer = window.setTimeout(() => setShared(false), 1800);
    return () => window.clearTimeout(timer);
  }, [shared]);

  const handleShare = async () => {
    const url = new URL(href, window.location.href).toString();

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await copyToClipboard(url);
      }
      setShared(true);
    } catch (error) {
      // Closing the native share sheet is not an error the user needs to see.
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await copyToClipboard(url);
        setShared(true);
      } catch {
        // Keep the card stable if clipboard access is unavailable.
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-surface/80 text-muted transition hover:border-accent/35 hover:bg-accentSoft hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      aria-label={shared ? `Link copied for ${title}` : `Share ${title}`}
      title={shared ? "Link copied" : "Share"}
    >
      {shared ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
    </button>
  );
};
