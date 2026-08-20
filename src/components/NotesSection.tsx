function NotesSection() {
  return (
    <section className="notes-section" aria-labelledby="notes-heading">
      <div>
        <p className="section-kicker">Close the loop</p>
        <h2 id="notes-heading">Daily reflection</h2>
        <p className="section-description">Capture a win, a blocker, or what you want to carry forward.</p>
      </div>
      <label className="visually-hidden" htmlFor="daily-notes">Daily reflection notes</label>
      <textarea id="daily-notes" name="notes" rows={5} placeholder="What did you learn today?" />
    </section>
  );
}

export default NotesSection;
