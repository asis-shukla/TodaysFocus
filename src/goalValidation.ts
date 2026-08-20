export type GoalInputErrors = {
  title?: string;
  duration?: string;
  manualMinutes?: string;
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

  if (!Number.isInteger(durationValue) || durationValue < 15 || durationValue > 240) {
    errors.duration = "Estimated time must be between 15 minutes and 240 minutes.";
  }

  return errors;
}

export function validateManualMinutes(value: string): string | undefined {
  const minutes = Number(value);

  if (!Number.isInteger(minutes) || minutes < 15 || minutes > 240) {
    return "Worked time must be between 15 minutes and 240 minutes.";
  }

  return undefined;
}
