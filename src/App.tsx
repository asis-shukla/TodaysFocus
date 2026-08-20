import "./App.css";
import { useEffect, useState } from "react";
import CompletedGoals from "./components/CompletedGoals";
import FocusSummary from "./components/FocusSummary";
import GoalForm from "./components/GoalForm";
import GoalList from "./components/GoalList";
import Header from "./components/Header";
import NotesSection from "./components/NotesSection";
import { validateGoalInput } from "./goalValidation";
import { getDailyFocus, saveDailyFocus } from "./storage";
import { createGoalId, getLocalDateKey, type DailyFocusData, type Goal } from "./types";

function App() {
  const [dailyFocus, setDailyFocus] = useState<DailyFocusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const dateKey = getLocalDateKey();

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
            isDisabled={isLoading || Boolean(storageError)}
            onEditGoal={handleEditGoal}
          />
          <GoalForm
            goalCount={goals.length}
            isDisabled={isLoading || Boolean(storageError)}
            onAddGoal={handleAddGoal}
          />
        </div>
        <div className="dashboard-secondary">
          <CompletedGoals />
          <NotesSection />
        </div>
      </div>
      <p className="motivation">You are unstoppable, keep pushing.</p>
    </main>
  );
}

export default App;
