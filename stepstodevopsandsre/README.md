# stepstodevopsandsre

Existing static site prepared for GitHub Pages production deployment with Vite, React, TypeScript, and Tailwind CSS.

## Framework and Build

- Framework: Vite + React + TypeScript
- Styling: Tailwind CSS
- Dev command: `npm run dev`
- Production build: `npm run build`
- Output directory: `dist/`

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that:

- triggers on pushes to `main`
- installs dependencies with `npm ci`
- builds the site with `npm run build`
- uploads `dist/`
- deploys with the official GitHub Pages actions

### Required Repository Setting

In GitHub, open:

`Repository -> Settings -> Pages`

Set:

- Source: `GitHub Actions`

## Production URL

Target production URL:

[https://stepstodevopsandsre.github.io/](https://stepstodevopsandsre.github.io/)

The Vite production base is configured as `/` so assets resolve from the site root.

## Important Repository Requirement

For the site to actually publish at the root URL above, GitHub Pages must serve this project as the account site. In practice, that means the published repository should be:

`stepstodevopsandsre/stepstodevopsandsre.github.io`

If the repository remains `stepstodevopsandsre/stepstodevopsandsre`, GitHub Pages normally publishes it as a project site at:

[https://stepstodevopsandsre.github.io/stepstodevopsandsre/](https://stepstodevopsandsre.github.io/stepstodevopsandsre/)

## Static Hosting Compatibility Notes

- No SSR dependency detected; this is a client-built static Vite app.
- Build output is static and suitable for GitHub Pages.
- No app router was found; current navigation is section-anchor based, so SPA fallback handling is not required.
- No local image import issues were detected in the current source tree.
- Asset resolution is configured for root-hosted Pages deployment.

## Deployment Process

1. Commit the deployment configuration changes.
2. Push the branch to GitHub.
3. Ensure the default deployment branch is `main`, or push these commits to `main`.
4. Confirm `Settings -> Pages -> Source` is set to `GitHub Actions`.
5. Wait for the `Deploy GitHub Pages` workflow to finish.
6. Open the published site URL.
