import type { Goal } from "../types";
import { useState } from "react";
import { validateGoalInput, type GoalInputErrors } from "../goalValidation";

type GoalItemProps = {
  goal: Goal;
  isDisabled: boolean;
  onEditGoal: (goalId: string, title: string, duration: string) => Promise<void>;
};

function GoalItem({ goal, isDisabled, onEditGoal }: GoalItemProps) {
  const { title, estimatedMinutes, status } = goal;
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftDuration, setDraftDuration] = useState(String(estimatedMinutes));
  const [errors, setErrors] = useState<GoalInputErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
                min="1"
                max="1440"
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
      <div className="goal-marker" aria-hidden="true" />
      <div className="goal-content">
        <h3>{title}</h3>
        <p>{estimatedMinutes} min estimated</p>
      </div>
      <span className="status-pill">{status}</span>
      <div className="goal-actions">
        <button className="icon-button" type="button" aria-label={`Start ${title}`}>
          Start
        </button>
        {status === "planned" && (
          <button className="text-button" type="button" onClick={startEditing} disabled={isDisabled}>
            Edit
          </button>
        )}
      </div>
    </article>
  );
}

export default GoalItem;
