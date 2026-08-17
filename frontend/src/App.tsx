import { Link, Route, Routes } from 'react-router-dom';

function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="brand">🍓 BerryBot</div>
        <p className="eyebrow">PROFESSIONAL MOCK INTERVIEW PLATFORM</p>
        <h1>Practice like you are in a real technical interview.</h1>
        <p className="hero-copy">
          Choose the topics you want to practice. BerryBot will progressively
          question, evaluate, challenge, and report on your performance.
        </p>
        <div className="topic-grid">
          {['Java', 'OOPS Concepts', 'Spring Boot', 'Microservices', 'Programming Round', 'React'].map(
            (topic) => (
              <div className="topic-card" key={topic}>
                <span>{topic}</span>
              </div>
            ),
          )}
        </div>
        <div className="hero-actions">
          <Link className="primary-button" to="/interviews/new">
            Start Interview
          </Link>
        </div>
      </section>
    </main>
  );
}

function NewInterviewPage() {
  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">NEW INTERVIEW</p>
        <h2>Select your interview topics</h2>
        <p className="muted">
          Topic selection will drive question selection, evaluation, history,
          and adaptive difficulty.
        </p>
        <div className="selection-grid">
          {['Java', 'OOPS Concepts', 'Spring Boot', 'Microservices', 'Programming Round', 'React'].map(
            (topic) => (
              <button className="selection-card" key={topic} type="button">
                <span className="checkbox">☐</span>
                <span>{topic}</span>
              </button>
            ),
          )}
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/interviews/new" element={<NewInterviewPage />} />
    </Routes>
  );
}

export default App;
