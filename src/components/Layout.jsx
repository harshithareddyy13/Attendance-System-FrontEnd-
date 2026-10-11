import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

const NAV = {
  ADMIN: [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/faculty', label: 'Faculty' },
    { to: '/admin/subjects', label: 'Subjects' },
    { to: '/admin/reports', label: 'Reports' },
  ],
  FACULTY: [
    { to: '/faculty', label: 'Take attendance', end: true },
    { to: '/faculty/reports', label: 'Reports' },
  ],
  STUDENT: [{ to: '/student', label: 'My attendance', end: true }],
};

export default function Layout() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">Attendance<br />Register</div>
        <nav>
          {NAV[auth.role].map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>
          ))}
        </nav>
        <div className="who">
          <strong>{auth.fullName}</strong>
          <span>{auth.role.charAt(0) + auth.role.slice(1).toLowerCase()}</span>
          <button className="link" onClick={() => { logout(); navigate('/login'); }}>Sign out</button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
