import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../AuthContext.jsx';

const DEMO = [
  { role: 'Admin', user: 'admin', pass: 'admin123' },
  { role: 'Faculty', user: 'faculty1', pass: 'faculty123' },
  { role: 'Student', user: '21CSE001', pass: '21CSE001' },
];

export default function Login() {
  const { auth, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (auth) return <Navigate to={homeFor(auth.role)} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await login(username, password);
      navigate(homeFor(data.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <section className="login-art">
        <h1>Roll call,<br />without the paper.</h1>
        <p>Faculty mark attendance in one pass. Students see where they stand before it becomes a problem.</p>
        <div className="ticks" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className={[3, 7, 12].includes(i) ? 'absent' : 'present'} />
          ))}
        </div>
      </section>

      <section className="login-form">
        <form onSubmit={submit}>
          <h2>Sign in</h2>
          {error && <div className="alert error">{error}</div>}
          <label>
            <span>Username or roll number</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button className="btn primary wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>

          <div className="demo">
            <p className="muted">Demo accounts (click to fill)</p>
            {DEMO.map((d) => (
              <button type="button" key={d.role} className="link"
                      onClick={() => { setUsername(d.user); setPassword(d.pass); }}>
                {d.role}: {d.user}
              </button>
            ))}
          </div>
        </form>
      </section>
    </div>
  );
}
