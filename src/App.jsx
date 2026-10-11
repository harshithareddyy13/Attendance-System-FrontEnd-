import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth, homeFor } from './AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import Students from './pages/admin/Students.jsx';
import Faculty from './pages/admin/Faculty.jsx';
import Subjects from './pages/admin/Subjects.jsx';
import MarkAttendance from './pages/faculty/MarkAttendance.jsx';
import Reports from './pages/Reports.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';

function Protected({ roles, children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (!roles.includes(auth.role)) return <Navigate to={homeFor(auth.role)} replace />;
  return children;
}

function Home() {
  const { auth } = useAuth();
  return <Navigate to={auth ? homeFor(auth.role) : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/admin" element={<Protected roles={['ADMIN']}><Layout /></Protected>}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="faculty" element={<Faculty />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="reports" element={<Reports mode="admin" />} />
      </Route>

      <Route path="/faculty" element={<Protected roles={['FACULTY']}><Layout /></Protected>}>
        <Route index element={<MarkAttendance />} />
        <Route path="reports" element={<Reports mode="faculty" />} />
      </Route>

      <Route path="/student" element={<Protected roles={['STUDENT']}><Layout /></Protected>}>
        <Route index element={<StudentDashboard />} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
