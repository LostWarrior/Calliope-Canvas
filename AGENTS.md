# Calliope-Canvas Agent Guide

## Project Overview

Calliope-Canvas is a React + TypeScript presentation framework. Slides are React components; the app is a Vite-bundled SPA.

## Key Files

- `App.tsx` — deck orchestrator: slide array, navigation, voice control, zoom, keyboard shortcuts
- `SpeakerNotes.tsx` — speaker-notes popup, synced to main deck via BroadcastChannel
- `types.ts` — shared types (`SlideDefinition`, `AnimationState`, `DataPacket`, `VoiceAction`)
- `components/Header.tsx` — sidebar toggle, breadcrumb, presentation-mode button; shown/hidden via `headerConfig` in `App.tsx`
- `components/ProgressBar.tsx` — slide progress bar; placed via `progressBarConfig` in `App.tsx`
- `components/Footer.tsx` — footer bar
- `components/SlideSidebar.tsx` — optional slide navigator, grouped by `section`; text set via `sidebarConfig` in `App.tsx`
- `components/HelpOverlay.tsx` — shift+? help overlay
- `components/Icons.tsx` — SVG icons
- `slides/` — individual slide components
- `presentationBehavior.ts`, `speechFollowBehavior.ts`, `transcript.ts` — pure logic, no React; tests sit beside them as `*.test.ts`
- `speech-recognition.d.ts` — ambient Web Speech API types

## Adding Slides

1. Create a component in `slides/MySlide.tsx`
2. Register it in the `slides` array in `App.tsx`:

```tsx
{
  content: <MySlide />,
  notes: ['Speaker note one.', '[Italicized note in brackets.]'],
  title: 'My Slide',
}
```

Notes in `[square brackets]` are automatically italicized in the speaker-notes window.

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Preview build | `npm run preview` |
| Type check only | `npx tsc --noEmit` |
| Tests | `npm test` |

Dev server runs on **http://localhost:3000**.

## Conventions

- Functional components, arrow function style, typed props interfaces
- PascalCase for components/types; camelCase for functions/variables; SCREAMING_SNAKE_CASE for module-level constants
- `@/` alias resolves to project root
- Tailwind CSS v4 via `@tailwindcss/vite`; configured in `index.css` (no `tailwind.config.js`)
- Themes are `[data-theme='…']` blocks in `index.css` setting `--theme-*` RGB triplets; `@theme inline` maps them to utilities (`bg-canvas`, `text-muted`, `bg-primary/85`, …)
- Style with semantic theme utilities, never fixed palette colours
- No linter or formatter configured
- Tests use `node:test` and run as TypeScript directly in Node (22.18+), with no test framework or loader. Relative imports between these modules need the `.ts` extension, and they can only import types from other files (`import type`)

## Architecture Notes

- `SlideDefinition` in `types.ts` is the contract for all slide entries
- Speaker-notes sync uses the `BroadcastChannel` API (channel name in `SPEAKER_NOTES_CHANNEL`)
- Voice control uses the Web Speech API; microphone permission is requested on deck load
- `AnimationState` enum drives per-slide animation state machines
- `@/` path alias configured in both `vite.config.ts` and `tsconfig.json`
