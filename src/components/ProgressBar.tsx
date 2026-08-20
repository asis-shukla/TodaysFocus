type ProgressBarProps = {
  percentage: number;
};

function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label="Today's focus progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
    >
      <span className="progress-fill" style={{ width: `${percentage}%` }} />
    </div>
  );
}

export default ProgressBar;
