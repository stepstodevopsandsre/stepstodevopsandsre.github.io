# Steps to DevOps and SRE

This repository hosts the GitHub Pages frontend for [https://stepstodevopsandsre.github.io/](https://stepstodevopsandsre.github.io/). It is a static Vite + React + TypeScript site with a secure Netlify function layer for fetching canonical blog content from Notion.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Framer Motion
- GitHub Pages for the static frontend
- Netlify Functions for secure Notion access

## Local Development

Install dependencies:

```bash
npm install
```

Start the static frontend:

```bash
npm run dev
```

For the full frontend + function flow, use Netlify locally so the browser can call the serverless endpoint:

```bash
npx netlify dev
```

## Build

Create the production frontend build:

```bash
npm run build
```

Run the lightweight validation tests:

```bash
npm test
```

## Environment Variables

Create a local `.env` based on `.env.example`.

Required frontend variable:

```bash
VITE_BLOG_API_BASE_URL=https://your-netlify-site.netlify.app
```

Required Netlify function variables:

```bash
NOTION_TOKEN=secret_your_notion_integration_token
NOTION_BLOG_DATABASE_ID=your_notion_blog_database_id
NOTION_BLOG_SLUG_PROPERTY=Slug
NOTION_BLOG_STATUS_PROPERTY=Status
NOTION_BLOG_PUBLISHED_VALUE=Published
ALLOWED_ORIGIN=https://stepstodevopsandsre.github.io
```

Legacy fallback only:

```bash
NOTION_BLOG_PAGE_MAP={"grafana-observability-p95-p99-latency":"3a15aace-fb86-8180-b37a-e46f5847cad7"}
```

## Recommended Notion Model

Use a Notion database as the publishing index instead of maintaining a JSON slug map.

Recommended database properties:

- `Name` as the database title property
- `Slug` as a `rich_text` or `title` property containing the URL slug
- `Status` as a `status` or `select` property

Recommended publishing rule:

- Each blog article should live in the database as its own row page.
- The row page content is the article body.
- Set `Status` to `Published` when it is ready for the site.

Request flow:

1. A visitor opens a GitHub Pages blog route like `#/blog/grafana-observability-p95-p99-latency`.
2. The frontend calls the Netlify function with that slug.
3. The Netlify function queries the Notion database for `Slug = slug` and `Status = Published`.
4. The matching Notion row page is converted to Markdown and sanitized HTML.
5. The article is rendered in the GitHub Pages frontend.

No page-id mapping needs to be updated when new posts are added, as long as the Notion database entry is created correctly.

## How the Notion Blog Flow Works

1. Blog content stays canonical in Notion.
2. The GitHub Pages frontend calls the Netlify endpoint `/.netlify/functions/blog?slug=...`.
3. The Netlify function reads the matching published Notion page using the server-side token.
4. The function converts Notion blocks to Markdown and sanitized HTML.
5. CORS allows requests only from `https://stepstodevopsandsre.github.io` and local development.

No Notion secret is exposed in the browser or in the GitHub Pages deployment.

## GitHub Pages Deployment

The workflow at `.github/workflows/deploy.yml` builds the static frontend and deploys `dist/` using the official GitHub Pages actions.

GitHub settings required:

1. Open `Repository -> Settings -> Pages`
2. Set `Source` to `GitHub Actions`

Vite is configured with `base: "/"` because this repository is intended to be the account site repository: `stepstodevopsandsre.github.io`.

## Important 404 Diagnosis

As of July 19, 2026, the public GitHub API for `stepstodevopsandsre/stepstodevopsandsre.github.io` reports `has_pages: false`. That means the current 404 is not caused by the frontend code or asset paths; GitHub Pages is not actively attached to the repository yet, even if the Actions workflow completed successfully.

If the site still shows GitHub's default 404 page, re-open:

`Repository -> Settings -> Pages`

and confirm again that the source is set to `GitHub Actions` on the renamed repository itself.

## Expected URLs

- GitHub Pages frontend: [https://stepstodevopsandsre.github.io/](https://stepstodevopsandsre.github.io/)
- Netlify API base: `https://your-netlify-site.netlify.app`
- Sample live blog route: `https://stepstodevopsandsre.github.io/#/blog/grafana-observability-p95-p99-latency`

## Files Added for the Notion Integration

- `netlify/functions/blog.js`
- `netlify/functions/_shared/blog-utils.js`
- `netlify.toml`
- `tests/blog-utils.test.mjs`
- `.env.example`

## Deployment Sequence

1. Push this repository to `main`.
2. Wait for the `Deploy GitHub Pages` workflow to finish.
3. In Netlify, connect the repo and configure the function environment variables.
4. Create the Notion blog database and share it with the Notion integration token.
5. Add a row page for each article and set its `Slug` and `Status`.
6. Confirm the Pages site is active in GitHub settings.
7. Open the GitHub Pages URL and test the sample blog route.
