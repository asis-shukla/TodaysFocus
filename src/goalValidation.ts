export type GoalInputErrors = {
  title?: string;
  duration?: string;
};

export function validateGoalInput(title: string, duration: string): GoalInputErrors {
  const errors: GoalInputErrors = {};
  const trimmedTitle = title.trim();
  const durationValue = Number(duration);

  if (trimmedTitle.length === 0) {
    errors.title = "Enter a goal title.";
  } else if (trimmedTitle.length > 120) {
    errors.title = "Goal titles must be 120 characters or fewer.";
  }

  if (!Number.isInteger(durationValue) || durationValue < 1 || durationValue > 1440) {
    errors.duration = "Enter a whole number from 1 to 1440 minutes.";
  }

  return errors;
}
