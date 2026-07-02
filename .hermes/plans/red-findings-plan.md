# Red Findings Plan — voice-agent

Scope: fix high-severity runtime/dependency/behavior risks only. No theme or yellow/low changes here.

## 1. Unify auth path for TTS generation
- File: `client/src/lib/tts.ts`
- Problem: `generateSpeech()` calls `/api/generate` via raw `fetch`, while other flows use `actions/generate-speech.ts` server actions with `auth()`.
- Change: change the client route to call the existing Next.js server action instead of raw fetch.
- Preserve current API contract: validation error handling, format handling, and returned blob/URL.
- File: `client/src/app/api/generate/route.ts` plus refactor in `client/src/lib/tts.ts`.

## 2. Fix blob URL lifecycle + error-path leaks
- Files: `client/src/lib/tts.ts`, `client/src/components/client/speech-synthesis/text-to-speech-editor.tsx`
- Problem: old blob URLs may leak on rapid regenerate calls and on thrown errors after creation.
- Change:
  - centralize blob URL revoking in `generateSpeech()` before creating a new object URL if caller already holds one;
  - in `handleGenerate`, revoke previous URL before reset state and also on error if a new URL was created.

## 3. Make playbar seek accessible
- File: `client/src/components/client/playbar.tsx`
- Problem: seek control is a clickable `<div>` with no keyboard support or ARIA slider semantics.
- Change:
  - replace seek div with `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-label`;
  - add keyboard handlers for ArrowLeft/ArrowRight and Home/End;
  - keep existing click-to-seek.

## 4. Add timeout cap to polling loops
- Files: `client/src/components/client/speech-synthesis/voice-changer.tsx`, `client/src/components/client/sound-effects/sound-effects-generator.tsx`
- Problem: 500ms polling with no max timeout can loop forever on stuck backend states.
- Change:
  - add a max lifetime/timeout, e.g. 10 minutes;
  - surface user-visible failure state when poller times out;
  - stop consuming updates when timeout is reached.

## 5. Remove unused import in audio store
- File: `client/src/stores/audio-store.ts`
- Change: remove `import { addIssueToContext } from "zod"`.

## Verification
- Keep repo buildable after edits.
- Run build/lint if present.
- If the project later has a test runner, run it; otherwise verify behavior through smoke checks in affected flows.
