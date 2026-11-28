import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const secretKeys = [
  "NOTION_TOKEN",
  "NOTION_BLOG_DATABASE_ID",
  "NOTION_INTERVIEW_DATABASE_ID",
  "NOTION_PRACTICE_DATABASE_ID"
];
const ignoredDirectories = new Set([".git", "node_modules", "dist", ".codex", ".agents"]);
const textExtensions = new Set([".js", ".mjs", ".ts", ".tsx", ".json", ".md", ".toml", ".yml", ".yaml", ".html", ".css"]);

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...await walk(path.join(directory, entry.name)));
      continue;
    }
    if (textExtensions.has(path.extname(entry.name).toLowerCase())) files.push(path.join(directory, entry.name));
  }
  return files;
};

const configuredSecrets = secretKeys
  .map((key) => ({ key, value: process.env[key] || "" }))
  .filter(({ value }) => value.length >= 8 && !value.startsWith("your_") && !value.startsWith("secret_your_"));

if (configuredSecrets.length === 0) process.exit(0);

const violations = [];
for (const file of await walk(root)) {
  const contents = await readFile(file, "utf8");
  for (const { key, value } of configuredSecrets) {
    if (contents.includes(value)) violations.push(`${key}: ${path.relative(root, file)}`);
  }
}

if (violations.length > 0) {
  console.error("Build stopped: configured secret values were found in tracked text files.");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}
