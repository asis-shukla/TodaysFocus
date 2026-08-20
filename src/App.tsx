import "./App.css";
import CompletedGoals from "./components/CompletedGoals";
import FocusSummary from "./components/FocusSummary";
import GoalForm from "./components/GoalForm";
import GoalList from "./components/GoalList";
import Header from "./components/Header";
import NotesSection from "./components/NotesSection";

function App() {
  return (
    <main className="dashboard-shell">
      <Header />
      <FocusSummary completedGoals={0} totalGoals={0} plannedMinutes={0} workedMinutes={0} />
      <div className="dashboard-grid">
        <div className="dashboard-primary">
          <GoalList goals={[]} />
          <GoalForm />
        </div>
        <div className="dashboard-secondary">
          <CompletedGoals />
          <NotesSection />
        </div>
      </div>
      <p className="motivation">You are unstoppable, keep pushing.</p>
    </main>
  );
}

export default App;
