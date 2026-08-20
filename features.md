# Today's Focus Goals - Feature Specification

## Overview

Today's Focus Goals is a frontend-only productivity application for planning and tracking up to five focus goals for the current local calendar day. Users can add goals, estimate duration, track actual time, complete work, review completed goals, and write a daily reflection. All data is stored in IndexedDB; there is no backend, account, or login.

## Product Decisions and Invariants

- The app is strictly scoped to the current local calendar day. Date navigation and history are out of scope.
- Only one goal timer can run at a time. Starting a goal automatically pauses the currently running goal.
- The five-goal limit includes completed goals. Completing a goal does not free a slot.
- Worked time includes only completed goals. Paused and running goal time is excluded until completion.
- Completed goals are read-only by default and cannot be started, edited, or deleted.
- Start New Day clears today's record after confirmation; it does not switch to tomorrow.
- A running timer continues across refresh by using its persisted start timestamp.
- Storage errors are visible and disable editing actions rather than silently risking data loss.

## Shared Data Model

```ts
type GoalStatus = "planned" | "running" | "paused" | "completed";

type Goal = {
  id: string;
  title: string;
  estimatedMinutes: number;
  elapsedSeconds: number;
  status: GoalStatus;
  activeStartedAt?: string;
  createdAt: string;
  completedAt?: string;
};

type DailyFocusData = {
  dateKey: string;
  goals: Goal[];
  notes: string;
  updatedAt: string;
};
```

Use `crypto.randomUUID()` for goal IDs, with a timestamp fallback if unavailable. Trim titles before storing them. Titles contain 1–120 characters, and durations are whole numbers from 1–1440 minutes.

## Feature 1: Application Layout and Visual Structure - DONE

Present a calm, centered dashboard with a light background, rounded main surface, soft shadow, and the title **Focus on Today**. The screen contains a header, summary, progress bar, planned goals, goal form, completed goals, notes, and a small motivational line.

Acceptance criteria:

- The title is visible and the main content is centered.
- Distinct areas exist for progress, active goals, completed goals, and notes.
- The layout works on mobile, tablet, and desktop.
- The visual style is minimal, soft, and focus-oriented.

Recommended components are `App`, `Header`, `FocusSummary`, `ProgressBar`, `GoalForm`, `GoalList`, `GoalItem`, `CompletedGoals`, and `NotesSection`. Plain CSS may be used consistently with the existing project.

## Feature 2: Add Today's Goals - DONE

The form contains a goal title field, estimated-duration number field, and Add button. A user can create up to five goals for today's record.

Acceptance criteria:

- Blank or whitespace-only titles cannot be submitted.
- Titles are trimmed and limited to 1–120 characters.
- Duration must be an integer from 1–1440 minutes.
- The Add button is disabled or a clear limit message is shown when five goals exist.
- New goals appear in creation order and persist after refresh.

## Feature 3: Edit Goals - DONE

Planned goals may be edited inline. Once a goal's timer has started, it is permanently locked for editing, including after it is paused. Running, paused, and completed goals are read-only.

Acceptance criteria:

- Title and estimated duration can be changed for planned goals that have not started timing.
- The same title and duration validation used by the add form applies when saving edits.
- Cancelling an edit leaves the original goal unchanged.
- Saved edits persist in IndexedDB.

## Feature 4: Complete a Goal - DONE

Completion stops a running timer, stores `completedAt`, stores final elapsed time, moves the goal to Completed Goals, and updates progress immediately.

Completion can be initiated by a checkbox or Complete button. If `elapsedSeconds` is zero, the app must request a positive manual time estimate in whole minutes before completing. The manual value must be 1–1440 minutes and is added to `elapsedSeconds`. If a goal already has tracked timer time, completion does not prompt for additional time.

Status transitions are:

```text
planned -> running
planned -> completed (after manual time entry)
running -> paused
running -> completed
paused -> running
paused -> completed
```

## Feature 5: Progress Bar - DONE

Progress is based on goal count, not duration:

```ts
const totalGoals = goals.length;
const completedGoals = goals.filter(
  (goal) => goal.status === "completed",
).length;
const progressPercent =
  totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);
```

Display the percentage and count, such as `60% complete - 3/5 goals completed`. With no goals, display `0% complete - 0/0 goals completed`.

## Feature 6: Goal Timer Controls

Each active goal displays Start, Pause, and Complete controls plus readable elapsed time. Start records `activeStartedAt`; Pause adds the time since that timestamp to `elapsedSeconds`, changes status to paused, and clears the timestamp. Starting another goal pauses the existing running goal first.

The timer must use one interval/tick source for the active timer. It must not create duplicate intervals. Timer state is persisted after status changes and is recoverable after refresh:

- A running goal remains running and elapsed time is calculated from `activeStartedAt`.
- A paused goal remains paused with its saved elapsed time.
- Completing a running goal adds the final interval before clearing `activeStartedAt`.

## Feature 7: Duration Summary

Show planned and worked totals near the top:

```ts
const plannedMinutes = goals.reduce(
  (sum, goal) => sum + goal.estimatedMinutes,
  0,
);
const workedSeconds = goals.reduce(
  (sum, goal) =>
    goal.status === "completed" ? sum + goal.elapsedSeconds : sum,
  0,
);
```

Format values as `0m`, `45m`, or `1h 20m`, rounding down to whole displayed minutes. Planned time includes every goal; worked time includes completed goals only.

## Feature 8: Planned Goals List

Show all goals whose status is not completed, in creation order. Each item displays its title, estimated duration, elapsed duration, status text, and appropriate controls. The running item must be distinguishable by text and accessible state, not color alone. With no goals, show `Add up to 5 focus goals for today.`

## Feature 9: Completed Goals Section

Show completed goals below active goals. Each item displays title, estimated duration, actual worked time, and completion time. Sort by `completedAt` descending, newest first. With no completed goals, show `Completed goals will appear here.` Completed items persist and remain read-only.

## Feature 10: Notes and Daily Reflection

Provide a labelled multiline text area for blockers, wins, review, and reflection. Notes may be empty and save automatically with a debounce. Flush pending notes on blur where practical. Notes persist under today's record. A failed save shows the storage error and disables editing.

## Feature 11: IndexedDB Persistence

Use native IndexedDB or the small `idb` wrapper. Database name: `todays-focus-db`; version: `1`; object store: `dailyFocus`; key: `dateKey`.

Persist goals, statuses, durations, `activeStartedAt`, completion timestamps, notes, and `updatedAt`. Await writes before committing corresponding in-memory state. Open, read, write, and upgrade failures must show a visible persistence error and disable goal, timer, reset, and notes editing controls.

## Feature 12: Daily Data Handling

Store and load only the current local date. Use a local-date-safe key without UTC conversion:

```ts
function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

On load, create an empty record if today's record does not exist. If the app remains open across midnight, detect the date change on the next timer tick or user interaction, stop any previous-day running timer, and load or create the new current-day record.

## Feature 13: Start New Day

The header contains a clearly labelled **Start New Day** button. It opens an accessible confirmation dialog explaining that today's goals, timers, completed work, tracked durations, and notes will be cleared. It then replaces today's record with:

```ts
{
  dateKey: getLocalDateKey(),
  goals: [],
  notes: "",
  updatedAt: new Date().toISOString(),
}
```

Acceptance criteria:

- No data changes until confirmation.
- Cancelling leaves the current state unchanged.
- Confirming stops any running timer, saves the empty record, and updates the UI immediately.
- Progress and duration summaries reset to zero.
- The user can add new goals after reset.

## Feature 14: Validation and User Limits

Enforce the five-goal total limit, title and duration rules, and the status transitions defined above. Completed goals cannot be started, edited, or deleted. No delete action is provided in this version, so completed work remains part of the day's record until reset.

Show clear, field-associated validation messages. Disable invalid submissions and prevent duplicate timer intervals. Manual completion with zero tracked time requires a valid 1–1440 minute estimate.

## Feature 15: Empty States and Motivational Copy

Use lightweight copy that supports the workflow:

- `Add up to 5 focus goals for today.`
- `Completed goals will appear here.`
- `You finished today's focus list.` when every goal is complete.
- A small static motivational line such as `you are unstoppable, keep pushing`.

## Feature 16: Responsive and Accessible UI

Use semantic HTML, visible focus states, labelled inputs, keyboard-accessible buttons, and sufficient contrast. Timer status must be readable as text and not conveyed by color alone. The progress bar exposes `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`. Validation messages are associated with fields and announced to assistive technology. The reset confirmation has explicit, keyboard-accessible Confirm and Cancel actions. Timer and completion changes provide concise status announcements.

## Suggested Development Order

1. Application layout and visual structure
2. IndexedDB persistence foundation and storage-error state
3. Daily date handling
4. Add and validate goals
5. Planned goals list and editing
6. Timer controls and refresh recovery
7. Completion and manual-time prompt
8. Progress bar and duration summary
9. Completed goals section
10. Notes and reflection
11. Start New Day confirmation/reset
12. Empty states, responsive styling, and accessibility polish

## Already Implemented Features

### Feature 1: Application Layout and Visual Structure

- A centered dashboard displays the **Focus on Today** title.
- The layout includes distinct sections for the header, focus summary, progress bar, planned goals, goal form, completed goals, notes, and motivational copy.
- The main content uses a light background, rounded surface, and soft shadow to create a calm, focus-oriented workspace.
- The layout is responsive and adapts across mobile, tablet, and desktop screen sizes.
- The application is organized into focused React components, including `App`, `Header`, `FocusSummary`, `ProgressBar`, `GoalForm`, `GoalList`, `GoalItem`, `CompletedGoals`, and `NotesSection`.

### Feature 2: Add Today's Goals

- `GoalForm` validates trimmed goal titles from 1–120 characters and whole-number durations from 1–1440 minutes, with field-associated validation messages.
- The form disables adding goals while loading, after a storage failure, or once five goals exist, and displays a clear five-goal limit message.
- New goals are created with stable IDs, planned status, timestamps, zero elapsed time, and appear in creation order.
- Goals persist in the `todays-focus-db` IndexedDB database under the `dailyFocus` store using the current local date as the record key, and are restored after refresh.
- Persistence failures are shown to the user and prevent further editing until storage is available.

### Feature 3: Edit Goals

- Planned goals support inline editing of their title and estimated duration through a controlled row-level form.
- Edit fields reuse the add form's title and whole-minute duration validation, with field-associated accessibility messages.
- Saving awaits the IndexedDB write before updating in-memory state and preserves the goal's timer, elapsed-time, status, creation, and completion fields.
- Cancelling discards draft changes without modifying the persisted or displayed goal.
- Running, paused, and completed goals do not expose an Edit action; a goal remains locked after its timer has started.
- Storage failures keep the edit form open, leave the goal unchanged, show the existing persistence error, and disable further editing.

### Feature 4: Complete a Goal

- Active goals provide Start, Pause, and a checkbox-style completion control with readable status and elapsed-time text. Hovering or focusing the checkbox reveals the `Complete Goal` tooltip.
- Starting a goal automatically pauses any other running goal, persisting both status changes together so only one timer runs at a time.
- A single App-level timer tick derives running elapsed time from `activeStartedAt`; pause and completion persist the final interval and clear the active timestamp.
- Planned, running, and paused goals can complete through the defined status transitions. Goals with no tracked time reveal the inline, accessible manual-minutes field only after the completion checkbox is clicked. The field validates a whole number from 1–1440, and the entered minutes are added to `elapsedSeconds`.
- Completion persists `completedAt`, immediately updates progress and worked-time summaries, and moves the goal into the read-only Completed Goals section.
- Completed goals display estimated time, actual worked time, and completion time sorted newest first. They cannot be started, edited, paused, or completed again.
- Timer and completion writes await IndexedDB persistence before updating in-memory state, and storage failures show an alert while disabling editing actions.

### Feature 5: Progress Bar

- `App` derives progress from goal count, passing the completed-goal count and total goal count to `FocusSummary`; goal durations do not affect progress.
- `FocusSummary` calculates a zero-safe percentage with `Math.round((completedGoals / totalGoals) * 100)`, displaying the percentage and completed/total count.
- Empty days display `0% complete - 0/0 goals completed`, while partial and fully completed goal lists update the summary immediately.
- `ProgressBar` renders the percentage visually and exposes `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` attributes for accessible status.
