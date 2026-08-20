function GoalForm() {
  return (
    <section className="form-section" aria-labelledby="add-goal-heading">
      <div>
        <p className="section-kicker">Shape the day</p>
        <h2 id="add-goal-heading">Add a focus goal</h2>
      </div>
      <form className="goal-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>Goal title</span>
          <input type="text" name="title" placeholder="What deserves your attention?" />
        </label>
        <label className="duration-field">
          <span>Estimated time</span>
          <div className="input-with-suffix">
            <input type="number" name="duration" min="1" max="1440" placeholder="30" />
            <span>min</span>
          </div>
        </label>
        <button className="button button-primary" type="submit">Add goal</button>
      </form>
    </section>
  );
}

export default GoalForm;
