# Resume Parser — Web Frontend

The user-facing companion to the Resume Parser API. Built with Next.js 14 + Tailwind + Framer Motion.

## What this is

A polished, editorial-style web app for the AI Job Application Tracker. Users drop a PDF/DOCX résumé, the FastAPI backend parses it via Gemini, and this UI displays the structured result like a designed editorial spread.

**Live API**: https://tahir283417-resume-parser.hf.space
**Source**: this repo

## Stack

- **Next.js 14** (App Router) — React with sensible defaults
- **Tailwind CSS** — utility styling
- **Framer Motion** — page transitions and stagger animations
- **Lucide React** — minimal icon set
- **Fraunces / Inter / JetBrains Mono** — distinctive editorial typography

No backend code lives here. This is a thin client over the parser API.

## Local development

```bash
npm install
cp .env.example .env.local
# Edit .env.local if you want to point at a different API
npm run dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

Vercel is free, doesn't require a credit card, and deploys in ~90 seconds.

1. Push this code to a GitHub repository
2. Go to <https://vercel.com> and sign up with GitHub
3. Click **Add New → Project**
4. Import this repository
5. Vercel auto-detects Next.js. Leave all defaults.
6. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://tahir283417-resume-parser.hf.space`
7. Click **Deploy**

You'll get a URL like `resume-parser-web.vercel.app`.

## Project structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout with fonts and metadata
│   ├── page.tsx         # Main landing page with all stages
│   └── globals.css      # Editorial typography and effects
├── components/
│   ├── UploadZone.tsx   # Drag-and-drop file uploader
│   ├── LoadingState.tsx # Staggered animated loading state
│   └── Results.tsx      # Magazine-style result display
└── lib/
    ├── api.ts           # API client for the parser backend
    └── types.ts         # TypeScript types matching the API
```

## Design notes

The aesthetic is intentionally editorial — large serif headlines (Fraunces), warm paper background, a single burnt-sienna accent, generous negative space, and numbered section labels. It signals craft and intentionality, not "another AI demo."

Customization tips:
- Change the accent color in `tailwind.config.ts` (currently `#b8472f`)
- Replace fonts in `src/app/layout.tsx`
- Adjust copy in `src/app/page.tsx`
