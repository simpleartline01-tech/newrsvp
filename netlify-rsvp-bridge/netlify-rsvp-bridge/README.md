# Netlify RSVP Bridge

A Netlify Function that acts as a CORS bridge between a Canva website
(frontend) and a Google Apps Script Web App (backend).

## Structure

```
netlify-rsvp-bridge/
├── netlify.toml
└── netlify/
    └── functions/
        └── rsvp.js
```

## How it works

1. Your Canva site calls `fetch("https://YOUR-SITE.netlify.app/.netlify/functions/rsvp", { method: "POST", body: JSON.stringify(formData) })`
2. This function receives that request, forwards the JSON body to your Google Apps Script Web App, and returns the response back to Canva — with CORS headers attached so the browser doesn't block it.

## Deploying

See the deployment steps provided in chat, or:

1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
3. Build settings: leave build command blank, publish directory blank (not needed for functions-only sites).
4. Deploy. Your endpoint will be:
   `https://YOUR-SITE-NAME.netlify.app/.netlify/functions/rsvp`
5. Paste that URL into your Canva site's fetch() call instead of the Google Apps Script URL.
