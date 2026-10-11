import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import Percent from '../../components/Percent.jsx';

export default function StudentDashboard() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/student/summary').then(setSummary).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    api.get(`/student/history${filter ? `?subjectId=${filter}` : ''}`)
      .then(setHistory).catch((e) => setError(e.message));
  }, [filter]);

  if (error) return <div className="alert error">{error}</div>;
  if (!summary) return <p className="muted">Loading…</p>;

  const ok = summary.total === 0 || summary.percentage >= 75;
  const risky = summary.subjects.filter((s) => s.total > 0 && s.percentage < 75);

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{summary.name}</h1>
          <p className="muted">{summary.rollNo} · {summary.department}, semester {summary.semester}</p>
        </div>
      </header>

      <section className={`standing ${ok ? 'ok' : 'low'}`}>
        <div className="standing-num">{summary.total === 0 ? '–' : `${summary.percentage.toFixed(1)}%`}</div>
        <p>
          {summary.total === 0
            ? 'No classes have been recorded for you yet.'
            : `You attended ${summary.present} of ${summary.total} classes. ${
                ok ? 'You are above the 75% requirement.'
                   : 'You are below the 75% requirement.'}`}
          {risky.length > 0 && ` Check ${risky.map((s) => s.code).join(', ')}.`}
        </p>
      </section>

      <section className="panel">
        <h2>By subject</h2>
        <div className="table-wrap flat">
          <table>
            <thead><tr><th>Code</th><th>Subject</th><th>Attended</th><th>Percentage</th></tr></thead>
            <tbody>
              {summary.subjects.length === 0 && <tr><td colSpan="4" className="empty">No subjects are set up for your class yet.</td></tr>}
              {summary.subjects.map((s) => (
                <tr key={s.subjectId}>
                  <td>{s.code}</td><td>{s.name}</td>
                  <td>{s.total === 0 ? 'No classes yet' : `${s.present} of ${s.total}`}</td>
                  <td><Percent value={s.percentage} total={s.total} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>History</h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by subject">
            <option value="">All subjects</option>
            {summary.subjects.map((s) => <option key={s.subjectId} value={s.subjectId}>{s.code}</option>)}
          </select>
        </div>
        <div className="table-wrap flat">
          <table>
            <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
            <tbody>
              {history.length === 0 && <tr><td colSpan="3" className="empty">Nothing recorded yet.</td></tr>}
              {history.map((h, i) => (
                <tr key={i}>
                  <td>{new Date(h.date + 'T00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>{h.subjectCode} · {h.subjectName}</td>
                  <td><span className={`chip ${h.status === 'PRESENT' ? 'p' : 'a'}`}>{h.status === 'PRESENT' ? 'Present' : 'Absent'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
