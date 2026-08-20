type GoalItemProps = {
  title: string;
  estimate: string;
  status: string;
};

function GoalItem({ title, estimate, status }: GoalItemProps) {
  return (
    <article className="goal-item">
      <div className="goal-marker" aria-hidden="true" />
      <div className="goal-content">
        <h3>{title}</h3>
        <p>{estimate}</p>
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
