# HYH Writeups – Jekyll Template (GitHub Pages)

A professional, no-backend blog for security writeups. Features:
- Dark/Light mode (Moon/Sun toggle with persistence)
- Responsive navbar with hamburger
- Client-side filtering by category, tags, and search
- Zero database, GitHub Pages compatible
- Posts in Markdown
- Cards grid with cover, tags, date, and reading time

## Quick start
1. Click the **Download** link from ChatGPT and unzip.
2. Push the folder to a GitHub repo named `<username>.github.io` or any repo + enable Pages.
3. (Optional) For a project repo, set `baseurl: "/repo-name"` in `_config.yml`.
4. Add new posts by copying files in `_posts` (use the naming `YYYY-MM-DD-title.md`).
5. Customize styles in `assets/css/style.css` and the palette in `:root` CSS variables.

## Local preview
```bash
bundle install
bundle exec jekyll serve
```
Then open http://localhost:4000
