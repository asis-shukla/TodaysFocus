function CompletedGoals() {
  return (
    <section className="content-section completed-section" aria-labelledby="completed-goals-heading">
      <div className="section-heading">
        <div>
          <p className="section-kicker">A record of progress</p>
          <h2 id="completed-goals-heading">Completed goals</h2>
        </div>
        <span className="completed-count">0 completed</span>
      </div>
      <p className="empty-state">Completed goals will appear here.</p>
    </section>
  );
}

export default CompletedGoals;
