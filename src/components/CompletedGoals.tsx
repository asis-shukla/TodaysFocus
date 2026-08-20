import type { Goal } from "../types";

type CompletedGoalsProps = {
  goals: Goal[];
};

function formatWorkedTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}

function CompletedGoals({ goals }: CompletedGoalsProps) {
  const sortedGoals = [...goals].sort((first, second) =>
    Date.parse(second.completedAt ?? "") - Date.parse(first.completedAt ?? ""));

  return (
    <section className="content-section completed-section" aria-labelledby="completed-goals-heading">
      <div className="section-heading">
        <div>
          <p className="section-kicker">A record of progress</p>
          <h2 id="completed-goals-heading">Completed goals</h2>
        </div>
        <span className="completed-count">{goals.length} completed</span>
      </div>
      {sortedGoals.length === 0 ? (
        <p className="empty-state">Completed goals will appear here.</p>
      ) : (
        <div className="completed-goal-list">
          {sortedGoals.map((goal) => (
            <article className="completed-goal" key={goal.id}>
              <div>
                <h3>{goal.title}</h3>
                <p>{goal.estimatedMinutes} min estimated · {formatWorkedTime(goal.elapsedSeconds)} worked</p>
              </div>
              <time dateTime={goal.completedAt}>{goal.completedAt ? new Date(goal.completedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Completed"}</time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CompletedGoals;
