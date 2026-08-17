import { useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

const TOPICS = ['Java', 'OOPS Concepts', 'Spring Boot', 'Microservices', 'Programming Round', 'React'] as const;
type Topic = (typeof TOPICS)[number];
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type QuestionType = 'Technical' | 'Scenario' | 'Coding';
type Question = { id: string; topic: Topic; type: QuestionType; difficulty: Difficulty; prompt: string; expected: string[]; reference: string };
type InterviewResult = { topic: Topic; question: string; answer: string; score: number; feedback: string };

const QUESTIONS: Question[] = [
  { id: 'java-1', topic: 'Java', type: 'Technical', difficulty: 'Medium', prompt: 'Explain the difference between HashMap and ConcurrentHashMap. When would you use each?', expected: ['hashmap', 'concurrenthashmap', 'thread', 'concurrency', 'synchron'], reference: 'HashMap is not thread-safe. ConcurrentHashMap supports concurrent access with fine-grained coordination and is appropriate for shared mutable maps in concurrent applications.' },
  { id: 'java-2', topic: 'Java', type: 'Technical', difficulty: 'Hard', prompt: 'Explain how Java Streams differ from collections and describe a case where flatMap is useful.', expected: ['stream', 'collection', 'flatmap', 'pipeline', 'lazy'], reference: 'Collections hold data; streams describe a computation pipeline over data. flatMap flattens nested streams, such as List<List<String>> into a single stream of strings.' },
  { id: 'oops-1', topic: 'OOPS Concepts', type: 'Technical', difficulty: 'Medium', prompt: 'Explain polymorphism in Java with a practical example.', expected: ['polymorphism', 'overrid', 'runtime', 'interface', 'parent'], reference: 'Polymorphism allows a parent type or interface to refer to different concrete implementations. Overridden methods are selected at runtime based on the actual object.' },
  { id: 'oops-2', topic: 'OOPS Concepts', type: 'Scenario', difficulty: 'Hard', prompt: 'You inherit a large class with too many responsibilities. How would you redesign it?', expected: ['single responsibility', 'solid', 'composition', 'interface', 'separat'], reference: 'Identify responsibilities, separate them into cohesive classes, prefer composition, introduce interfaces at stable boundaries, and apply SOLID principles without over-engineering.' },
  { id: 'spring-1', topic: 'Spring Boot', type: 'Technical', difficulty: 'Medium', prompt: 'Why is constructor injection preferred over field injection in Spring?', expected: ['constructor', 'dependency', 'immutable', 'test', 'null'], reference: 'Constructor injection makes dependencies explicit, supports immutability, prevents partially initialized objects, and makes unit testing straightforward without reflection.' },
  { id: 'spring-2', topic: 'Spring Boot', type: 'Scenario', difficulty: 'Hard', prompt: 'A Spring Boot API is returning 500 errors in production. What is your troubleshooting approach?', expected: ['log', 'trace', 'metric', 'exception', 'correlation', 'health'], reference: 'Start with request IDs/correlation IDs and logs, identify the exception and failing dependency, check metrics and health, reproduce safely, then fix and verify with regression testing.' },
  { id: 'micro-1', topic: 'Microservices', type: 'Technical', difficulty: 'Medium', prompt: 'Explain the Saga pattern and why it is useful in distributed transactions.', expected: ['saga', 'transaction', 'compensat', 'service', 'event'], reference: 'Saga breaks a distributed transaction into local transactions. Each successful step advances the workflow; failures trigger compensating actions. It avoids a global database transaction across services.' },
  { id: 'micro-2', topic: 'Microservices', type: 'Scenario', difficulty: 'Hard', prompt: 'Payment succeeds but the order service times out. How would you prevent duplicate payment and reconcile the order?', expected: ['idempot', 'payment', 'retry', 'event', 'status', 'reconcil'], reference: 'Use an idempotency key for payment, persist the payment result, make retries safe, publish or consume durable events, and reconcile order/payment state asynchronously.' },
  { id: 'programming-1', topic: 'Programming Round', type: 'Coding', difficulty: 'Medium', prompt: 'Given an integer array, explain how you would find the first non-repeating element and its time complexity.', expected: ['map', 'frequency', 'hash', 'o(n)', 'two pass', 'count'], reference: 'Count frequencies in a hash map in one pass, then scan the array in order to find the first element with count one. Time O(n), extra space O(n).' },
  { id: 'programming-2', topic: 'Programming Round', type: 'Coding', difficulty: 'Hard', prompt: 'How would you detect a cycle in a linked list without extra space?', expected: ['floyd', 'slow', 'fast', 'two pointer', 'cycle'], reference: 'Use Floyd’s tortoise-and-hare algorithm: move slow by one and fast by two. If they meet, a cycle exists; O(n) time and O(1) space.' },
  { id: 'react-1', topic: 'React', type: 'Technical', difficulty: 'Medium', prompt: 'Explain controlled components in React and why they are useful for forms.', expected: ['controlled', 'state', 'value', 'onchange', 'form'], reference: 'A controlled input gets its value from React state and updates through an event handler. This gives React a single source of truth for validation and form behavior.' },
  { id: 'react-2', topic: 'React', type: 'Scenario', difficulty: 'Hard', prompt: 'A React page renders slowly after every keystroke. How would you investigate and optimize it?', expected: ['profiler', 'memo', 'usememo', 'uscallback', 'debounc', 'render'], reference: 'Profile first, identify unnecessary renders, then apply memoization selectively, stable callbacks, debouncing for expensive input-driven work, and component decomposition.' },
];

function getQuestions(topics: Topic[], difficulty: Difficulty, count: number) {
  const matching = QUESTIONS.filter((q) => topics.includes(q.topic) && q.difficulty === difficulty);
  const fallback = QUESTIONS.filter((q) => topics.includes(q.topic));
  return [...matching, ...fallback.filter((q) => !matching.includes(q))].slice(0, count);
}

function HomePage() {
  return <main className="app-shell"><section className="hero-card"><div className="brand">🍓 BerryBot</div><p className="eyebrow">PROFESSIONAL MOCK INTERVIEW PLATFORM</p><h1>Practice like you are in a real technical interview.</h1><p className="hero-copy">Choose the topics you want to practice. BerryBot progressively questions, evaluates, challenges, and reports on your performance.</p><div className="topic-grid">{TOPICS.map((topic) => <div className="topic-card" key={topic}><span>{topic}</span></div>)}</div><div className="hero-actions"><Link className="primary-button" to="/interviews/new">Start Interview</Link></div></section></main>;
}

function NewInterviewPage() {
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const toggleTopic = (topic: Topic) => setSelectedTopics((current) => current.includes(topic) ? current.filter((selected) => selected !== topic) : [...current, topic]);
  return <main className="app-shell"><section className="panel"><p className="eyebrow">NEW INTERVIEW</p><h2>Select your interview topics</h2><p className="muted">Select one or more topics. Your selection drives question selection, evaluation, history, and adaptive difficulty.</p><div className="selection-grid" role="group" aria-label="Interview topics">{TOPICS.map((topic) => { const selected = selectedTopics.includes(topic); return <label className={`selection-card${selected ? ' selected' : ''}`} key={topic}><input type="checkbox" checked={selected} onChange={() => toggleTopic(topic)} aria-label={`Select ${topic}`} /><span className="checkbox-mark" aria-hidden="true">{selected ? '✓' : ''}</span><span>{topic}</span></label>; })}</div><div className="selection-summary" aria-live="polite"><strong>{selectedTopics.length}</strong> {selectedTopics.length === 1 ? 'topic' : 'topics'} selected</div><div className="selection-actions"><button className="secondary-button" type="button" onClick={() => setSelectedTopics([])} disabled={selectedTopics.length === 0}>Clear selection</button><button className="primary-button start-button" type="button" disabled={selectedTopics.length === 0} onClick={() => navigate('/interviews/configure', { state: { topics: selectedTopics } })}>Continue</button></div></section></main>;
}

function RedirectCard({ title, message, action, to }: { title: string; message: string; action: string; to: string }) {
  return <main className="app-shell"><section className="panel empty-panel"><p className="eyebrow">BERRYBOT</p><h2>{title}</h2><p className="muted">{message}</p><Link className="primary-button" to={to}>{action}</Link></section></main>;
}

function ConfigureInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const topics = (location.state as { topics?: Topic[] } | null)?.topics ?? [];
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  if (!topics.length) return <RedirectCard title="No topics selected" message="Choose at least one topic before configuring your interview." action="Back to topics" to="/interviews/new" />;
  return <main className="app-shell"><section className="panel config-panel"><p className="eyebrow">INTERVIEW CONFIGURATION</p><h2>Set your interview level</h2><p className="muted">Configure the session before BerryBot starts asking questions.</p><div className="config-grid"><div className="config-card"><h3>Topics</h3><div className="chip-list">{topics.map((topic) => <span className="chip" key={topic}>{topic}</span>)}</div></div><div className="config-card"><h3>Difficulty</h3><div className="option-row">{(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => <button key={level} type="button" className={`option-button${difficulty === level ? ' active' : ''}`} onClick={() => setDifficulty(level)}>{level}</button>)}</div></div><div className="config-card"><h3>Questions</h3><div className="option-row">{[3, 5, 8].map((count) => <button key={count} type="button" className={`option-button${questionCount === count ? ' active' : ''}`} onClick={() => setQuestionCount(count)}>{count}</button>)}</div></div></div><div className="selection-actions"><button className="secondary-button" type="button" onClick={() => navigate('/interviews/new')}>Back</button><button className="primary-button" type="button" onClick={() => navigate('/interviews/session', { state: { topics, difficulty, questionCount } })}>Start interview</button></div></section></main>;
}

function InterviewSessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { topics?: Topic[]; difficulty?: Difficulty; questionCount?: number } | null;
  const topics = state?.topics ?? [];
  const difficulty = state?.difficulty ?? 'Medium';
  const questionCount = state?.questionCount ?? 5;
  const questions = useMemo(() => getQuestions(topics, difficulty, questionCount), [topics, difficulty, questionCount]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<InterviewResult[]>([]);
  if (!topics.length) return <RedirectCard title="Interview not configured" message="Start by selecting your interview topics." action="Select topics" to="/interviews/new" />;
  if (!questions.length) return <RedirectCard title="Question bank unavailable" message="No questions are currently available for the selected topics." action="Choose different topics" to="/interviews/new" />;
  const question = questions[index];
  const evaluate = () => { if (!answer.trim() || submitted) return; const normalized = answer.toLowerCase(); const matches = question.expected.filter((keyword) => normalized.includes(keyword)).length; const score = Math.min(100, Math.max(20, Math.round((matches / question.expected.length) * 100))); const feedback = score >= 80 ? 'Strong answer. You covered the core concepts expected at this level.' : score >= 50 ? 'Good direction, but strengthen the answer with concrete implementation details and trade-offs.' : 'The answer needs more depth. Cover the core concept, explain why it matters, and add a practical example.'; setResults((current) => [...current, { topic: question.topic, question: question.prompt, answer, score, feedback }]); setSubmitted(true); };
  const nextQuestion = () => { if (index === questions.length - 1) { const finalResults = results; navigate('/interviews/result', { state: { topics, difficulty, results: finalResults } }); return; } setIndex((current) => current + 1); setAnswer(''); setSubmitted(false); };
  return <main className="app-shell"><section className="panel interview-panel"><div className="interview-header"><div><p className="eyebrow">LIVE INTERVIEW</p><h2>Question {index + 1} of {questions.length}</h2></div><span className="status-pill">{difficulty}</span></div><div className="progress-track"><span style={{ width: `${((index + (submitted ? 1 : 0)) / questions.length) * 100}%` }} /></div><div className="question-meta"><span>{question.topic}</span><span>{question.type}</span></div><h3 className="question-title">{question.prompt}</h3><textarea className="answer-box" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type your interview answer here. Explain your reasoning and use examples where appropriate." disabled={submitted} />{!submitted ? <div className="selection-actions"><button className="secondary-button" type="button" onClick={() => navigate('/interviews/new')}>Exit</button><button className="primary-button" type="button" onClick={evaluate} disabled={!answer.trim()}>Submit answer</button></div> : <><div className="feedback-card"><div className="score-badge">{results[results.length - 1]?.score}/100</div><div><strong>BerryBot feedback</strong><p>{results[results.length - 1]?.feedback}</p><details><summary>Reference answer</summary><p>{question.reference}</p></details></div></div><div className="selection-actions"><button className="primary-button" type="button" onClick={nextQuestion}>{index === questions.length - 1 ? 'View final report' : 'Next question'}</button></div></>}</section></main>;
}

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { topics?: Topic[]; difficulty?: Difficulty; results?: InterviewResult[] } | null;
  const results = state?.results ?? [];
  const average = results.length ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : 0;
  const grade = average >= 85 ? 'Excellent' : average >= 70 ? 'Strong' : average >= 50 ? 'Developing' : 'Needs practice';
  if (!results.length) return <RedirectCard title="No interview report" message="Complete an interview before viewing the report." action="Start interview" to="/interviews/new" />;
  return <main className="app-shell"><section className="panel result-panel"><p className="eyebrow">INTERVIEW COMPLETE</p><h2>Your BerryBot report</h2><div className="result-summary"><div className="score-circle">{average}<small>/100</small></div><div><h3>{grade}</h3><p className="muted">{results.length} questions evaluated across {new Set(results.map((result) => result.topic)).size} topic(s).</p></div></div><div className="result-list">{results.map((result, resultIndex) => <article className="result-item" key={`${result.topic}-${resultIndex}`}><div><strong>Q{resultIndex + 1} · {result.topic}</strong><p>{result.question}</p><span>{result.feedback}</span></div><b>{result.score}</b></article>)}</div><div className="selection-actions"><button className="secondary-button" type="button" onClick={() => navigate('/interviews/new')}>Practice again</button><Link className="primary-button" to="/">Back to home</Link></div></section></main>;
}

function App() {
  return <Routes><Route path="/" element={<HomePage />} /><Route path="/interviews/new" element={<NewInterviewPage />} /><Route path="/interviews/configure" element={<ConfigureInterviewPage />} /><Route path="/interviews/session" element={<InterviewSessionPage />} /><Route path="/interviews/result" element={<ResultPage />} /></Routes>;
}

export default App;
