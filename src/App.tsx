import "./App.css";
import { useEffect, useRef, useState } from "react";
import CompletedGoals from "./components/CompletedGoals";
import FocusSummary from "./components/FocusSummary";
import GoalForm from "./components/GoalForm";
import GoalList from "./components/GoalList";
import Header from "./components/Header";
import NotesSection from "./components/NotesSection";
import { validateGoalInput, validateManualMinutes } from "./goalValidation";
import { getDailyFocus, saveDailyFocus } from "./storage";
import { completeGoal, getElapsedSeconds, pauseGoal, startGoal } from "./timer";
import { createGoalId, getLocalDateKey, type DailyFocusData, type Goal } from "./types";

function App() {
  const [dailyFocus, setDailyFocus] = useState<DailyFocusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [dateKey, setDateKey] = useState(() => getLocalDateKey());
  const [isTimerActionPending, setIsTimerActionPending] = useState(false);
  const timerActionInFlight = useRef(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadDailyFocus() {
      try {
        const existingRecord = await getDailyFocus(dateKey);
        const record = existingRecord ?? {
          dateKey,
          goals: [],
          notes: "",
          updatedAt: new Date().toISOString(),
        };

        if (!existingRecord) {
          await saveDailyFocus(record);
        }

        if (isCurrent) {
          setDailyFocus(record);
          setStorageError(null);
        }
      } catch {
        if (isCurrent) {
          setStorageError("Your goals could not be loaded. Editing is disabled until storage is available.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadDailyFocus();

    return () => {
      isCurrent = false;
    };
  }, [dateKey]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const timestamp = Date.now();
      const currentDateKey = getLocalDateKey(new Date(timestamp));

      if (currentDateKey !== dateKey && dailyFocus && !timerActionInFlight.current) {
        timerActionInFlight.current = true;
        setIsTimerActionPending(true);

        const midnightTimestamp = new Date(`${currentDateKey}T00:00:00`).getTime();
        const pausedGoals = dailyFocus.goals.map((goal) => pauseGoal(goal, midnightTimestamp));
        const previousDayRecord: DailyFocusData = {
          ...dailyFocus,
          goals: pausedGoals,
          updatedAt: new Date(midnightTimestamp).toISOString(),
        };

        void saveDailyFocus(previousDayRecord)
          .then(() => getDailyFocus(currentDateKey))
          .then(async (existingRecord) => {
            const nextRecord = existingRecord ?? {
              dateKey: currentDateKey,
              goals: [],
              notes: "",
              updatedAt: new Date().toISOString(),
            };

            if (!existingRecord) {
              await saveDailyFocus(nextRecord);
            }

            setDailyFocus(nextRecord);
            setDateKey(currentDateKey);
            setNow(timestamp);
            setStorageError(null);
          })
          .catch(() => {
            setStorageError("Your goals could not be rolled over. Editing is disabled until storage is available.");
          })
          .finally(() => {
            timerActionInFlight.current = false;
            setIsTimerActionPending(false);
          });
        return;
      }

      if (dailyFocus?.goals.some((goal) => goal.status === "running")) {
        setNow(timestamp);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [dailyFocus, dateKey]);

  async function handleAddGoal(title: string, duration: string) {
    if (!dailyFocus || storageError || dailyFocus.goals.length >= 5) {
      return;
    }

    const errors = validateGoalInput(title, duration);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const goal: Goal = {
      id: createGoalId(),
      title: title.trim(),
      estimatedMinutes: Number(duration),
      elapsedSeconds: 0,
      status: "planned",
      createdAt: new Date().toISOString(),
    };
    const updatedRecord: DailyFocusData = {
      ...dailyFocus,
      goals: [...dailyFocus.goals, goal],
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveDailyFocus(updatedRecord);
      setDailyFocus(updatedRecord);
      setStorageError(null);
    } catch {
      setStorageError("Your goal could not be saved. Editing is disabled until storage is available.");
      throw new Error("Goal could not be saved");
    }
  }

  async function handleEditGoal(goalId: string, title: string, duration: string) {
    if (!dailyFocus || storageError) {
      throw new Error("Goal editing is unavailable");
    }

    const errors = validateGoalInput(title, duration);
    const goal = dailyFocus.goals.find((candidate) => candidate.id === goalId);
    if (Object.keys(errors).length > 0 || !goal || goal.status !== "planned") {
      throw new Error("Goal could not be edited");
    }

    const updatedRecord: DailyFocusData = {
      ...dailyFocus,
      goals: dailyFocus.goals.map((candidate) => candidate.id === goalId
        ? { ...candidate, title: title.trim(), estimatedMinutes: Number(duration) }
        : candidate),
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveDailyFocus(updatedRecord);
      setDailyFocus(updatedRecord);
      setStorageError(null);
    } catch {
      setStorageError("Your goal could not be saved. Editing is disabled until storage is available.");
      throw new Error("Goal could not be saved");
    }
  }

  async function persistGoals(goals: Goal[], errorMessage: string) {
    if (!dailyFocus || storageError) {
      throw new Error("Goal timer is unavailable");
    }

    const updatedRecord: DailyFocusData = {
      ...dailyFocus,
      goals,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveDailyFocus(updatedRecord);
      setDailyFocus(updatedRecord);
      setStorageError(null);
    } catch {
      setStorageError(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async function handleStartGoal(goalId: string) {
    if (!dailyFocus || storageError || timerActionInFlight.current) {
      return;
    }

    timerActionInFlight.current = true;
    setIsTimerActionPending(true);
    try {
      const startedAt = new Date().toISOString();
      const goals = startGoal(dailyFocus.goals, goalId, startedAt);
      await persistGoals(goals, "Your timer could not be started. Editing is disabled until storage is available.");
    } finally {
      timerActionInFlight.current = false;
      setIsTimerActionPending(false);
    }
  }

  async function handlePauseGoal(goalId: string) {
    if (!dailyFocus || storageError || timerActionInFlight.current) {
      return;
    }

    timerActionInFlight.current = true;
    setIsTimerActionPending(true);
    try {
      const goals = dailyFocus.goals.map((goal) => goal.id === goalId ? pauseGoal(goal) : goal);
      await persistGoals(goals, "Your timer could not be paused. Editing is disabled until storage is available.");
    } finally {
      timerActionInFlight.current = false;
      setIsTimerActionPending(false);
    }
  }

  async function handleCompleteGoal(goalId: string, manualMinutes?: number) {
    if (!dailyFocus || storageError || timerActionInFlight.current) {
      return;
    }

    const goal = dailyFocus.goals.find((candidate) => candidate.id === goalId);
    if (!goal || goal.status === "completed") {
      return;
    }

    const elapsedSeconds = getElapsedSeconds(goal);
    if (elapsedSeconds === 0) {
      if (manualMinutes === undefined || !Number.isInteger(manualMinutes) || validateManualMinutes(String(manualMinutes))) {
        throw new Error("Enter a whole number from 1 to 1440 minutes.");
      }
    }

    timerActionInFlight.current = true;
    setIsTimerActionPending(true);
    try {
      const goals = dailyFocus.goals.map((candidate) => candidate.id === goalId
        ? completeGoal(candidate, Date.now(), manualMinutes)
        : candidate);

      await persistGoals(goals, "Your goal could not be completed. Editing is disabled until storage is available.");
    } finally {
      timerActionInFlight.current = false;
      setIsTimerActionPending(false);
    }
  }

  async function handleSaveNotes(notesText: string) {
    if (!dailyFocus || storageError) {
      throw new Error("Notes could not be saved");
    }

    const updatedRecord: DailyFocusData = {
      ...dailyFocus,
      notes: notesText,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveDailyFocus(updatedRecord);
      setDailyFocus(updatedRecord);
      setStorageError(null);
    } catch {
      setStorageError("Your notes could not be saved. Editing is disabled until storage is available.");
      throw new Error("Notes could not be saved");
    }
  }

  const goals = dailyFocus?.goals ?? [];
  const completedGoals = goals.filter((goal) => goal.status === "completed").length;
  const plannedMinutes = goals.reduce((sum, goal) => sum + goal.estimatedMinutes, 0);
  const workedMinutes = Math.floor(
    goals.reduce(
      (sum, goal) => sum + (goal.status === "completed" ? goal.elapsedSeconds : 0),
      0,
    ) / 60,
  );

  return (
    <main className="dashboard-shell">
      <Header />
      {storageError && <p className="storage-error" role="alert">{storageError}</p>}
      {isLoading && <p className="loading-message" role="status">Loading today&apos;s goals...</p>}
      <FocusSummary completedGoals={completedGoals} totalGoals={goals.length} plannedMinutes={plannedMinutes} workedMinutes={workedMinutes} />
      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <GoalList
            goals={goals}
            isDisabled={isLoading || Boolean(storageError) || isTimerActionPending}
            onEditGoal={handleEditGoal}
            now={now}
            onStartGoal={handleStartGoal}
            onPauseGoal={handlePauseGoal}
            onCompleteGoal={handleCompleteGoal}
          />
          <GoalForm
            goalCount={goals.length}
            isDisabled={isLoading || Boolean(storageError)}
            onAddGoal={handleAddGoal}
          />
        </div>
        <div className="dashboard-secondary">
          <CompletedGoals goals={goals.filter((goal) => goal.status === "completed")} />
          <NotesSection
            notes={dailyFocus?.notes ?? ""}
            isDisabled={isLoading || Boolean(storageError)}
            onSaveNotes={handleSaveNotes}
          />
        </div>
      </div>
      <p className="motivation">You are unstoppable, keep pushing.</p>
    </main>
  );
}

export default App;
