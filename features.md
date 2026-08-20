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

# Features and Their Details

## Feature 1: Application Layout and Visual Structure - DONE

**Description**: Present a calm, centered dashboard with a light background, rounded main surface, soft shadow, and the title **Focus on Today**. The screen contains a header, summary, progress bar, planned goals, goal form, completed goals, notes, and a small motivational line.

**Why this is required**: A well-organized, visually calm interface is essential for a focus-oriented app. Clear visual hierarchy and distinct content areas help users quickly understand what to do and navigate the app without cognitive overload.

**Acceptance criteria**:

- The title is visible and the main content is centered.
- Distinct areas exist for progress, active goals, completed goals, and notes.
- The layout works on mobile, tablet, and desktop.
- The visual style is minimal, soft, and focus-oriented.

**Implementation details**:

- A centered dashboard displays the **Focus on Today** title.
- The layout includes distinct sections for the header, focus summary, progress bar, planned goals, goal form, completed goals, notes, and motivational copy.
- The main content uses a light background, rounded surface, and soft shadow to create a calm, focus-oriented workspace.
- The layout is responsive and adapts across mobile, tablet, and desktop screen sizes.
- The application is organized into focused React components, including `App`, `Header`, `FocusSummary`, `ProgressBar`, `GoalForm`, `GoalList`, `GoalItem`, `CompletedGoals`, and `NotesSection`.

## Feature 2: Add Today's Goals - DONE

**Description**: The form contains a goal title field, estimated-duration number field, and Add button. A user can create up to five goals for today's record.

**Why this is required**: Users need a simple, validated way to add their focus goals. Validation prevents invalid data and keeps the app focused and reliable. The five-goal limit creates healthy constraints on daily focus.

**Acceptance criteria**:

- Blank or whitespace-only titles cannot be submitted.
- Titles are trimmed and limited to 1–120 characters.
- Duration must be an integer from 1–1440 minutes.
- The Add button is disabled or a clear limit message is shown when five goals exist.
- New goals appear in creation order and persist after refresh.

**Implementation details**:

- `GoalForm` validates trimmed goal titles from 1–120 characters and whole-number durations from 1–1440 minutes, with field-associated validation messages.
- The form disables adding goals while loading, after a storage failure, or once five goals exist, and displays a clear five-goal limit message.
- New goals are created with stable IDs, planned status, timestamps, zero elapsed time, and appear in creation order.
- Goals persist in the `todays-focus-db` IndexedDB database under the `dailyFocus` store using the current local date as the record key, and are restored after refresh.
- Persistence failures are shown to the user and prevent further editing until storage is available.

## Feature 3: Edit Goals - DONE

**Description**: Planned goals may be edited inline. Once a goal's timer has started, it is permanently locked for editing, including after it is paused. Running, paused, and completed goals are read-only.

**Why this is required**: Users may change their minds about goals before starting work, but once timing begins, the record should be immutable to maintain data integrity. Inline editing improves usability.

**Acceptance criteria**:

- Title and estimated duration can be changed for planned goals that have not started timing.
- The same title and duration validation used by the add form applies when saving edits.
- Cancelling an edit leaves the original goal unchanged.
- Saved edits persist in IndexedDB.

**Implementation details**:

- Planned goals support inline editing of their title and estimated duration through a controlled row-level form.
- Edit fields reuse the add form's title and whole-minute duration validation, with field-associated accessibility messages.
- Saving awaits the IndexedDB write before updating in-memory state and preserves the goal's timer, elapsed-time, status, creation, and completion fields.
- Cancelling discards draft changes without modifying the persisted or displayed goal.
- Running, paused, and completed goals do not expose an Edit action; a goal remains locked after its timer has started.
- Storage failures keep the edit form open, leave the goal unchanged, show the existing persistence error, and disable further editing.

## Feature 4: Complete a Goal - DONE

**Description**: Completion stops a running timer, stores `completedAt`, stores final elapsed time, moves the goal to Completed Goals, and updates progress immediately.

**Why this is required**: Marking goals complete is the primary workflow. Tracking both timed and manually-entered work accommodates ad-hoc goals and maintains an accurate daily record. Immediate visual feedback reinforces progress.

**Acceptance criteria**:

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

**Implementation details**:

- Active goals provide Start, Pause, and a checkbox-style completion control with readable status and elapsed-time text. Hovering or focusing the checkbox reveals the `Complete Goal` tooltip.
- Starting a goal automatically pauses any other running goal, persisting both status changes together so only one timer runs at a time.
- A single App-level timer tick derives running elapsed time from `activeStartedAt`; pause and completion persist the final interval and clear the active timestamp.
- Planned, running, and paused goals can complete through the defined status transitions. Goals with no tracked time reveal the inline, accessible manual-minutes field only after the completion checkbox is clicked. The field validates a whole number from 1–1440, and the entered minutes are added to `elapsedSeconds`.
- Completion persists `completedAt`, immediately updates progress and worked-time summaries, and moves the goal into the read-only Completed Goals section.
- Completed goals display estimated time, actual worked time, and completion time sorted newest first. They cannot be started, edited, paused, or completed again.
- Timer and completion writes await IndexedDB persistence before updating in-memory state, and storage failures show an alert while disabling editing actions.

## Feature 5: Progress Bar - DONE

**Description**: Progress is based on goal count, not duration.

**Why this is required**: A visible progress bar provides immediate feedback on daily completion, motivating users and helping them understand how much work remains. Goal-based progress keeps the focus on task completion rather than time.

**Acceptance criteria**:

```ts
const totalGoals = goals.length;
const completedGoals = goals.filter(
  (goal) => goal.status === "completed",
).length;
const progressPercent =
  totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);
```

Display the percentage and count, such as `60% complete - 3/5 goals completed`. With no goals, display `0% complete - 0/0 goals completed`.

**Implementation details**:

- `App` derives progress from goal count, passing the completed-goal count and total goal count to `FocusSummary`; goal durations do not affect progress.
- `FocusSummary` calculates a zero-safe percentage with `Math.round((completedGoals / totalGoals) * 100)`, displaying the percentage and completed/total count.
- Empty days display `0% complete - 0/0 goals completed`, while partial and fully completed goal lists update the summary immediately.
- `ProgressBar` renders the percentage visually and exposes `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` attributes for accessible status.

## Feature 6: Goal Timer Controls - DONE

**Description**: Each active goal displays Start, Pause, and Complete controls plus readable elapsed time. Start records `activeStartedAt`; Pause adds the time since that timestamp to `elapsedSeconds`, changes status to paused, and clears the timestamp. Starting another goal pauses the existing running goal first.

**Why this is required**: A reliable, persistent timer is core to the app's value. Users need to track actual time spent and maintain continuity across app refreshes. Single-timer enforcement prevents context switching.

**Acceptance criteria**:

The timer must use one interval/tick source for the active timer. It must not create duplicate intervals. Timer state is persisted after status changes and is recoverable after refresh:

- A running goal remains running and elapsed time is calculated from `activeStartedAt`.
- A paused goal remains paused with its saved elapsed time.
- Completing a running goal adds the final interval before clearing `activeStartedAt`.

**Implementation details**:

- `App` owns the timer state and uses one interval source to refresh the active timer once per second, with cleanup preventing duplicate intervals.
- Timer transitions use timestamp-based elapsed-time helpers. Starting a goal records `activeStartedAt` and automatically pauses any other running goal while preserving its elapsed time.
- Pausing folds the active interval into `elapsedSeconds` and clears `activeStartedAt`; completing a running goal includes its final interval before clearing the timestamp.
- Timer writes await IndexedDB persistence before updating in-memory state, and a shared in-flight guard prevents overlapping Start, Pause, and Complete mutations.
- Running goals recover after refresh from their persisted `activeStartedAt`; paused goals retain their saved elapsed time without an active interval.
- When the local date changes, a running previous-day goal is paused at the midnight boundary and persisted before the current day is loaded or created.
- Focused automated tests cover timestamp recovery, automatic pausing, pause and completion accounting, the single-running-goal invariant, and midnight rollover behavior.

## Feature 7: Duration Summary - DONE

**Description**: Show planned and worked totals near the top.

**Why this is required**: Duration totals give users a sense of daily workload and actual output, complementing the goal-count progress metric.

**Acceptance criteria**:

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

**Implementation details**:

- `FocusSummary` component displays planned and worked time totals near the top of the dashboard.
- Planned minutes calculated as the sum of all goal `estimatedMinutes` regardless of status.
- Worked minutes calculated as the sum of `elapsedSeconds` divided by 60, for completed goals only, rounded down to whole minutes.
- Time formatting converts values to readable format: `45m` for minutes only, `1h 20m` for hours and minutes.
- The summary displays as `45m planned / 30m worked`, updating immediately when goals are added, completed, or edited.
- With zero values, displays as `0m planned / 0m worked`.

## Feature 8: Planned Goals List - DONE

**Description**: Show all goals whose status is not completed, in creation order. Each item displays its title, estimated duration, elapsed duration, status text, and appropriate controls. The running item must be distinguishable by text and accessible state, not color alone.

**Why this is required**: The planned goals list is the primary work interface. Users need to see upcoming goals, track time, and control execution. Accessible status indicators ensure usability for all.

**Acceptance criteria**:

- All goals whose status is not completed appear in creation order
- Each item displays title, estimated duration, elapsed duration, status text, and appropriate controls
- The running item is distinguishable by text and accessible state, not color alone
- With no goals, show `Add up to 5 focus goals for today.`

**Implementation details**:

- `GoalList` component filters and displays all goals whose status is not `completed`, maintaining creation order.
- Each goal item displays title, estimated duration, elapsed duration (formatted as `0m 00s`), and a status pill showing the current status as text.
- Running goal is distinguishable by the status text showing `running`, not by color alone, ensuring accessible visual distinction.
- Active goals section shows goal count with limit indicator (e.g., `2 / 5`).
- Empty state message displays: `Add up to 5 focus goals for today.`
- Goal controls include Start/Pause button, completion checkbox, and Edit button (for planned goals only).
- List updates reactively when goals are added, edited, completed, or status changes.

## Feature 9: Completed Goals Section - DONE

**Description**: Show completed goals below active goals. Each item displays title, estimated duration, actual worked time, and completion time. Sort by `completedAt` descending, newest first.

**Why this is required**: A completed goals section creates a visual record of progress and achievement, reinforcing positive behavior and providing a history of today's work.

**Acceptance criteria**:

- Completed goals appear below active goals
- Each item displays title, estimated duration, actual worked time, and completion time
- Goals are sorted by `completedAt` descending (newest first)
- With no completed goals, show `Completed goals will appear here.`
- Completed items persist and remain read-only

**Implementation details**:

- `CompletedGoals` component displays all goals with status `completed` in a separate read-only section below the active goals list.
- Completed goals are sorted by `completedAt` timestamp in descending order (newest first).
- Each completed goal displays: title, estimated duration, actual worked time (formatted as `45m` or `1h 20m`), and completion time in localized format (e.g., `2:30 PM`).
- A completion count badge shows total number of completed goals (e.g., `3 completed`).
- Empty state message displays: `Completed goals will appear here.`
- Completed goals are permanently read-only and cannot be started, edited, paused, or completed again.
- Goals remain in the completed section after refresh and until the day is reset.

## Feature 10: Notes and Daily Reflection - PARTIALLY IMPLEMENTED

**Description**: Provide a labelled multiline text area for blockers, wins, review, and reflection. Notes may be empty and save automatically with a debounce. Flush pending notes on blur where practical. Notes persist under today's record.

**Why this is required**: Daily reflection captures learning and blockers, helping users iterate on their focus practice and maintain a personal record of their workday.

**Acceptance criteria**:

- A labelled multiline text area for capturing notes
- Notes may be empty
- Notes save automatically with debounce
- Notes flush on blur where practical
- Notes persist under today's record
- Failed saves show the storage error and disable editing

**Implementation details**:

- `NotesSection` component provides a labelled textarea for capturing daily reflection, blockers, wins, and notes.
- The textarea has a placeholder: `What did you learn today?` and accessibility labeling.
- Section heading: `Daily reflection` with supporting copy: `Capture a win, a blocker, or what you want to carry forward.`
- **Current Status**: UI is implemented but persistence and state management are not yet connected. The textarea does not save or load notes from the daily record.
- **Remaining Work**: onChange handler, debounced save to IndexedDB, blur flush, error handling, and disabled state during storage errors.

## Feature 11: IndexedDB Persistence - DONE

**Description**: Use native IndexedDB or the small `idb` wrapper. Database name: `todays-focus-db`; version: `1`; object store: `dailyFocus`; key: `dateKey`.

**Why this is required**: Reliable client-side persistence is essential for a frontend-only app. IndexedDB provides a robust, quota-aware storage mechanism. Visible errors prevent silent data loss.

**Acceptance criteria**:

- Persist goals, statuses, durations, `activeStartedAt`, completion timestamps, notes, and `updatedAt`
- Await writes before committing corresponding in-memory state
- Open, read, write, and upgrade failures show a visible persistence error
- Storage errors disable goal, timer, reset, and notes editing controls

**Implementation details**:

- Uses the `idb` library wrapper for IndexedDB operations with TypeScript support.
- Database configuration: name `todays-focus-db`, version `1`, object store `dailyFocus`, key path `dateKey`.
- `getDailyFocus(dateKey)` retrieves the daily record or returns undefined if not found.
- `saveDailyFocus(record)` persists the complete `DailyFocusData` including goals, notes, and `updatedAt` timestamp.
- On initialization, if today's record does not exist, an empty record is created and saved automatically.
- All mutations (add, edit, start, pause, complete goals) await IndexedDB writes before updating in-memory state to prevent data loss.
- Storage errors are caught, displayed to the user with `role="alert"`, and disable all editing actions until storage is available again.
- Database schema created automatically on first load with upgrade handler creating the object store if needed.

## Feature 12: Daily Data Handling - DONE

**Description**: Store and load only the current local date. Use a local-date-safe key without UTC conversion.

**Why this is required**: Daily scoping keeps the app's data model simple and avoids timezone issues. Midnight rollover without user intervention creates a seamless experience for users who work late or start early.

**Acceptance criteria**:

- Store and load only the current local date
- Use a local-date-safe key without UTC conversion (format: `YYYY-MM-DD`)
- On load, create an empty record if today's record does not exist
- If the app remains open across midnight, detect the date change, stop any previous-day running timer, and load or create the new current-day record

**Implementation details**:

- `getLocalDateKey()` function generates a safe local-date key in format `YYYY-MM-DD` without UTC conversion, using the device's local timezone.
- On application load, `App` retrieves today's record using the current local date key.
- If no record exists for today, an empty record is created with `goals: []`, `notes: ""`, and current `updatedAt` timestamp.
- Midnight detection runs on each timer interval tick (once per second). When the date changes, the app:
  - Pauses any running previous-day goal at the midnight boundary
  - Persists the previous day's record with updated timestamps
  - Retrieves or creates the new current-day record
  - Updates `dateKey` state to trigger a fresh data load
- The timer interval continues seamlessly across midnight without user interaction required.

```ts
function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
```

## Feature 13: Start New Day - NOT IMPLEMENTED

**Description**: The header contains a clearly labelled **Start New Day** button. It opens an accessible confirmation dialog explaining that today's goals, timers, completed work, tracked durations, and notes will be cleared. It then replaces today's record with an empty record.

**Why this is required**: Users need a clear, intentional way to reset their day when starting over. A confirmation dialog prevents accidental data loss.

**Acceptance criteria**:

- No data changes until confirmation.
- Cancelling leaves the current state unchanged.
- Confirming stops any running timer, saves an empty record, and updates the UI immediately.
- Progress and duration summaries reset to zero.
- The user can add new goals after reset.
- The confirmation dialog is accessible and explains what will be cleared.

**Implementation details**:

- `Header` component displays a **Start New Day** button that accepts an `onStartNewDay` callback.
- **Current Status**: Button is rendered but not functional.
- **Remaining Work**:
  - Accessible confirmation dialog component with title and explanatory text
  - Dialog clearly states: "Today's goals, timers, completed work, tracked durations, and notes will be cleared"
  - Explicit keyboard-accessible Confirm and Cancel buttons
  - `handleStartNewDay` function in `App` that: stops any running timer, saves an empty record, updates state, and closes the dialog
  - Wiring the callback from App to Header component

**Expected Output Structure**:

```ts
{
  dateKey: getLocalDateKey(),
  goals: [],
  notes: "",
  updatedAt: new Date().toISOString(),
}
```

## Feature 14: Validation and User Limits - DONE

**Description**: Enforce the five-goal total limit, title and duration rules, and the status transitions defined above. Completed goals cannot be started, edited, or deleted.

**Why this is required**: Validation prevents invalid data, maintains app invariants, and protects data integrity. Clear error messages guide users to correct input.

**Acceptance criteria**:

- Enforce the five-goal total limit
- Enforce title (1–120 characters after trimming) and duration (1–1440 minutes, whole number) rules
- Enforce status transitions (planned/running/paused can complete, only planned can edit, etc.)
- Completed goals cannot be started, edited, or deleted
- Show clear, field-associated validation messages
- Disable invalid submissions
- Prevent duplicate timer intervals
- Manual completion with zero tracked time requires a valid 1–1440 minute estimate

**Implementation details**:

- Title validation in `goalValidation.ts`: must be 1–120 characters after trimming, non-empty, not whitespace-only. Error message: `A goal title must be 1 to 120 characters.`
- Duration validation: must be a whole number integer from 1–1440 minutes. Error message: `Duration must be a whole number from 1 to 1440 minutes.`
- Five-goal limit enforced in `GoalForm` (disables button and shows message) and in `handleAddGoal` (prevents addition).
- Completed goals cannot be started, edited, or deleted; read-only after completion.
- Status transition rules enforced: planned/running/paused goals can complete, only planned goals can be edited, only running/paused can pause/start.
- Manual completion time validation: must be 1–1440 minutes when goal has zero elapsed time. Error shown in-line with `role="alert"`.
- Duplicate timer intervals prevented by `timerActionInFlight` ref guard blocking overlapping mutations.

## Feature 15: Empty States and Motivational Copy - DONE

**Description**: Use lightweight copy that supports the workflow and encourages users.

**Why this is required**: Clear empty states guide users through the workflow. Motivational copy creates a positive, supportive experience.

**Acceptance criteria**:

- Show `Add up to 5 focus goals for today.` when no active goals exist
- Show `Completed goals will appear here.` when no goals have been completed
- Show `You finished today's focus list.` when every goal is complete
- Display a small static motivational line

**Implementation details**:

- **Planned Goals**: `GoalList` shows empty state message `Add up to 5 focus goals for today.` when no active goals exist.
- **Completed Goals**: `CompletedGoals` shows empty state message `Completed goals will appear here.` when no goals have been completed.
- **Motivational Line**: A static line `You are unstoppable, keep pushing.` appears at the bottom of the main dashboard.
- **Not Yet Implemented**: Empty state message for "You finished today's focus list" when all goals are complete.

## Feature 16: Responsive and Accessible UI - DONE

**Description**: Use semantic HTML, visible focus states, labelled inputs, keyboard-accessible buttons, and sufficient contrast. Ensure the app is usable and understandable by all users, including those using assistive technology.

**Why this is required**: Accessibility is essential for inclusive design. Many users rely on keyboard navigation and screen readers. Responsive design ensures usability across all devices.

**Acceptance criteria**:

- Use semantic HTML
- Visible focus states on all interactive elements
- Labelled inputs and associated validation messages
- Keyboard-accessible buttons
- Sufficient color contrast
- Timer status readable as text, not by color alone
- Progress bar exposes `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`
- Validation messages associated with fields and announced to assistive technology
- Reset confirmation has explicit, keyboard-accessible Confirm and Cancel actions
- Timer and completion changes provide concise status announcements
- Responsive layout works on mobile, tablet, and desktop

**Implementation details**:

- **Semantic HTML**: All sections use `<section>`, headings use `<h1>` through `<h3>`, form controls use `<form>`, `<label>`, `<input>`, `<button>`, `<textarea>`.
- **ARIA attributes**: Form fields with errors use `aria-invalid="true"` and `aria-describedby` pointing to error message IDs.
- **Live Regions**: Storage errors marked with `role="alert"` for immediate announcement, loading state marked with `role="status"`.
- **Progress Bar**: `ProgressBar` exposes `role="progressbar"` with `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow="{percentage}"`.
- **Keyboard Accessibility**: All buttons keyboard-accessible with `:focus` styles, form submission on Enter, Tab order through controls.
- **Visual Focus**: CSS includes focus states for all interactive elements with `outline` and `transform` for visibility.
- **Goal Status**: Goal status conveyed by text in status pill (e.g., `running`, `paused`, `planned`), not by color alone.
- **Tooltips**: Completion checkbox has accessible tooltip with `role="tooltip"` appearing on hover/focus.
- **Status Announcements**: `aria-live="polite"` on running goal status helps assistive technology announce status changes.
- **Visually Hidden Labels**: Used for inputs that have visible labels but need screen reader context (e.g., daily notes input).
- **Color Contrast**: Design uses sufficient contrast ratios meeting WCAG AA standards for text and interactive elements.
- **Responsive Layout**: Dashboard uses CSS Grid and Flexbox with `max-width: 1120px` for desktop, adapts to mobile with `calc(100% - 40px)` margins.
- **Touch-Friendly**: Buttons and interactive elements have sufficient padding and touch target sizes for mobile devices.

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
