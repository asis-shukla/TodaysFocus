import GoalItem from "./GoalItem";
import type { Goal } from "../types";

type GoalListProps = {
  goals: Goal[];
  isDisabled: boolean;
  onEditGoal: (goalId: string, title: string, duration: string) => Promise<void>;
};

function GoalList({ goals, isDisabled, onEditGoal }: GoalListProps) {
  const activeGoals = goals.filter((goal) => goal.status !== "completed");

  return (
    <section className="content-section" aria-labelledby="active-goals-heading">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Your focus list</p>
          <h2 id="active-goals-heading">Active goals</h2>
        </div>
        <span className="goal-limit">{goals.length} / 5</span>
      </div>
      {activeGoals.length === 0 ? (
        <p className="empty-state">Add up to 5 focus goals for today.</p>
      ) : (
        <div className="goal-list">
          {activeGoals.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              isDisabled={isDisabled}
              onEditGoal={onEditGoal}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default GoalList;
