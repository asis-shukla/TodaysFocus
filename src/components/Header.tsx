type HeaderProps = {
  dateLabel: string;
  isDisabled: boolean;
  onStartNewDay: () => void;
};

function Header({ dateLabel, isDisabled, onStartNewDay }: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">{dateLabel}</p>
        <h1>Focus on Today</h1>
        <p className="header-copy">Make room for the work that matters.</p>
      </div>
      <button className="button button-secondary" type="button" onClick={onStartNewDay} disabled={isDisabled}>
        Start Fresh Day
      </button>
    </header>
  );
}

export default Header;
