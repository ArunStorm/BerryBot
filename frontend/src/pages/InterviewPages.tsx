import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getInterviewReport, getInterviewSession, startInterview, submitInterviewAnswer, type AnswerResponse, type InterviewReport, type InterviewSession, type ReportItem } from '../services/interviewApi';

const TOPICS = ['Java', 'OOPS Concepts', 'Spring Boot', 'Microservices', 'Programming Round', 'React'] as const;
type Topic = (typeof TOPICS)[number];
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Mode = 'VOICE' | 'TEXT';

type HistoryItem = { id: string; date: string; topics: string[]; difficulty: string; score: number; answeredQuestions: number };

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
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) transcript += event.results[i][0].transcript;
      if (transcript.trim()) onTranscript(transcript.trim());
    };
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [onTranscript]);
  return { supported, listening, start: () => { try { recognitionRef.current?.start(); } catch {} }, stop: () => recognitionRef.current?.stop() };
}

export function HomePage() {
  return <main className="page"><section className="hero"><div><p className="eyebrow">AI MOCK INTERVIEW PLATFORM</p><h1>Interview like you are sitting across from a senior engineer.</h1><p className="hero-copy">Backend-powered interview sessions, voice interaction, adaptive feedback, coding challenges and persistent reports.</p><div className="hero-actions"><Link className="primary-button" to="/interviews/new">Start AI Interview</Link><Link className="secondary-button" to="/coding">Open Coding Lab</Link></div></div><div className="hero-console"><div className="console-top"><span>● LIVE INTERVIEW</span><span>BACKEND SESSION</span></div><div className="wave">••••••••••••••••••••</div><strong>“How would you prevent duplicate payments in a microservices architecture?”</strong><div className="console-answer">🎙 BerryBot is ready…</div></div></section><section className="feature-grid">{[['🎙️','Voice interviewer','BerryBot speaks questions and converts your spoken answer into a transcript.'],['🧠','Adaptive follow-ups','The backend returns feedback and the next question after every answer.'],['💻','Coding Lab','VS Code-style Monaco editor with multiple language modes.'],['📊','Persistent reports','Interview answers and scores are stored by the backend session.']].map(([icon,title,text]) => <article className="feature-card" key={title}><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</section></main>;
}

export function NewInterviewPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Topic[]>([]);
  return <main className="page"><section className="panel"><p className="eyebrow">NEW INTERVIEW</p><h2>Choose your interview topics</h2><p className="muted">Select one or more topics. The backend will build the session from the selected topics.</p><div className="selection-grid">{TOPICS.map(topic => { const active = selected.includes(topic); return <button type="button" className={`selection-card${active ? ' selected' : ''}`} key={topic} onClick={() => setSelected(s => active ? s.filter(x => x !== topic) : [...s, topic])}><span className="checkbox-mark">{active ? '✓' : ''}</span><span>{topic}</span></button>; })}</div><div className="selection-summary">{selected.length} topic{selected.length === 1 ? '' : 's'} selected</div><div className="selection-actions"><button className="secondary-button" disabled={!selected.length} onClick={() => setSelected([])}>Clear</button><button className="primary-button" disabled={!selected.length} onClick={() => navigate('/interviews/configure', { state: { topics: selected } })}>Continue</button></div></section></main>;
}

export function ConfigurePage() {
  const navigate = useNavigate();
  const topics = ((useLocation().state as any)?.topics ?? []) as Topic[];
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [mode, setMode] = useState<Mode>('VOICE');
  const [count, setCount] = useState(5);
  if (!topics.length) return <Redirect title="No topics selected" to="/interviews/new" />;
  const start = async () => { try { const session = await startInterview({ topics, difficulty, mode, questionCount: count }); navigate('/interviews/live', { state: { sessionId: session.sessionId, session } }); } catch (error: any) { window.alert(`Could not start interview: ${error?.response?.data?.message ?? error?.message ?? 'Backend unavailable'}`); } };
  return <main className="page"><section className="panel config-panel"><p className="eyebrow">INTERVIEW SETUP</p><h2>Configure your session</h2><div className="config-section"><h3>Topics</h3><div className="chip-list">{topics.map(t => <span className="chip" key={t}>{t}</span>)}</div></div><div className="config-section"><h3>Interview mode</h3><div className="option-row"><button className={`option-button${mode === 'VOICE' ? ' active' : ''}`} onClick={() => setMode('VOICE')}>🎙 Voice Interview</button><button className={`option-button${mode === 'TEXT' ? ' active' : ''}`} onClick={() => setMode('TEXT')}>⌨️ Text Interview</button></div><p className="hint">Voice mode uses browser speech synthesis and microphone recognition. The session itself is persisted by the backend.</p></div><div className="config-section"><h3>Difficulty</h3><div className="option-row">{(['Easy','Medium','Hard'] as Difficulty[]).map(x => <button className={`option-button${difficulty === x ? ' active' : ''}`} key={x} onClick={() => setDifficulty(x)}>{x}</button>)}</div></div><div className="config-section"><h3>Questions</h3><div className="option-row">{[3,5,8,12].map(n => <button className={`option-button${count === n ? ' active' : ''}`} key={n} onClick={() => setCount(n)}>{n}</button>)}</div><p className="hint">The backend accepts 3–12 questions.</p></div><div className="selection-actions"><button className="secondary-button" onClick={() => navigate('/interviews/new')}>Back</button><button className="primary-button" onClick={start}>Start Interview</button></div></section></main>;
}

export function LiveInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initial = (location.state as any)?.session as InterviewSession | undefined;
  const sessionId = (location.state as any)?.sessionId as string | undefined;
  const [session, setSession] = useState<InterviewSession | null>(initial ?? null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState<AnswerResponse | null>(null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const appendTranscript = useCallback((text: string) => setAnswer(old => old ? `${old} ${text}` : text), []);
  const { supported, listening, start, stop } = useSpeechRecognition(appendTranscript);

  useEffect(() => { if (!sessionId || session) return; getInterviewSession(sessionId).then(setSession).catch(e => setError(e?.response?.data?.message ?? 'Unable to load interview session.')).finally(() => setLoading(false)); }, [sessionId, session]);
  useEffect(() => { if (!session?.question || session.mode !== 'VOICE' || submitted) return; setAiSpeaking(true); speak(session.question.prompt); const timer = window.setTimeout(() => setAiSpeaking(false), Math.max(1800, session.question.prompt.length * 45)); return () => window.clearTimeout(timer); }, [session?.question?.questionId, session?.mode]);

  const submit = async () => {
    if (!session || !answer.trim() || submitted) return;
    setError(''); if (listening) stop(); setSubmitted(true);
    try { const result = await submitInterviewAnswer(session.sessionId, session.question.questionId, answer.trim()); setEvaluation(result); if (session.mode === 'VOICE') speak(result.score >= 75 ? 'Good answer. Let us continue.' : 'Good attempt. Review the feedback, then we will continue.'); }
    catch (e: any) { setSubmitted(false); setError(e?.response?.data?.message ?? e?.message ?? 'Unable to submit the answer.'); }
  };

  const next = async () => {
    if (!session || !evaluation) return;
    if (evaluation.interviewCompleted) { navigate('/interviews/result', { state: { sessionId: session.sessionId } }); return; }
    if (evaluation.nextQuestion) setSession(prev => prev ? { ...prev, currentQuestion: evaluation.nextQuestion!.position, question: evaluation.nextQuestion! } : prev);
    else setSession(await getInterviewSession(session.sessionId));
    setAnswer(''); setEvaluation(null); setSubmitted(false);
  };

  if (loading) return <main className="page"><section className="panel empty-state"><h2>Loading interview…</h2></section></main>;
  if (!session) return <Redirect title={error || 'Interview unavailable'} to="/interviews/new" />;
  return <main className="page"><section className="live-layout"><div className="interview-card"><div className="live-header"><div><p className="eyebrow">{session.mode === 'VOICE' ? '🎙 LIVE VOICE INTERVIEW' : 'LIVE INTERVIEW'}</p><h2>Question {session.currentQuestion} / {session.totalQuestions}</h2></div><span className="status-pill">{session.difficulty}</span></div><div className="progress-track"><span style={{ width: `${Math.min(100, ((session.currentQuestion - (submitted ? 0 : 1)) / session.totalQuestions) * 100)}%` }} /></div><div className="question-meta"><span>{session.question.topic}</span><span>{session.question.type}</span></div><div className={`ai-avatar${aiSpeaking ? ' speaking' : ''}`}>🍓</div><p className="interviewer-label">BERRYBOT INTERVIEWER</p><h1 className="live-question">{session.question.prompt}</h1>{session.mode === 'VOICE' && <div className="voice-controls"><button className={`mic-button${listening ? ' listening' : ''}`} onClick={listening ? stop : start}>{listening ? '⏹ Stop listening' : '🎙 Start speaking'}</button><button className="secondary-button" onClick={() => speak(session.question.prompt)}>🔊 Repeat question</button>{!supported && <span className="hint">Speech recognition is unavailable in this browser. Type your answer below.</span>}</div>}<textarea className="transcript-box" value={answer} onChange={e => setAnswer(e.target.value)} placeholder={session.mode === 'VOICE' ? 'Your spoken answer will appear here as a transcript…' : 'Explain your answer as you would in a real interview…'} disabled={submitted} />{error && <div className="error-banner">{error}</div>}<div className="selection-actions">{!submitted ? <button className="primary-button" disabled={!answer.trim()} onClick={submit}>Submit answer</button> : <div className="evaluation-inline"><strong>{evaluation?.score ?? '—'}/100</strong><span>{evaluation?.feedback ?? 'Answer submitted.'}</span><button className="primary-button" onClick={next}>{evaluation?.interviewCompleted ? 'View final report' : 'Continue interview'}</button></div>}</div></div><aside className="live-side"><div className="side-card"><span className="side-icon">🧠</span><h3>Backend session</h3><p>Session <code>{session.sessionId.slice(0, 8)}…</code> is persisted on the server.</p></div><div className="side-card"><span className="side-icon">📝</span><h3>Transcript</h3><p>{answer ? `${answer.trim().split(/\s+/).length} words captured` : 'Waiting for your answer…'}</p></div>{evaluation?.adaptiveFollowUp && <div className="side-card"><span className="side-icon">🔎</span><h3>Adaptive direction</h3><p>{evaluation.adaptiveFollowUp}</p></div>}<Link className="side-link" to="/coding">Need a coding round? Open Coding Lab →</Link></aside></section></main>;
}

export function ResultPage() {
  const navigate = useNavigate();
  const sessionId = (useLocation().state as any)?.sessionId as string | undefined;
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { if (!sessionId) return; getInterviewReport(sessionId).then(setReport).catch(e => setError(e?.response?.data?.message ?? 'Unable to load the final report.')); }, [sessionId]);
  if (!sessionId) return <Redirect title="No report session selected" to="/interviews/new" />;
  if (error) return <main className="page"><section className="panel empty-state"><h2>{error}</h2><button className="primary-button" onClick={() => window.location.reload()}>Retry</button></section></main>;
  if (!report) return <main className="page"><section className="panel empty-state"><h2>Loading your final report…</h2></section></main>;
  const old: HistoryItem[] = JSON.parse(localStorage.getItem('berrybot.history') ?? '[]');
  const historyEntry: HistoryItem = { id: report.sessionId, date: new Date().toISOString(), topics: [], difficulty: '', score: report.overallScore, answeredQuestions: report.answeredQuestions };
  if (!old.some(x => x.id === historyEntry.id)) localStorage.setItem('berrybot.history', JSON.stringify([historyEntry, ...old]));
  return <main className="page"><section className="panel report-panel"><p className="eyebrow">INTERVIEW COMPLETE</p><h2>Your complete interview report</h2><div className="report-hero"><div className="score-circle">{report.overallScore}<small>/100</small></div><div><h3>{report.overallScore >= 85 ? 'Strong candidate' : report.overallScore >= 70 ? 'Almost ready' : 'Needs improvement'}</h3><p className="muted">Backend evaluation is the source of truth for your interview score and answers.</p></div></div><div className="report-grid">{report.results.map((r,i) => <ReportCard result={r} index={i} key={`${r.questionId}-${i}`} />)}</div><div className="selection-actions"><button className="secondary-button" onClick={() => navigate('/history')}>View history</button><button className="primary-button" onClick={() => navigate('/interviews/new')}>Practice again</button></div></section></main>;
}

function ReportCard({ result, index }: { result: ReportItem; index: number }) { return <article className="report-question"><div className="report-question-head"><span>Q{index + 1} · {result.topic}</span><strong>{result.score}/100</strong></div><h3>{result.question}</h3><h4>Your answer</h4><p className="answer-review">{result.answer}</p><h4>BerryBot evaluation</h4><p>{result.feedback}</p>{result.adaptiveFollowUp && <details><summary>Suggested senior-level follow-up</summary><p>{result.adaptiveFollowUp}</p></details>}</article>; }

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  useEffect(() => setHistory(JSON.parse(localStorage.getItem('berrybot.history') ?? '[]')), []);
  return <main className="page"><section className="panel"><p className="eyebrow">INTERVIEW HISTORY</p><h2>Your previous interviews</h2><p className="muted">Completed sessions are persisted by the backend. This browser index provides quick access until a backend history-list endpoint is added.</p>{history.length ? <div className="history-list">{history.map(item => <article className="history-row" key={item.id}><div><strong>{new Date(item.date).toLocaleString()}</strong><p>{item.topics.length ? item.topics.join(' · ') : 'Backend interview session'}</p></div><span>{item.difficulty || 'Completed'}</span><b>{item.score}%</b><Link className="secondary-button" to="/interviews/result" state={{ sessionId: item.id }}>Report</Link></article>)}</div> : <div className="empty-state">No completed interviews yet. Start your first AI interview.</div>}</section></main>;
}

function Redirect({ title, to }: { title: string; to: string }) { return <main className="page"><section className="panel empty-state"><h2>{title}</h2><Link className="primary-button" to={to}>Continue</Link></section></main>; }
