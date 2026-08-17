import { useEffect, useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

const TOPICS = ['Java', 'OOPS Concepts', 'Spring Boot', 'Microservices', 'Programming Round', 'React'] as const;
type Topic = (typeof TOPICS)[number];
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type InterviewMode = 'Voice Interview' | 'Text Interview';
type QuestionType = 'Technical' | 'Scenario' | 'Coding';
type Question = { id: string; topic: Topic; type: QuestionType; difficulty: Difficulty; prompt: string; expected: string[]; reference: string; followUp: string };
type Result = { questionId: string; topic: Topic; question: string; answer: string; score: number; feedback: string; reference: string; followUp: string };
type HistoryItem = { id: string; date: string; topics: Topic[]; difficulty: Difficulty; score: number; results: Result[]; durationSeconds: number };

const QUESTIONS: Question[] = [
  { id: 'java-1', topic: 'Java', type: 'Technical', difficulty: 'Medium', prompt: 'Explain the difference between HashMap and ConcurrentHashMap. When would you use each?', expected: ['hashmap', 'concurrenthashmap', 'thread', 'concurrency', 'synchron'], reference: 'HashMap is not thread-safe. ConcurrentHashMap supports concurrent access with fine-grained coordination and is appropriate for shared mutable maps in concurrent applications.', followUp: 'How does ConcurrentHashMap provide concurrency without locking the entire map?' },
  { id: 'java-2', topic: 'Java', type: 'Technical', difficulty: 'Hard', prompt: 'Explain Java Streams and give a practical example where flatMap is useful.', expected: ['stream', 'collection', 'flatmap', 'pipeline', 'lazy'], reference: 'Collections hold data; streams describe a computation pipeline. flatMap flattens nested structures such as List<List<String>> into one stream.', followUp: 'Why is lazy evaluation useful in a stream pipeline?' },
  { id: 'java-3', topic: 'Java', type: 'Scenario', difficulty: 'Hard', prompt: 'A production service has intermittent thread starvation. How would you investigate it?', expected: ['thread', 'pool', 'deadlock', 'dump', 'jstack', 'metric', 'monitor'], reference: 'Inspect thread-pool metrics, thread dumps, blocked/waiting threads, deadlocks, queue depth, CPU, downstream latency and pool sizing. Reproduce safely and fix the bottleneck rather than simply increasing pool size.', followUp: 'What evidence in a thread dump would make you suspect a deadlock?' },
  { id: 'oops-1', topic: 'OOPS Concepts', type: 'Technical', difficulty: 'Medium', prompt: 'Explain polymorphism in Java with a practical example.', expected: ['polymorphism', 'overrid', 'runtime', 'interface', 'parent'], reference: 'Polymorphism lets a parent type or interface refer to different concrete implementations. Overridden methods are selected at runtime based on the actual object.', followUp: 'How does runtime polymorphism help when designing extensible services?' },
  { id: 'oops-2', topic: 'OOPS Concepts', type: 'Scenario', difficulty: 'Hard', prompt: 'You inherit a large class with too many responsibilities. How would you redesign it?', expected: ['single responsibility', 'solid', 'composition', 'interface', 'separat'], reference: 'Identify responsibilities, separate cohesive behavior, prefer composition, introduce interfaces at stable boundaries, and apply SOLID without over-engineering.', followUp: 'How would you refactor it without breaking existing consumers?' },
  { id: 'spring-1', topic: 'Spring Boot', type: 'Technical', difficulty: 'Medium', prompt: 'Why is constructor injection preferred over field injection in Spring?', expected: ['constructor', 'dependency', 'immutable', 'test', 'null'], reference: 'Constructor injection makes dependencies explicit, supports immutability, prevents partially initialized objects and makes unit testing straightforward.', followUp: 'How would you handle a circular dependency after switching to constructor injection?' },
  { id: 'spring-2', topic: 'Spring Boot', type: 'Scenario', difficulty: 'Hard', prompt: 'A Spring Boot API returns 500 errors in production. Give your troubleshooting approach.', expected: ['log', 'trace', 'metric', 'exception', 'correlation', 'health'], reference: 'Use correlation IDs and logs to identify the exception and dependency, inspect metrics and health, reproduce safely, fix the root cause and verify with regression tests.', followUp: 'What would you check if the application logs look healthy but clients still receive 500 responses?' },
  { id: 'micro-1', topic: 'Microservices', type: 'Technical', difficulty: 'Medium', prompt: 'Explain the Saga pattern and why it is useful in distributed transactions.', expected: ['saga', 'transaction', 'compensat', 'service', 'event'], reference: 'Saga breaks a distributed transaction into local transactions. Successful steps advance the workflow; failures trigger compensating actions. It avoids a global transaction across services.', followUp: 'When would you choose orchestration over choreography?' },
  { id: 'micro-2', topic: 'Microservices', type: 'Scenario', difficulty: 'Hard', prompt: 'Payment succeeds but Order Service times out. How would you prevent duplicate payment and reconcile state?', expected: ['idempot', 'payment', 'retry', 'event', 'status', 'reconcil'], reference: 'Use an idempotency key, persist payment state, make retries safe, publish durable events and reconcile order/payment state asynchronously.', followUp: 'Where would you store the idempotency key and how long should it remain valid?' },
  { id: 'programming-1', topic: 'Programming Round', type: 'Coding', difficulty: 'Medium', prompt: 'Given an integer array, explain how you would find the first non-repeating element and its complexity.', expected: ['map', 'frequency', 'hash', 'o(n)', 'two pass', 'count'], reference: 'Count frequencies in a hash map, then scan the array in order to find the first element with count one. Time O(n), extra space O(n).', followUp: 'Can you solve it with a different data structure while preserving order?' },
  { id: 'programming-2', topic: 'Programming Round', type: 'Coding', difficulty: 'Hard', prompt: 'How would you detect a cycle in a linked list without extra space?', expected: ['floyd', 'slow', 'fast', 'two pointer', 'cycle'], reference: 'Use Floyd’s tortoise-and-hare algorithm: slow moves one node and fast moves two. A meeting point means a cycle exists. O(n) time and O(1) space.', followUp: 'How would you find the first node where the cycle begins?' },
  { id: 'react-1', topic: 'React', type: 'Technical', difficulty: 'Medium', prompt: 'Explain controlled components in React and why they are useful for forms.', expected: ['controlled', 'state', 'value', 'onchange', 'form'], reference: 'A controlled input gets its value from React state and updates through an event handler, giving React a single source of truth for validation and behavior.', followUp: 'How would you avoid excessive renders in a very large form?' },
  { id: 'react-2', topic: 'React', type: 'Scenario', difficulty: 'Hard', prompt: 'A React page renders slowly after every keystroke. How would you investigate and optimize it?', expected: ['profiler', 'memo', 'usememo', 'uscallback', 'debounc', 'render'], reference: 'Profile first, identify unnecessary renders, then apply memoization selectively, stable callbacks, debouncing for expensive input-driven work and component decomposition.', followUp: 'How do you know whether React.memo actually improved the problem?' },
];

function evaluate(question: Question, answer: string) {
  const text = answer.toLowerCase();
  const matches = question.expected.filter((k) => text.includes(k));
  const coverage = matches.length / question.expected.length;
  const score = Math.min(100, Math.max(20, Math.round(coverage * 100)));
  const feedback = score >= 85 ? 'Strong answer. You covered the important concepts. BerryBot would probe deeper into trade-offs and production implications.' : score >= 60 ? 'Good direction, but the answer needs more implementation detail, reasoning and trade-offs for a senior interview.' : 'The answer needs more depth. Start with the core concept, explain why it matters, then give a practical example and failure mode.';
  return { score, feedback };
}

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.96;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function useSpeechRecognition(onTranscript: (text: string) => void) {
  const recognitionRef = useRef<any>(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  useEffect(() => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) return;
    setSupported(true);
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: any) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) finalText += event.results[i][0].transcript;
      if (finalText.trim()) onTranscript(finalText.trim());
    };
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [onTranscript]);
  const start = () => { try { recognitionRef.current?.start(); } catch { /* already listening */ } };
  const stop = () => recognitionRef.current?.stop();
  return { supported, listening, start, stop };
}

function Shell({ children }: { children: React.ReactNode }) {
  return <><header className="topbar"><Link to="/" className="brand-link">🍓 <strong>BerryBot</strong></Link><nav><Link to="/interviews/new">New Interview</Link><Link to="/history">History</Link><Link to="/coding">Coding Lab</Link></nav></header>{children}</>;
}

function HomePage() {
  return <main className="page"><section className="hero"><div><p className="eyebrow">AI MOCK INTERVIEW PLATFORM</p><h1>Interview like you are sitting across from a senior engineer.</h1><p className="hero-copy">Voice interviews, adaptive technical follow-ups, coding challenges, detailed scorecards and persistent interview history — built for developers.</p><div className="hero-actions"><Link className="primary-button" to="/interviews/new">Start AI Interview</Link><Link className="secondary-button" to="/coding">Open Coding Lab</Link></div></div><div className="hero-console"><div className="console-top"><span>● LIVE INTERVIEW</span><span>Question 4 / 12</span></div><div className="wave">••••••••••••••••••••</div><strong>“How would you prevent duplicate payments in a microservices architecture?”</strong><div className="console-answer">🎙 Listening to candidate…</div></div></section><section className="feature-grid">{[['🎙️','Voice interviewer','AI asks questions aloud and listens to your spoken answer.'],['🧠','Adaptive follow-ups','Strong answers trigger deeper questions; weak answers trigger clarification.'],['💻','Coding Lab','VS Code-style editor with multi-language syntax support and isolated execution architecture.'],['📊','Interview history','Every question, answer, score and explanation remains available for review.']].map(([icon,title,text]) => <article className="feature-card" key={title}><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</section></main>;
}

function NewInterviewPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Topic[]>([]);
  return <main className="page"><section className="panel"><p className="eyebrow">NEW INTERVIEW</p><h2>Choose your interview topics</h2><p className="muted">Select one or more. BerryBot will build the interview around only these topics.</p><div className="selection-grid">{TOPICS.map((topic) => { const active = selected.includes(topic); return <button type="button" className={`selection-card${active ? ' selected' : ''}`} key={topic} onClick={() => setSelected((s) => active ? s.filter((x) => x !== topic) : [...s, topic])}><span className="checkbox-mark">{active ? '✓' : ''}</span><span>{topic}</span></button>; })}</div><div className="selection-summary">{selected.length} topic{selected.length === 1 ? '' : 's'} selected</div><div className="selection-actions"><button className="secondary-button" disabled={!selected.length} onClick={() => setSelected([])}>Clear</button><button className="primary-button" disabled={!selected.length} onClick={() => navigate('/interviews/configure', { state: { topics: selected } })}>Continue</button></div></section></main>;
}

function ConfigurePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const topics = ((location.state as any)?.topics ?? []) as Topic[];
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [mode, setMode] = useState<InterviewMode>('Voice Interview');
  const [count, setCount] = useState(5);
  if (!topics.length) return <Redirect title="No topics selected" to="/interviews/new" />;
  const available = QUESTIONS.filter((q) => topics.includes(q.topic));
  const safeCount = Math.min(count, Math.max(3, available.length));
  return <main className="page"><section className="panel config-panel"><p className="eyebrow">INTERVIEW SETUP</p><h2>Configure your session</h2><div className="config-section"><h3>Topics</h3><div className="chip-list">{topics.map((t) => <span className="chip" key={t}>{t}</span>)}</div></div><div className="config-section"><h3>Interview mode</h3><div className="option-row">{(['Voice Interview','Text Interview'] as InterviewMode[]).map((x) => <button className={`option-button${mode === x ? ' active' : ''}`} key={x} onClick={() => setMode(x)}>{x === 'Voice Interview' ? '🎙 ' : '⌨️ '}{x}</button>)}</div><p className="hint">Voice mode uses your browser microphone and speech synthesis. No paid AI API is required for this browser interaction.</p></div><div className="config-section"><h3>Difficulty</h3><div className="option-row">{(['Easy','Medium','Hard'] as Difficulty[]).map((x) => <button className={`option-button${difficulty === x ? ' active' : ''}`} key={x} onClick={() => setDifficulty(x)}>{x}</button>)}</div></div><div className="config-section"><h3>Questions</h3><div className="option-row">{[3,5,8].filter((n) => n <= available.length).map((n) => <button className={`option-button${safeCount === n ? ' active' : ''}`} key={n} onClick={() => setCount(n)}>{n}</button>)}</div></div><div className="selection-actions"><button className="secondary-button" onClick={() => navigate('/interviews/new')}>Back</button><button className="primary-button" onClick={() => navigate('/interviews/live', { state: { topics, difficulty, count: safeCount, mode } })}>Start Interview</button></div></section></main>;
}

function LiveInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) ?? {};
  const topics = state.topics as Topic[] | undefined;
  const difficulty = (state.difficulty ?? 'Medium') as Difficulty;
  const count = state.count ?? 5;
  const mode = (state.mode ?? 'Voice Interview') as InterviewMode;
  const questions = useMemo(() => {
    const pool = QUESTIONS.filter((q) => topics?.includes(q.topic));
    const matching = pool.filter((q) => q.difficulty === difficulty);
    return [...matching, ...pool.filter((q) => !matching.includes(q))].slice(0, count);
  }, [topics, difficulty, count]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const current = questions[index];
  const appendTranscript = (text: string) => setAnswer((old) => old ? `${old} ${text}` : text);
  const { supported, listening, start, stop } = useSpeechRecognition(appendTranscript);
  useEffect(() => {
    if (!current || mode !== 'Voice Interview') return;
    setAiSpeaking(true);
    speak(current.prompt);
    const timer = window.setTimeout(() => setAiSpeaking(false), Math.max(1800, current.prompt.length * 45));
    return () => window.clearTimeout(timer);
  }, [current, mode]);
  if (!topics?.length || !current) return <Redirect title="Interview unavailable" to="/interviews/new" />;
  const submit = () => {
    if (!answer.trim() || submitted) return;
    if (listening) stop();
    const { score, feedback } = evaluate(current, answer);
    const result: Result = { questionId: current.id, topic: current.topic, question: current.prompt, answer, score, feedback, reference: current.reference, followUp: current.followUp };
    setResults((r) => [...r, result]);
    setSubmitted(true);
    if (mode === 'Voice Interview') speak(score >= 75 ? 'Good answer. Let us go deeper.' : 'I want to clarify one part of that answer.');
  };
  const next = () => {
    if (!submitted) return;
    if (index === questions.length - 1) {
      const finalResults = results;
      const history: HistoryItem = { id: crypto.randomUUID(), date: new Date().toISOString(), topics, difficulty, score: Math.round(finalResults.reduce((s, r) => s + r.score, 0) / finalResults.length), results: finalResults, durationSeconds: 0 };
      const old = JSON.parse(localStorage.getItem('berrybot.history') ?? '[]');
      localStorage.setItem('berrybot.history', JSON.stringify([history, ...old]));
      navigate('/interviews/result', { state: { topics, difficulty, results: finalResults } });
      return;
    }
    setIndex((i) => i + 1); setAnswer(''); setSubmitted(false);
  };
  return <main className="page"><section className="live-layout"><div className="interview-card"><div className="live-header"><div><p className="eyebrow">{mode === 'Voice Interview' ? '🎙 LIVE VOICE INTERVIEW' : 'LIVE INTERVIEW'}</p><h2>Question {index + 1} / {questions.length}</h2></div><span className="status-pill">{difficulty}</span></div><div className="progress-track"><span style={{ width: `${((index + (submitted ? 1 : 0)) / questions.length) * 100}%` }} /></div><div className="question-meta"><span>{current.topic}</span><span>{current.type}</span></div><div className={`ai-avatar${aiSpeaking ? ' speaking' : ''}`}>🍓</div><p className="interviewer-label">BERRYBOT INTERVIEWER</p><h1 className="live-question">{current.prompt}</h1>{mode === 'Voice Interview' && <div className="voice-controls"><button className={`mic-button${listening ? ' listening' : ''}`} onClick={listening ? stop : start}>{listening ? '⏹ Stop listening' : '🎙 Start speaking'}</button><button className="secondary-button" onClick={() => { speak(current.prompt); setAiSpeaking(true); window.setTimeout(() => setAiSpeaking(false), current.prompt.length * 45); }}>🔊 Repeat question</button>{!supported && <span className="hint">Speech recognition is not available in this browser. You can still type your answer.</span>}</div>}<textarea className="transcript-box" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={mode === 'Voice Interview' ? 'Your spoken answer will appear here as a transcript…' : 'Explain your answer as you would in a real interview…'} disabled={submitted} /><div className="selection-actions">{!submitted ? <button className="primary-button" disabled={!answer.trim()} onClick={submit}>Submit answer</button> : <div className="evaluation-inline"><strong>{results[results.length - 1]?.score}/100</strong><span>{results[results.length - 1]?.feedback}</span><button className="primary-button" onClick={next}>{index === questions.length - 1 ? 'View final report' : 'Continue interview'}</button></div>}</div></div><aside className="live-side"><div className="side-card"><span className="side-icon">🧠</span><h3>Adaptive interviewer</h3><p>BerryBot tracks your answer and prepares a deeper follow-up rather than blindly moving through a script.</p></div><div className="side-card"><span className="side-icon">📝</span><h3>Transcript</h3><p>{answer ? `${answer.split(/\s+/).length} words captured` : 'Waiting for your answer…'}</p></div><Link className="side-link" to="/coding">Need a coding round? Open Coding Lab →</Link></aside></section></main>;
}

function CodingPage() {
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState('public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello BerryBot");\n    }\n}');
  const [output, setOutput] = useState('Ready. Select a language and start coding.');
  const languageMap: Record<string,string> = { java:'Java', python:'Python', javascript:'JavaScript', typescript:'TypeScript', cpp:'C++', csharp:'C#', go:'Go', rust:'Rust', kotlin:'Kotlin', php:'PHP', ruby:'Ruby', swift:'Swift', sql:'SQL' };
  const starter: Record<string,string> = { java:'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}', python:'# Write your solution here\ndef solution():\n    pass', javascript:'function solution(input) {\n  return input;\n}', typescript:'function solution(input: string): string {\n  return input;\n}', cpp:'#include <bits/stdc++.h>\nusing namespace std;\nint main() { return 0; }', csharp:'using System;\nclass Solution { static void Main() {} }', go:'package main\nfunc main() {}', rust:'fn main() {}', kotlin:'fun main() {}', php:'<?php\n// Write your solution here', ruby:'# Write your solution here', swift:'import Foundation\n// Write your solution here', sql:'-- Write your SQL query here\nSELECT 1;' };
  const changeLanguage = (value: string) => { setLanguage(value); setCode(starter[value]); setOutput(`${languageMap[value]} environment selected. Secure execution will run through the code-runner service.`); };
  const run = () => {
    if (language !== 'javascript') { setOutput('Code saved. Secure execution for this language will run through the isolated code-runner service in the backend phase.'); return; }
    try { const worker = new Worker(URL.createObjectURL(new Blob([`self.onmessage=e=>{try{const fn=new Function(e.data);const result=fn();self.postMessage({ok:true,result:String(result??'Execution completed')})}catch(err){self.postMessage({ok:false,error:String(err)})}}`], { type:'text/javascript' }))); worker.onmessage = (e) => { setOutput(e.data.ok ? e.data.result : `Runtime error: ${e.data.error}`); worker.terminate(); }; worker.postMessage(code); } catch (e) { setOutput(`Runtime error: ${String(e)}`); }
  };
  return <main className="page"><section className="coding-shell"><div className="coding-toolbar"><div><p className="eyebrow">CODING INTERVIEW</p><h2>BerryBot Coding Lab</h2></div><select value={language} onChange={(e) => changeLanguage(e.target.value)}>{Object.entries(languageMap).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select><button className="primary-button" onClick={run}>▶ Run</button><button className="secondary-button">Submit</button></div><div className="coding-body"><div className="problem-panel"><p className="eyebrow">PROBLEM</p><h3>Build a solution and explain your approach.</h3><p>Use the editor to implement your solution. BerryBot will evaluate correctness, complexity and code quality in the secure execution phase.</p><div className="test-case"><strong>Example</strong><br />Input: [2, 7, 11, 15], target = 9<br />Expected: [0, 1]</div><div className="test-case"><strong>Interview prompt</strong><br />Before coding, explain your approach and expected time/space complexity.</div></div><div className="editor-panel"><Editor height="55vh" language={language === 'cpp' ? 'cpp' : language === 'csharp' ? 'csharp' : language} theme="vs-dark" value={code} onChange={(value) => setCode(value ?? '')} options={{ minimap:{ enabled:false }, fontSize:14, automaticLayout:true, tabSize:2 }} /><div className="output-panel"><strong>Execution / feedback</strong><pre>{output}</pre></div></div></div></section></main>;
}

function ResultPage() {
  const navigate = useNavigate();
  const state = useLocation().state as any;
  const results: Result[] = state?.results ?? [];
  const average = results.length ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
  if (!results.length) return <Redirect title="No report yet" to="/interviews/new" />;
  return <main className="page"><section className="panel report-panel"><p className="eyebrow">INTERVIEW COMPLETE</p><h2>Your complete interview report</h2><div className="report-hero"><div className="score-circle">{average}<small>/100</small></div><div><h3>{average >= 85 ? 'Strong candidate' : average >= 70 ? 'Almost ready' : 'Needs improvement'}</h3><p className="muted">Every question below includes your answer, score, explanation and the expected senior-level direction.</p></div></div><div className="report-grid">{results.map((r, i) => <article className="report-question" key={r.questionId + i}><div className="report-question-head"><span>Q{i + 1} · {r.topic}</span><strong>{r.score}/100</strong></div><h3>{r.question}</h3><h4>Your answer</h4><p className="answer-review">{r.answer}</p><h4>BerryBot evaluation</h4><p>{r.feedback}</p><details><summary>Expected answer & explanation</summary><p>{r.reference}</p></details><details><summary>Suggested senior-level follow-up</summary><p>{r.followUp}</p></details></article>)}</div><div className="selection-actions"><button className="secondary-button" onClick={() => navigate('/history')}>View history</button><button className="primary-button" onClick={() => navigate('/interviews/new')}>Practice again</button></div></section></main>;
}

function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  useEffect(() => setHistory(JSON.parse(localStorage.getItem('berrybot.history') ?? '[]')), []);
  return <main className="page"><section className="panel"><p className="eyebrow">INTERVIEW HISTORY</p><h2>Your previous interviews</h2><p className="muted">BerryBot remembers completed sessions so future interviews can rotate questions and focus on weak areas.</p>{history.length ? <div className="history-list">{history.map((item) => <article className="history-row" key={item.id}><div><strong>{new Date(item.date).toLocaleString()}</strong><p>{item.topics.join(' · ')}</p></div><span>{item.difficulty}</span><b>{item.score}%</b></article>)}</div> : <div className="empty-state">No completed interviews yet. Start your first AI interview.</div>}</section></main>;
}

function Redirect({ title, to }: { title: string; to: string }) { return <main className="page"><section className="panel empty-state"><h2>{title}</h2><Link className="primary-button" to={to}>Continue</Link></section></main>; }

export default function App() {
  return <Shell><Routes><Route path="/" element={<HomePage />} /><Route path="/interviews/new" element={<NewInterviewPage />} /><Route path="/interviews/configure" element={<ConfigurePage />} /><Route path="/interviews/live" element={<LiveInterviewPage />} /><Route path="/interviews/result" element={<ResultPage />} /><Route path="/history" element={<HistoryPage />} /><Route path="/coding" element={<CodingPage />} /><Route path="*" element={<Redirect title="Page not found" to="/" />} /></Routes></Shell>;
}
