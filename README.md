# Collin Westerlund — collinwesterlundmusic.com

Eleventy site. Page layouts live in `src/*.njk` and `src/_includes/`; everything Collin edits lives in `src/_data/*.json` and is changed through the editor at `/admin/` (Sveltia CMS). Site history and restore: `/admin/history/`.

- `src/_data/releases.json` — releases; newest is featured on the home page
- `src/_data/notebook.json` — Notebook posts
- `src/_data/press.json`, `photos.json`, `videos.json`, `site.json`
- `src/root/` — files copied as-is to the site root (CNAME, favicons, press kit, redirects)

Build: `npm ci && npx @11ty/eleventy` → `_site/`. Deploys through GitHub Actions on every push to main.
