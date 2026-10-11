import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [low, setLow] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/reports/low-attendance?threshold=75')])
      .then(([s, l]) => { setStats(s); setLow(l); })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Overview</h1>
          <p className="muted">Everything in the register at a glance.</p>
        </div>
      </header>
      {error && <div className="alert error">{error}</div>}

      {stats && (
        <dl className="ledger">
          <div><dt>Students</dt><dd>{stats.students}</dd></div>
          <div><dt>Faculty</dt><dd>{stats.faculty}</dd></div>
          <div><dt>Subjects</dt><dd>{stats.subjects}</dd></div>
          <div><dt>Attendance entries</dt><dd>{stats.attendanceRecords}</dd></div>
        </dl>
      )}

      <section className="panel">
        <h2>Students below 75%</h2>
        {low.length === 0 ? (
          <p className="muted">No one is below the requirement right now.</p>
        ) : (
          <div className="table-wrap flat">
            <table>
              <thead><tr><th>Roll no.</th><th>Name</th><th>Subject</th><th>Attended</th><th>%</th></tr></thead>
              <tbody>
                {low.slice(0, 8).map((r) => (
                  <tr key={r.studentId + r.subjectCode}>
                    <td>{r.rollNo}</td><td>{r.name}</td><td>{r.subjectCode}</td>
                    <td>{r.present} of {r.total}</td>
                    <td className="low-text">{r.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {low.length > 8 && <p className="muted">Showing 8 of {low.length}. <Link to="/admin/reports">See all in Reports</Link></p>}
      </section>
    </>
  );
}
