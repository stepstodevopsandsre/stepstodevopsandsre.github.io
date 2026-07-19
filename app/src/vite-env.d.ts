/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BLOG_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  mermaid?: {
    initialize: (config: Record<string, unknown>) => void;
    run: (opts: { querySelector: string }) => void;
  };
  __mermaidLoaded?: boolean;
}

