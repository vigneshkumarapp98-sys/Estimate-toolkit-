# Estimate App (React + Vite)

One JSON document per estimate. It holds five sections: Estimate Letter, Report, LT Regulation,
Materials Valuation and Pole Schedule, plus shared `common` data (applicant, SC no., load, cost).

## Run locally
```
npm install
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
```
Requires Node.js 18+.

## What is implemented
- JSON Schema (draft-07): `src/schema/estimate.schema.json`, validated with `ajv` (`src/lib/validate.js`).
- Add / update / duplicate / delete estimates (list page).
- Editor with one tab per section, plus a raw **JSON** tab (edit, validate, apply to the form).
- Save is blocked until the data matches the schema; errors are listed.
- Import JSON (one estimate or an array; imports with an existing `id` update that estimate) and Export JSON.
- Totals computed in the UI: load-section totals, material amounts and totals, written-down value, pole totals.
- Storage: browser `localStorage` (`src/lib/storage.js`).

## Not implemented yet
- Regulation (%) formulas and the printed Letter / Report / PDF layouts from the earlier HTML tools.
  They need the final field list; send the sheet and they can be added as functions in `src/lib`.

## Storage on Vercel
Vercel cannot write to a JSON file on disk, so data is kept in the browser for now.
For shared, persistent data, replace the three functions in `src/lib/storage.js`
(`listEstimates`, `saveEstimate`, `deleteEstimate`) with `fetch("/api/estimates")` calls and add
serverless functions in an `api/` folder backed by Supabase, Vercel Blob or Upstash Redis.
Put the keys in Vercel -> Project -> Settings -> Environment Variables.

## Deploy to Vercel
1. Push this folder to a GitHub repository.
2. vercel.com -> Add New -> Project -> import the repository.
3. Framework Preset: Vite (build `npm run build`, output `dist`, already in `vercel.json`).
4. Deploy. Every `git push` redeploys automatically.

Or with the CLI: `npm i -g vercel` then `vercel` inside this folder.

## Structure
```
src/schema/estimate.schema.json   JSON Schema
src/lib/model.js                  new-estimate defaults, helpers
src/lib/validate.js               ajv validation
src/lib/storage.js                storage (localStorage)
src/components/Tabs.jsx           the section forms
src/components/Editor.jsx         tabs, save, export
src/App.jsx                       list, import / export
```
