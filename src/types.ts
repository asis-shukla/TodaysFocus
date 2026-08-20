export type GoalStatus = "planned" | "running" | "paused" | "completed";

export type Goal = {
  id: string;
  title: string;
  estimatedMinutes: number;
  elapsedSeconds: number;
  status: GoalStatus;
  activeStartedAt?: string;
  createdAt: string;
  completedAt?: string;
};

export type DailyFocusData = {
  dateKey: string;
  goals: Goal[];
  notes: string;
  updatedAt: string;
};

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createGoalId() {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
