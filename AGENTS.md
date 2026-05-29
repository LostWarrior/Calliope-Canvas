# Calliope-Canvas Agent Guide

## Project Overview

Calliope-Canvas is a React + TypeScript presentation framework. Slides are React components; the app is a Vite-bundled SPA.

## Key Files

- `App.tsx` — deck orchestrator: slide array, navigation, voice control, zoom, keyboard shortcuts
- `SpeakerNotes.tsx` — speaker-notes popup, synced to main deck via BroadcastChannel
- `types.ts` — shared types (`SlideDefinition`, `AnimationState`, `DataPacket`, `VoiceAction`)
- `components/Footer.tsx` — footer bar
- `components/HelpOverlay.tsx` — shift+? help overlay
- `components/Icons.tsx` — SVG icons
- `slides/` — individual slide components
- `presentationBehavior.js` — pure animation/behavior logic (testable, no React)
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

Dev server runs on **http://localhost:3000**.

## Conventions

- Functional components, arrow function style, typed props interfaces
- PascalCase for components/types; camelCase for functions/variables; SCREAMING_SNAKE_CASE for module-level constants
- `@/` alias resolves to project root
- No CSS framework — plain `index.css`
- No linter or formatter configured
- No test runner configured in `package.json`; `presentationBehavior.test.js` is standalone

## Architecture Notes

- `SlideDefinition` in `types.ts` is the contract for all slide entries
- Speaker-notes sync uses the `BroadcastChannel` API (channel name in `SPEAKER_NOTES_CHANNEL`)
- Voice control uses the Web Speech API; microphone permission is requested on deck load
- `AnimationState` enum drives per-slide animation state machines
- `@/` path alias configured in both `vite.config.ts` and `tsconfig.json`
