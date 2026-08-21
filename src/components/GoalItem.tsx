import type { Goal } from "../types";
import { useState } from "react";
import { validateGoalInput, validateManualMinutes, type GoalInputErrors } from "../goalValidation";

type GoalItemProps = {
  goal: Goal;
  isDisabled: boolean;
  onEditGoal: (goalId: string, title: string, duration: string) => Promise<void>;
  now: number;
  onStartGoal: (goalId: string) => Promise<void>;
  onPauseGoal: (goalId: string) => Promise<void>;
  onCompleteGoal: (goalId: string, manualMinutes?: number) => Promise<void>;
};

function GoalItem({ goal, isDisabled, onEditGoal, now, onStartGoal, onPauseGoal, onCompleteGoal }: GoalItemProps) {
  const { title, estimatedMinutes, status } = goal;
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDuration, setDraftDuration] = useState(String(estimatedMinutes));
  const [errors, setErrors] = useState<GoalInputErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualMinutes, setManualMinutes] = useState("");
  const [manualMinutesError, setManualMinutesError] = useState<string | null>(null);
  const isEditDisabled = isDisabled || status !== "planned";
  const editDisabledMessage = "Editing is unavailable after a goal has started.";
  const elapsedSeconds = status === "running" && goal.activeStartedAt
    ? goal.elapsedSeconds + Math.max(0, Math.floor((now - Date.parse(goal.activeStartedAt)) / 1000))
    : goal.elapsedSeconds;

  function formatElapsed(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
  }

  function startEditing() {
    setDraftTitle(title);
    setDraftDuration(String(estimatedMinutes));
    setErrors({});
    setSaveError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setErrors({});
    setSaveError(null);
    setIsEditing(false);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateGoalInput(draftTitle, draftDuration);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || isDisabled || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await onEditGoal(goal.id, draftTitle, draftDuration);
      setIsEditing(false);
    } catch {
      setSaveError("The goal could not be saved. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleComplete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateManualMinutes(manualMinutes);
    setManualMinutesError(error ?? null);
    if (error || isDisabled || isCompleting) {
      return;
    }

    setIsCompleting(true);
    try {
      await onCompleteGoal(goal.id, Number(manualMinutes));
      setManualMinutes("");
      setIsManualEntryOpen(false);
    } catch {
      setManualMinutesError("The goal could not be completed. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  }

  async function completeWithTrackedTime() {
    setIsCompleting(true);
    setManualMinutesError(null);
    try {
      await onCompleteGoal(goal.id);
    } catch {
      setManualMinutesError("The goal could not be completed. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  }

  function openManualCompletion() {
    setManualMinutes("");
    setManualMinutesError(null);
    setIsManualEntryOpen(true);
  }

  function handleCompletionClick() {
    if (elapsedSeconds === 0) {
      openManualCompletion();
      return;
    }

    void completeWithTrackedTime();
  }

  if (isEditing) {
    return (
      <article className="goal-item goal-item-editing">
        <form className="goal-edit-form" onSubmit={handleSave} noValidate>
          <label>
            <span>Goal title</span>
            <input
              type="text"
              value={draftTitle}
              maxLength={120}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? `edit-title-error-${goal.id}` : undefined}
              onChange={(event) => setDraftTitle(event.target.value)}
            />
            {errors.title && <span className="field-error" id={`edit-title-error-${goal.id}`} role="alert">{errors.title}</span>}
          </label>
          <label>
            <span>Estimated time</span>
            <div className="input-with-suffix">
              <input
                type="number"
                min="15"
                max="240"
                step="1"
                value={draftDuration}
                aria-invalid={Boolean(errors.duration)}
                aria-describedby={errors.duration ? `edit-duration-error-${goal.id}` : undefined}
                onChange={(event) => setDraftDuration(event.target.value)}
              />
              <span>min</span>
            </div>
            {errors.duration && <span className="field-error" id={`edit-duration-error-${goal.id}`} role="alert">{errors.duration}</span>}
          </label>
          <div className="goal-actions">
            <button className="text-button" type="submit" disabled={isDisabled || isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button className="text-button" type="button" onClick={cancelEditing} disabled={isSaving}>Cancel</button>
          </div>
          {saveError && <span className="field-error" role="alert">{saveError}</span>}
        </form>
      </article>
    );
  }

  return (
    <article className="goal-item">
      <div className="goal-content">
        <div className="goal-title-row">
          <h3>{title}</h3>
          <span className="status-pill">{status}</span>
        </div>
        <p>{estimatedMinutes} min estimated · {formatElapsed(elapsedSeconds)} elapsed</p>
      </div>
      <span className="visually-hidden" aria-live="polite">{title} is {status}.</span>
      <div className="goal-actions">
        {status === "running" ? (
          <button className="icon-button" type="button" onClick={() => void onPauseGoal(goal.id)} disabled={isDisabled || isCompleting}>
            Pause
          </button>
        ) : (
          <button className="icon-button" type="button" onClick={() => void onStartGoal(goal.id)} disabled={isDisabled || status === "completed" || isCompleting}>
            Start
          </button>
        )}
        {isManualEntryOpen && elapsedSeconds === 0 ? (
          <form className="manual-completion-form" onSubmit={handleComplete} noValidate>
            <label>
              <span>Minutes worked</span>
              <input
                type="number"
                min="15"
                max="240"
                step="1"
                value={manualMinutes}
                autoFocus
                aria-invalid={Boolean(manualMinutesError)}
                aria-describedby={manualMinutesError ? `manual-minutes-error-${goal.id}` : undefined}
                onChange={(event) => setManualMinutes(event.target.value)}
              />
            </label>
            <button
              className="completion-checkbox"
              type="submit"
              aria-label={isCompleting ? `Completing ${title}` : `Complete goal: ${title}`}
              title="Complete Goal"
              disabled={isDisabled || isCompleting}
            >
              <span aria-hidden="true" />
              <span className="completion-tooltip" role="tooltip">Complete Goal</span>
            </button>
            {manualMinutesError && <span className="field-error" id={`manual-minutes-error-${goal.id}`} role="alert">{manualMinutesError}</span>}
          </form>
        ) : (
          <button
            className="completion-checkbox"
            type="button"
            aria-label={isCompleting ? `Completing ${title}` : `Complete goal: ${title}`}
            title="Complete Goal"
            onClick={handleCompletionClick}
            disabled={isDisabled || isCompleting}
          >
            <span aria-hidden="true" />
            <span className="completion-tooltip" role="tooltip">Complete Goal</span>
          </button>
        )}
        {status !== "completed" && (
          <span title={isEditDisabled && status !== "planned" ? editDisabledMessage : undefined}>
            <button
              className="text-button"
              type="button"
              onClick={startEditing}
              disabled={isEditDisabled}
              aria-label={isEditDisabled && status !== "planned" ? `${editDisabledMessage} Goal: ${title}` : `Edit goal: ${title}`}
            >
              Edit
            </button>
          </span>
        )}
      </div>
    </article>
  );
}

export default GoalItem;
