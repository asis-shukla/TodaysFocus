import { describe, expect, it } from "vitest";
import { completeGoal, getElapsedSeconds, pauseGoal, startGoal } from "./timer";
import type { Goal } from "./types";

function createGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: "goal-1",
    title: "Focus",
    estimatedMinutes: 30,
    elapsedSeconds: 0,
    status: "planned",
    createdAt: "2026-08-21T08:00:00.000Z",
    ...overrides,
  };
}

describe("timer transitions", () => {
  it("derives running time from the persisted start timestamp", () => {
    const goal = createGoal({
      status: "running",
      activeStartedAt: "2026-08-21T08:00:00.000Z",
      elapsedSeconds: 12,
    });

    expect(getElapsedSeconds(goal, Date.parse("2026-08-21T08:01:05.000Z"))).toBe(77);
  });

  it("pauses the existing running goal when another goal starts", () => {
    const runningGoal = createGoal({
      activeStartedAt: "2026-08-21T08:00:00.000Z",
      status: "running",
    });
    const nextGoal = createGoal({ id: "goal-2" });

    const goals = startGoal(
      [runningGoal, nextGoal],
      "goal-2",
      "2026-08-21T08:02:00.000Z",
    );

    expect(goals[0]).toMatchObject({ status: "paused", elapsedSeconds: 120 });
    expect(goals[0].activeStartedAt).toBeUndefined();
    expect(goals[1]).toMatchObject({ status: "running", activeStartedAt: "2026-08-21T08:02:00.000Z" });
    expect(goals.filter((goal) => goal.status === "running")).toHaveLength(1);
  });

  it("keeps paused time stable and clears the active timestamp", () => {
    const goal = createGoal({
      status: "running",
      activeStartedAt: "2026-08-21T08:00:00.000Z",
      elapsedSeconds: 30,
    });

    expect(pauseGoal(goal, Date.parse("2026-08-21T08:00:40.000Z"))).toMatchObject({
      status: "paused",
      elapsedSeconds: 70,
      activeStartedAt: undefined,
    });
  });

  it("includes the final running interval when completing", () => {
    const goal = createGoal({
      status: "running",
      activeStartedAt: "2026-08-21T08:00:00.000Z",
      elapsedSeconds: 15,
    });

    expect(completeGoal(goal, Date.parse("2026-08-21T08:01:10.000Z"))).toMatchObject({
      status: "completed",
      elapsedSeconds: 85,
      activeStartedAt: undefined,
    });
  });

  it("pauses a running goal at the local-midnight boundary", () => {
    const goal = createGoal({
      status: "running",
      activeStartedAt: "2026-08-21T23:59:30.000Z",
    });

    expect(pauseGoal(goal, Date.parse("2026-08-22T00:00:00.000Z"))).toMatchObject({
      status: "paused",
      elapsedSeconds: 30,
      activeStartedAt: undefined,
    });
  });
});
