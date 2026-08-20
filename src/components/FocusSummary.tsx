import ProgressBar from "./ProgressBar";

type FocusSummaryProps = {
  completedGoals: number;
  totalGoals: number;
  plannedMinutes: number;
  workedMinutes: number;
};

function FocusSummary({
  completedGoals,
  totalGoals,
  plannedMinutes,
  workedMinutes,
}: FocusSummaryProps) {
  const percentage = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

  return (
    <section className="summary-panel" aria-labelledby="progress-heading">
      <div className="summary-heading">
        <div>
          <p className="section-kicker">Daily progress</p>
          <h2 id="progress-heading">A clear day starts here.</h2>
        </div>
        <strong className="progress-value">{percentage}%</strong>
      </div>
      <ProgressBar percentage={percentage} />
      <div className="summary-footer">
        <span>{percentage}% complete - {completedGoals}/{totalGoals} goals completed</span>
        <span>{plannedMinutes}m planned <b aria-hidden="true">/</b> {workedMinutes}m worked</span>
      </div>
    </section>
  );
}

export default FocusSummary;
