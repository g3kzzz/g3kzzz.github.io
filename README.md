G3KZZZ Writeups — Static GitHub Pages project
--------------------------------------------

How it works:
- Put your writeup markdown files into the `writeups/` folder.
- Update `writeups/index.json` to list each writeup (title, date, machine, tags, description, file).
- The homepage (index.html) reads index.json and renders cards. No server or DB needed.
- Click a writeup to open it (writeup.html loads the raw markdown and renders it).
- Toggle theme with the moon/sun button. All text is English.

Fields recommended for each entry in index.json:
- title (string)
- date (YYYY-MM-DD)
- machine (string)
- tags (array of strings)
- description (short string)
- file (path to the markdown file)
- readtime (minutes, optional)

Deploy: push this repo to GitHub and enable GitHub Pages from main branch (or gh-pages).

Enjoy! ✨