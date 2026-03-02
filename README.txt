IMMORTAL RIDERS — SPOTLIGHT QUICK START

1. Extract this zip.
2. Copy files into your repo root.
3. Replace data/spotlight.json to edit content.
4. Run:

   git add .
   git commit -m "Update spotlight"
   git push

Netlify will auto-deploy.


PHASE 2 CONTENT QA

Run this before committing content changes:

   node scripts/validate-content.mjs

This validates:
- data/events.json required fields and time ordering
- data/spotlight.json required spotlight fields


PHASE 3 CONTENT STUDIO

Use the browser editor at:

   /admin/

What it does:
- Loads current data/events.json and data/spotlight.json
- Validates both files in-browser
- Downloads updated events.json / spotlight.json for easy replacement

Recommended flow:
1) Open /admin/ and edit content
2) Validate
3) Download updated files
4) Replace files in /data
5) Run: node scripts/validate-content.mjs
