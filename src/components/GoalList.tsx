import GoalItem from "./GoalItem";

type GoalListProps = {
  goals: Array<{
    title: string;
    estimate: string;
    status: string;
  }>;
};

function GoalList({ goals }: GoalListProps) {
  return (
    <section className="content-section" aria-labelledby="active-goals-heading">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Your focus list</p>
          <h2 id="active-goals-heading">Active goals</h2>
        </div>
        <span className="goal-limit">0 / 5</span>
      </div>
      {goals.length === 0 ? (
        <p className="empty-state">Add up to 5 focus goals for today.</p>
      ) : (
        <div className="goal-list">
          {goals.map((goal) => <GoalItem key={goal.title} {...goal} />)}
        </div>
      )}
    </section>
  );
}

export default GoalList;
