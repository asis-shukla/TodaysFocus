import type { DailyFocusData, Goal } from "../types";

type PreviousRecordsDashboardProps = {
  dateKeys: string[];
  selectedDateKey: string | null;
  selectedRecord: DailyFocusData | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onSelectDate: (dateKey: string) => void;
};

function formatDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00`));
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

function formatWorkedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}

function sortGoalsForDisplay(goals: Goal[]) {
  return [...goals].sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt));
}

function PreviousRecordsDashboard({
  dateKeys,
  selectedDateKey,
  selectedRecord,
  isLoading,
  error,
  onClose,
  onSelectDate,
}: PreviousRecordsDashboardProps) {
  const goals = selectedRecord?.goals ?? [];
  const completedGoals = goals.filter((goal) => goal.status === "completed").length;
  const progressPercent = goals.length === 0 ? 0 : Math.round((completedGoals / goals.length) * 100);
  const plannedMinutes = goals.reduce((sum, goal) => sum + goal.estimatedMinutes, 0);
  const workedSeconds = goals.reduce(
    (sum, goal) => sum + (goal.status === "completed" ? goal.elapsedSeconds : 0),
    0,
  );

  return (
    <section className="previous-records" aria-labelledby="previous-records-heading">
      <div className="previous-records-header">
        <div>
          <p className="section-kicker">History</p>
          <h2 id="previous-records-heading">Previous records</h2>
          <p className="section-description">Review earlier days without changing today&apos;s goals.</p>
        </div>
        <button className="button button-secondary" type="button" onClick={onClose}>
          Back to today
        </button>
      </div>

      {error && <p className="storage-error" role="alert">{error}</p>}

      <div className="previous-records-grid">
        <section className="content-section" aria-labelledby="previous-records-dates-heading">
          <div className="section-heading">
            <h3 id="previous-records-dates-heading">Dates</h3>
          </div>
          {dateKeys.length === 0 ? (
            <p className="empty-state">Previous records are unavailable right now.</p>
          ) : (
            <div className="records-date-list" role="listbox" aria-label="Previous record dates">
              {dateKeys.map((dateKey) => (
                <button
                  key={dateKey}
                  className={`records-date-button${selectedDateKey === dateKey ? " records-date-button-selected" : ""}`}
                  type="button"
                  role="option"
                  aria-selected={selectedDateKey === dateKey}
                  onClick={() => onSelectDate(dateKey)}
                >
                  <span>{formatDateLabel(dateKey)}</span>
                  <span>{dateKey}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="content-section" aria-labelledby="previous-records-details-heading">
          <div className="section-heading">
            <h3 id="previous-records-details-heading">Details</h3>
            {selectedDateKey && <span className="goal-limit">{formatDateLabel(selectedDateKey)}</span>}
          </div>

          {isLoading && <p className="loading-message" role="status">Loading selected record...</p>}

          {!isLoading && !selectedRecord && dateKeys.length > 0 && (
            <p className="empty-state">Select a date to view its goals and notes.</p>
          )}

          {!isLoading && selectedRecord && (
            <div className="records-details">
              <p className="records-summary">
                {progressPercent}% complete - {completedGoals}/{goals.length} goals completed
              </p>
              <p className="records-summary">{plannedMinutes}m planned / {formatWorkedTime(workedSeconds)} worked</p>

              {goals.length === 0 ? (
                <p className="empty-state">No goals were recorded on this day.</p>
              ) : (
                <div className="records-goal-list">
                  {sortGoalsForDisplay(goals).map((goal) => (
                    <article className="records-goal" key={goal.id}>
                      <div className="goal-title-row">
                        <h4>{goal.title}</h4>
                        <span className="status-pill">{goal.status}</span>
                      </div>
                      <p>{goal.estimatedMinutes} min estimated</p>
                      <p>{formatElapsed(goal.elapsedSeconds)} elapsed</p>
                      {goal.completedAt && (
                        <time dateTime={goal.completedAt}>
                          Completed at {new Date(goal.completedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </time>
                      )}
                    </article>
                  ))}
                </div>
              )}

              <div className="records-notes">
                <h4>Notes</h4>
                <p>{selectedRecord.notes.trim().length > 0 ? selectedRecord.notes : "No notes were saved for this day."}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default PreviousRecordsDashboard;
