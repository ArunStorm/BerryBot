import { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';

const TOPICS = [
  'Java',
  'OOPS Concepts',
  'Spring Boot',
  'Microservices',
  'Programming Round',
  'React',
] as const;

type Topic = (typeof TOPICS)[number];

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
          {TOPICS.map((topic) => (
            <div className="topic-card" key={topic}>
              <span>{topic}</span>
            </div>
          ))}
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
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);

  const toggleTopic = (topic: Topic) => {
    setSelectedTopics((current) =>
      current.includes(topic)
        ? current.filter((selected) => selected !== topic)
        : [...current, topic],
    );
  };

  const clearSelection = () => setSelectedTopics([]);

  return (
    <main className="app-shell">
      <section className="panel">
        <p className="eyebrow">NEW INTERVIEW</p>
        <h2>Select your interview topics</h2>
        <p className="muted">
          Select one or more topics. Your selection will drive question
          selection, evaluation, history, and adaptive difficulty.
        </p>

        <div
          className="selection-grid"
          role="group"
          aria-label="Interview topics"
        >
          {TOPICS.map((topic) => {
            const selected = selectedTopics.includes(topic);

            return (
              <label
                className={`selection-card${selected ? ' selected' : ''}`}
                key={topic}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleTopic(topic)}
                  aria-label={`Select ${topic}`}
                />
                <span className="checkbox-mark" aria-hidden="true">
                  {selected ? '✓' : ''}
                </span>
                <span>{topic}</span>
              </label>
            );
          })}
        </div>

        <div className="selection-summary" aria-live="polite">
          <strong>{selectedTopics.length}</strong>{' '}
          {selectedTopics.length === 1 ? 'topic' : 'topics'} selected
        </div>

        <div className="selection-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={clearSelection}
            disabled={selectedTopics.length === 0}
          >
            Clear selection
          </button>
          <button
            className="primary-button start-button"
            type="button"
            disabled={selectedTopics.length === 0}
            aria-disabled={selectedTopics.length === 0}
          >
            Continue
          </button>
        </div>

        <p className="foundation-note">
          Interview configuration and the live interview engine will be
          connected in the next implementation phase.
        </p>
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
