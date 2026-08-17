import { Link, Route, Routes } from 'react-router-dom';
import { HomePage, NewInterviewPage, ConfigurePage, LiveInterviewPage, ResultPage, HistoryPage } from './pages/InterviewPages';
import { CodingPage } from './pages/CodingPage';

function Shell({ children }: { children: React.ReactNode }) {
  return <><header className="topbar"><Link to="/" className="brand-link">🍓 <strong>BerryBot</strong></Link><nav><Link to="/interviews/new">New Interview</Link><Link to="/history">History</Link><Link to="/coding">Coding Lab</Link></nav></header>{children}</>;
}

function Redirect({ title, to }: { title: string; to: string }) {
  return <main className="page"><section className="panel empty-state"><h2>{title}</h2><Link className="primary-button" to={to}>Continue</Link></section></main>;
}

export default function App() {
  return <Shell><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/interviews/new" element={<NewInterviewPage />} />
    <Route path="/interviews/configure" element={<ConfigurePage />} />
    <Route path="/interviews/live" element={<LiveInterviewPage />} />
    <Route path="/interviews/result" element={<ResultPage />} />
    <Route path="/history" element={<HistoryPage />} />
    <Route path="/coding" element={<CodingPage />} />
    <Route path="*" element={<Redirect title="Page not found" to="/" />} />
  </Routes></Shell>;
}
