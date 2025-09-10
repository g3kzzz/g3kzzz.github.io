# G3K Writeups – GitHub Pages Site

A professional, fully static writeups portal. No databases or servers – just HTML/CSS/JS and JSON.

## Features
- Light/Dark mode with Sun/Moon toggle (persisted with `localStorage`).
- Separate filter section with **platform badges** and counts.
- Search bar (title, tags, platform) with a Search button and Enter key support.
- Optional difficulty filter.
- **Recent writeups** limited to the latest 9 by date.
- Detail pages loaded from local HTML files; all routing is static and GitHub Pages–friendly.
- Accessible, responsive, and fast.

## Structure
```
/index.html              — main page with filters, search, grids
/post.html               — dynamic detail view (loads the HTML file)
/assets/css/style.css    — theme and layout
/assets/js/app.js        — list page logic
/assets/js/post.js       — detail page logic
/data/writeups.json      — writeups metadata (your single source of truth)
/writeups/*.html         — content files (you can write plain HTML here)
```

## Add a new writeup
1. Create a new `writeups/<your-slug>.html` with your content.
2. Append a JSON entry to `data/writeups.json`, e.g.:
```json
{
  "id": "htb-newbox",
  "title": "HackTheBox: NewBox",
  "platform": "HackTheBox",
  "date": "2025-09-09",
  "difficulty": "Medium",
  "tags": ["Linux", "Web"],
  "summary": "Short one-line summary for the cards.",
  "file": "writeups/htb-newbox.html"
}
```
3. Commit and push to GitHub. Enable GitHub Pages (root of `main` branch).

## Local test
Just open `index.html` with a local server (e.g. VS Code Live Server) to avoid CORS when fetching JSON/HTML.
On GitHub Pages everything works out of the box.
