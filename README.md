# Steps to DevOps and SRE

This repository hosts the GitHub Pages frontend for [https://stepstodevopsandsre.github.io/](https://stepstodevopsandsre.github.io/). It is a static Vite + React + TypeScript site with a secure Netlify function layer for fetching canonical blog and interview-prep content from Notion.

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
NOTION_BLOG_PUBLISHED_VALUE=Done
NOTION_INTERVIEW_DATABASE_ID=your_notion_interview_questions_database_id
NOTION_INTERVIEW_SLUG_PROPERTY=Slug
NOTION_INTERVIEW_SLUG_PROPERTY_TYPE=rich_text
NOTION_INTERVIEW_STATUS_PROPERTY=Status
NOTION_INTERVIEW_STATUS_PROPERTY_TYPE=status
NOTION_INTERVIEW_PUBLISHED_VALUE=Done
NOTION_INTERVIEW_SORT_PROPERTY=Published Date
ALLOWED_ORIGIN=https://stepstodevopsandsre.github.io
```

Legacy fallback only:

```bash
NOTION_BLOG_PAGE_MAP={"grafana-observability-p95-p99-latency":"3a15aace-fb86-8180-b37a-e46f5847cad7"}
```

## Recommended Notion Model

Use a Notion database as the publishing index instead of maintaining a JSON slug map.

Recommended blog database properties:

- `Name` as the database title property
- `Slug` as a `rich_text` or `title` property containing the URL slug
- `Status` as a `status` or `select` property

Recommended publishing rule:

- Each blog article should live in the database as its own row page.
- The row page content is the article body.
- Set `Status` to `Done` when it is ready for the site.

Request flow:

1. A visitor opens a GitHub Pages blog route like `#/blog/grafana-observability-p95-p99-latency`.
2. The frontend calls the Netlify function with that slug.
3. The Netlify function queries the Notion database for `Slug = slug` and `Status = Done`.
4. The matching Notion row page is converted to Markdown and sanitized HTML.
5. The article is rendered in the GitHub Pages frontend.

No page-id mapping needs to be updated when new posts are added, as long as the Notion database entry is created correctly.

## Recommended Interview Questions Model

Use a second Notion database for interview questions. The flow mirrors the blog pipeline: only rows with `Status = Done` are returned to the public site, and `In Progress` / `Not Started` rows stay hidden.

Required interview database properties:

- `Question` as the database title property
- `Domain` as a `select` property for the tool/domain filter, for example `Docker`, `Linux`, `Kubernetes`, `Jenkins`
- `Notion Page URL` as a `url` property pointing to the canonical answer page, or leave it empty to render the database row page body
- `Slug` as a `rich_text` or `title` property containing the URL slug
- `Keywords` as a `multi_select` property, or comma-separated `rich_text`
- `Status` as a `status` or `select` property
- `Published Date` as a `date` property

Optional interview database property:

- `Company` or `Companies` as `multi_select`, `select`, or comma-separated `rich_text` for the company filter

Request flow:

1. A visitor opens `#interview-questions`.
2. The frontend calls `/.netlify/functions/interview-questions?pageSize=10`.
3. The Netlify function queries the interview database for `Status = Done`, sorted by `Published Date`.
4. The frontend renders filterable question cards with tool/domain and company filters.
5. A visitor opens a question route like `#/interview-questions/what-is-page-fault`.
6. The frontend calls `/.netlify/functions/interview-question?slug=what-is-page-fault`.
7. The function finds the published row by `Slug`, renders `Notion Page URL` content if present, otherwise renders the row page body.

## How the Notion Blog Flow Works

1. Blog content stays canonical in Notion.
2. The GitHub Pages frontend calls the Netlify endpoint `/.netlify/functions/blog?slug=...`.
3. The Netlify function reads the matching published Notion page using the server-side token.
4. The function converts Notion blocks to Markdown and sanitized HTML.
5. CORS allows requests only from `https://stepstodevopsandsre.github.io` and local development.

No Notion secret is exposed in the browser or in the GitHub Pages deployment.

## How the Notion Interview Flow Works

1. Interview answers stay canonical in Notion.
2. The GitHub Pages frontend calls `/.netlify/functions/interview-questions` for the paginated index.
3. The frontend derives `Tool / Domain` and `Company` filters from returned Notion rows.
4. The detail route calls `/.netlify/functions/interview-question?slug=...`.
5. The function enforces `Status = Done`, converts the Notion answer page to Markdown and sanitized HTML, and returns it to the browser.

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
- Sample interview question route: `https://stepstodevopsandsre.github.io/#/interview-questions/what-is-page-fault`

## Files Added for the Notion Integration

- `netlify/functions/blog.js`
- `netlify/functions/_shared/blog-utils.js`
- `netlify/functions/interview-questions.js`
- `netlify/functions/interview-question.js`
- `netlify.toml`
- `tests/blog-utils.test.mjs`
- `.env.example`

## Deployment Sequence

1. Push this repository to `main`.
2. Wait for the `Deploy GitHub Pages` workflow to finish.
3. In Netlify, connect the repo and configure the function environment variables.
4. Create the Notion blog and interview-question databases and share both with the Notion integration token.
5. Add a row page for each article/question and set its `Slug` and `Status`.
6. Configure both database IDs in Netlify.
7. Confirm the Pages site is active in GitHub settings.
8. Open the GitHub Pages URL and test the sample blog and interview-question routes.

