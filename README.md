# Today's Focus
https://focus-today-now.netlify.app/


## Make today count, one meaningful goal at a time.

Today's Focus is a calm, local-first productivity workspace for turning a long to-do list into a small plan you can actually finish. Choose up to five focus goals, give each one a realistic estimate, work with a persistent timer, and close the day with a quick reflection.

There is no account, feed, or noisy productivity system to maintain. Your daily record stays in the browser, so the app keeps attention on the work in front of you.

## Why it works

- **A five-goal limit** keeps the day focused and makes tradeoffs visible.
- **One active timer** protects attention by automatically pausing the previous goal when you switch.
- **Progress by completion** makes the finish line easy to understand: every completed goal moves the day forward.
- **Planned versus worked time** shows the difference between your intention and the time you actually invested.
- **A daily reflection** gives wins, blockers, and lessons a place to land.
- **Read-only history** lets you review previous days without pulling old work back into today's workspace.

## Features

### Plan with intention

Add up to five goals for the current local day. Titles are trimmed and validated, durations are constrained to practical 15-240 minute estimates, and planned goals can be edited until timing begins.

### Focus with a reliable timer

Start, pause, and complete goals from the same workspace. Timer state is based on persisted timestamps, so a running goal survives a refresh. The app ensures that only one goal can run at a time and safely pauses an active goal at midnight.

### Finish with proof of progress

Completed goals move into a read-only record with estimated time, actual worked time, and completion time. Goals without timer time can still be completed with a validated manual work estimate.

### Reflect and review

Daily notes save automatically while you write and flush on blur. Previous records provide a read-only view of earlier goals, totals, completion progress, and reflections. When a day needs a clean start, **Start Fresh Day** resets the current record only after confirmation.

### Stay in control of your data

All records are stored in IndexedDB in the browser. There is no backend, login, or external API. Storage failures are surfaced clearly and editing is disabled rather than risking silent data loss.

## Getting started

### Requirements

- Node.js
- pnpm

### Install and run

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite, add today's first goal, and start focusing.

## Commands

```bash
pnpm dev       # Start the Vite development server
pnpm build     # Type-check and create a production build
pnpm lint      # Run ESLint
pnpm test      # Run the Vitest test suite
pnpm preview   # Preview the production build locally
```

## Tech stack

- React 19 with TypeScript
- Vite 8
- IndexedDB through [`idb`](https://github.com/jakearchibald/idb)
- Vitest for timer behavior tests
- ESLint with TypeScript and React Hooks rules
- React Compiler enabled through the Vite setup

## Project shape

The app keeps behavior close to the feature it powers:

- `src/App.tsx` coordinates the current-day workflow, persistence, rollover, and timer actions.
- `src/components/` contains the dashboard, goal controls, summaries, reflections, reset flow, and history view.
- `src/timer.ts` owns timestamp-based timer transitions.
- `src/goalValidation.ts` centralizes goal and manual-time validation.
- `src/storage.ts` provides the typed IndexedDB boundary.
- `src/types.ts` defines the daily record and goal model.

## Product boundaries

Today's Focus is intentionally designed around the current local calendar day. It does not provide shared workspaces, notifications, recurring tasks, cloud sync, or account-based access. The constraint is the feature: less maintenance, fewer distractions, and a clearer finish line.
