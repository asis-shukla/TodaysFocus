import ProgressBar from "./ProgressBar";

type FocusSummaryProps = {
  completedGoals: number;
  totalGoals: number;
  plannedMinutes: number;
  workedMinutes: number;
};

function formatDurationMinutes(totalMinutes: number) {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourLabel = `${hours} hour${hours === 1 ? "" : "s"}`;
  return minutes > 0 ? `${hourLabel} ${minutes} minute${minutes === 1 ? "" : "s"}` : hourLabel;
}

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
        <span>{formatDurationMinutes(plannedMinutes)} planned <b aria-hidden="true">/</b> {formatDurationMinutes(workedMinutes)} worked</span>
      </div>
    </section>
  );
}

export default FocusSummary;
