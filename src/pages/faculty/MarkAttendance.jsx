import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api.js';

const today = () => new Date().toLocaleDateString('en-CA'); // yyyy-mm-dd in local time

export default function MarkAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState({}); // studentId -> PRESENT | ABSENT
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api.get('/faculty/subjects')
      .then((s) => { setSubjects(s); if (s.length) setSubjectId(String(s[0].id)); })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!subjectId || !date) return;
    setLoading(true);
    setNotice('');
    setError('');
    api.get(`/faculty/subjects/${subjectId}/sheet?date=${date}`)
      .then((list) => {
        setRows(list);
        setAlreadyTaken(list.some((r) => r.status));
        // Fresh sheet: everyone starts present, so only absentees need a tap.
        setStatus(Object.fromEntries(list.map((r) => [r.studentId, r.status || 'PRESENT'])));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [subjectId, date]);

  const counts = useMemo(() => {
    const vals = Object.values(status);
    return { present: vals.filter((v) => v === 'PRESENT').length, absent: vals.filter((v) => v === 'ABSENT').length };
  }, [status]);

  const setAll = (v) => setStatus(Object.fromEntries(rows.map((r) => [r.studentId, v])));

  async function save() {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const records = rows.map((r) => ({ studentId: r.studentId, status: status[r.studentId] }));
      const res = await api.post('/faculty/attendance', { subjectId: Number(subjectId), date, records });
      setAlreadyTaken(true);
      setNotice(`Saved attendance for ${res.saved} students.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const current = subjects.find((s) => String(s.id) === subjectId);

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Take attendance</h1>
          <p className="muted">Everyone starts as present. Tap A for anyone who is absent, then save.</p>
        </div>
      </header>

      {subjects.length === 0 && !error && (
        <div className="alert">No subjects are assigned to you yet. Ask the administrator to assign one.</div>
      )}
      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert ok" role="status">{notice}</div>}

      {subjects.length > 0 && (
        <>
          <div className="toolbar">
            <label>
              <span>Subject</span>
              <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}
              </select>
            </label>
            <label>
              <span>Date</span>
              <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
            </label>
            {current && <p className="muted grow">{current.department}, semester {current.semester}{alreadyTaken ? ' · already taken, you are editing it' : ''}</p>}
          </div>

          <section className="sheet" aria-busy={loading}>
            <div className="sheet-head">
              <div className="tally">
                <b className="p">{counts.present}</b> present
                <b className="a">{counts.absent}</b> absent
              </div>
              <div>
                <button className="btn" onClick={() => setAll('PRESENT')}>Mark all present</button>
                <button className="btn" onClick={() => setAll('ABSENT')}>Mark all absent</button>
              </div>
            </div>

            {loading && <p className="empty">Loading class list…</p>}
            {!loading && rows.length === 0 && (
              <p className="empty">No students are enrolled in this class yet. Add students with the same department and semester.</p>
            )}

            <ul className="roll">
              {rows.map((r) => (
                <li key={r.studentId} className={status[r.studentId] === 'ABSENT' ? 'is-absent' : ''}>
                  <span className="roll-no">{r.rollNo}</span>
                  <span className="roll-name">{r.name}</span>
                  <div className="seg" role="group" aria-label={`Attendance for ${r.name}`}>
                    <button type="button" className={status[r.studentId] === 'PRESENT' ? 'on p' : ''}
                            aria-pressed={status[r.studentId] === 'PRESENT'}
                            onClick={() => setStatus({ ...status, [r.studentId]: 'PRESENT' })}>P</button>
                    <button type="button" className={status[r.studentId] === 'ABSENT' ? 'on a' : ''}
                            aria-pressed={status[r.studentId] === 'ABSENT'}
                            onClick={() => setStatus({ ...status, [r.studentId]: 'ABSENT' })}>A</button>
                  </div>
                </li>
              ))}
            </ul>

            {rows.length > 0 && (
              <div className="sheet-foot">
                <button className="btn primary" onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : alreadyTaken ? 'Update attendance' : 'Save attendance'}
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
