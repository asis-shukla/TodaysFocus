import type { Goal } from "./types";

export function getElapsedSeconds(goal: Goal, timestamp = Date.now()) {
  if (goal.status !== "running" || !goal.activeStartedAt) {
    return goal.elapsedSeconds;
  }

  return goal.elapsedSeconds + Math.max(0, Math.floor((timestamp - Date.parse(goal.activeStartedAt)) / 1000));
}

export function pauseGoal(goal: Goal, timestamp = Date.now()): Goal {
  if (goal.status !== "running") {
    return goal;
  }

  return {
    ...goal,
    status: "paused",
    elapsedSeconds: getElapsedSeconds(goal, timestamp),
    activeStartedAt: undefined,
  };
}

export function startGoal(
  goals: Goal[],
  goalId: string,
  startedAt = new Date().toISOString(),
  timestamp = Date.parse(startedAt),
): Goal[] {
  return goals.map((goal) => {
    if (goal.id === goalId) {
      return { ...goal, status: "running", activeStartedAt: startedAt };
    }

    return goal.status === "running" ? pauseGoal(goal, timestamp) : goal;
  });
}

export function completeGoal(goal: Goal, timestamp = Date.now(), manualMinutes?: number): Goal {
  const elapsedSeconds = getElapsedSeconds(goal, timestamp);

  return {
    ...goal,
    status: "completed",
    elapsedSeconds: elapsedSeconds + (elapsedSeconds === 0 ? (manualMinutes ?? 0) * 60 : 0),
    activeStartedAt: undefined,
    completedAt: new Date(timestamp).toISOString(),
  };
}
