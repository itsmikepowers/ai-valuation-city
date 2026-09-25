# AI Valuation City

An explorable React Three Fiber / Next.js city built from the 20-company dataset in `lib/data.ts`.

```sh
npm install
npm run dev
npm test
npm run lint
npm run build
npm start
```

Use separate output directories or stop the development server before building and starting production; both Next.js modes otherwise share `.next`.

## Explore

- Enter the city for a cinematic camera descent.
- Left drag rotates; right drag pans; scroll zooms. On touch, one finger rotates and two fingers pan/pinch.
- Hover a building to highlight it. Click or double-click to select and fly to it. Signage also works by keyboard.
- Search (`/` shortcut), use arrow keys to choose a result, and press Enter to fly there. Search also recognizes Cursor's company name, Anysphere.
- District links fly to neighborhoods. Home restores the overview; eye toggles signage; compass explains controls.
- Rankings opens a compact directory over the city. Company details include event status, dated history, funding coverage and original source links.
- Choose 2–4 companies to move their buildings to the comparison platform. Return to City animates them back.
- Drag the timeline, choose a year, or play the recorded growth sequence. History events also rewind the city.

## Data semantics

The supplied snapshot ends **September 30, 2025**, despite the timeline extending to September 2026. Later dates carry the last supplied records forward. The app does not claim these are live or complete market valuations. Valuation types are preserved, including acquisition values and tender offers.

Before founding, a building is absent. After founding but before its first supplied record, a construction site denotes **unknown valuation**, not zero. Growth follows actual included records; animated transitions are visual interpolation only. Funding is the sum of disclosed raises in this dataset, **not lifetime funding**. Missing employees and revenue remain explicitly unavailable. Investor lists describe the supplied snapshot, not historical membership.

Height uses `2 + 1.55 × valuation^0.68`, with valuation in USD billions. Width increases with valuation; procedural families have different shapes, so architectural volume is not a literal financial ratio. The included records are not independently refreshed or reverified against current source pages.

## Rendering

Buildings are deterministically seeded and grouped into six architectural families with bespoke major landmarks. Building pieces, windows, roads, vegetation, streetlights, cars and pedestrians use instanced geometry. Cars/pedestrians animate without React state updates. Device pixel ratio is capped at 1.5; shadow maps refresh during geometry changes and then cache. GSAP drives interruptible camera flights, and Framer Motion handles overlay transitions. Reduced-motion settings remove camera transitions and traffic motion. Company logos use remote favicons with graceful text fallbacks; typography falls back to local sans-serif if Google Fonts is unavailable.

## Verification

`lib/city.test.ts` covers month-end/leap-year dates, historical visibility, snapshot cutoffs, event types, missing vs disclosed funding, non-mutating lookups, relative scale, unique deterministic parcels/seeds, source attribution and currency formatting. Browser smoke checks additionally exercise desktop/mobile entry, search, selection, history/source tabs, comparison/return, rewind/playback, labels and rankings.
