import { useState } from "react";
import { validateGoalInput, type GoalInputErrors } from "../goalValidation";

type GoalFormProps = {
  goalCount: number;
  isDisabled: boolean;
  onAddGoal: (title: string, duration: string) => Promise<void>;
};

function GoalForm({ goalCount, isDisabled, onAddGoal }: GoalFormProps) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [errors, setErrors] = useState<GoalInputErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const limitReached = goalCount >= 5;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateGoalInput(title, duration);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || isDisabled || limitReached || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await onAddGoal(title, duration);
      setTitle("");
      setDuration("");
      setErrors({});
    } catch {
      setErrors({ title: "The goal could not be saved. Please try again." });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="form-section" aria-labelledby="add-goal-heading">
      <div>
        <p className="section-kicker">Shape the day</p>
        <h2 id="add-goal-heading">Add a focus goal</h2>
      </div>
      <form className="goal-form" onSubmit={handleSubmit} noValidate>
        <label>
          <span>Goal title</span>
          <input
            type="text"
            name="title"
            value={title}
            maxLength={120}
            placeholder="What deserves your attention?"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "goal-title-error" : undefined}
            onChange={(event) => setTitle(event.target.value)}
          />
          {errors.title && <span className="field-error" id="goal-title-error" role="alert">{errors.title}</span>}
        </label>
        <label className="duration-field">
          <span>Estimated time</span>
          <div className="input-with-suffix">
            <input
              type="number"
              name="duration"
              min="15"
              max="240"
              step="1"
              value={duration}
              placeholder="30"
              aria-invalid={Boolean(errors.duration)}
              aria-describedby={errors.duration ? "goal-duration-error" : undefined}
              onChange={(event) => setDuration(event.target.value)}
            />
            <span>min</span>
          </div>
          {errors.duration && <span className="field-error" id="goal-duration-error" role="alert">{errors.duration}</span>}
        </label>
        <button className="button button-primary" type="submit" disabled={isDisabled || isSaving || limitReached}>
          {isSaving ? "Saving..." : "Add goal"}
        </button>
      </form>
      {limitReached && <p className="limit-message" role="status">You have reached the five-goal limit for today.</p>}
    </section>
  );
}

export default GoalForm;
