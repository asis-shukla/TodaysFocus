type HeaderProps = {
  onStartNewDay?: () => void;
};

function Header({ onStartNewDay }: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Thursday, August 20</p>
        <h1>Focus on Today</h1>
        <p className="header-copy">Make room for the work that matters.</p>
      </div>
      <button className="button button-secondary" type="button" onClick={onStartNewDay}>
        Start New Day
      </button>
    </header>
  );
}

export default Header;
