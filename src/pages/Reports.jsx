import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Percent from '../components/Percent.jsx';

export default function Reports({ mode }) {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState('');
  const [threshold, setThreshold] = useState(75);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(mode === 'admin' ? '/admin/subjects' : '/faculty/subjects')
      .then((s) => { setSubjects(s); setSelected(s.length ? String(s[0].id) : 'low'); })
      .catch((e) => setError(e.message));
  }, [mode]);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setError('');
    const url = selected === 'low'
      ? `/reports/low-attendance?threshold=${threshold}`
      : `/reports/subject/${selected}`;
    api.get(url).then(setRows).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [selected, threshold]);

  function downloadCsv() {
    const header = ['Roll no', 'Name', 'Subject', 'Classes held', 'Present', 'Percentage'];
    const lines = rows.map((r) => [r.rollNo, r.name, r.subjectCode, r.total, r.present, r.percentage]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = selected === 'low' ? 'low-attendance.csv' : `attendance-${selected}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Reports</h1>
          <p className="muted">Attendance percentage per student. Anything under 75% is flagged.</p>
        </div>
        <button className="btn" onClick={downloadCsv} disabled={rows.length === 0}>Download CSV</button>
      </header>

      <div className="toolbar">
        <label>
          <span>Show</span>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}
            <option value="low">Students below a threshold</option>
          </select>
        </label>
        {selected === 'low' && (
          <label>
            <span>Threshold (%)</span>
            <input type="number" min="1" max="100" value={threshold}
                   onChange={(e) => setThreshold(Number(e.target.value) || 75)} />
          </label>
        )}
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Roll no.</th><th>Name</th><th>Subject</th><th>Attended</th><th>Percentage</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="5" className="empty">Loading…</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td colSpan="5" className="empty">
                {selected === 'low' ? 'No students are below this threshold.' : 'No students in this class yet.'}
              </td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.studentId + r.subjectCode}>
                <td>{r.rollNo}</td>
                <td>{r.name}</td>
                <td>{r.subjectCode}</td>
                <td>{r.total === 0 ? 'No classes yet' : `${r.present} of ${r.total}`}</td>
                <td><Percent value={r.percentage} total={r.total} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
