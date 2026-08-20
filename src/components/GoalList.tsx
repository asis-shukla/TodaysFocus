import GoalItem from "./GoalItem";
import type { Goal } from "../types";

type GoalListProps = {
  goals: Goal[];
};

function GoalList({ goals }: GoalListProps) {
  return (
    <section className="content-section" aria-labelledby="active-goals-heading">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Your focus list</p>
          <h2 id="active-goals-heading">Active goals</h2>
        </div>
        <span className="goal-limit">{goals.length} / 5</span>
      </div>
      {goals.length === 0 ? (
        <p className="empty-state">Add up to 5 focus goals for today.</p>
      ) : (
        <div className="goal-list">
          {goals.map((goal) => <GoalItem key={goal.id} goal={goal} />)}
        </div>
      )}
    </section>
  );
}

export default GoalList;
