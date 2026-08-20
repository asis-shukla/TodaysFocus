import type { Goal } from "../types";

type GoalItemProps = {
  goal: Goal;
};

function GoalItem({ goal }: GoalItemProps) {
  const { title, estimatedMinutes, status } = goal;

  return (
    <article className="goal-item">
      <div className="goal-marker" aria-hidden="true" />
      <div className="goal-content">
        <h3>{title}</h3>
        <p>{estimatedMinutes} min estimated</p>
      </div>
      <span className="status-pill">{status}</span>
      <div className="goal-actions">
        <button className="icon-button" type="button" aria-label={`Start ${title}`}>
          Start
        </button>
        <button className="text-button" type="button">Edit</button>
      </div>
    </article>
  );
}

export default GoalItem;
