import { useEffect, useState } from 'react';
import CrudPage from '../../components/CrudPage.jsx';
import { api } from '../../api.js';

export default function Subjects() {
  const [faculty, setFaculty] = useState(null);

  useEffect(() => {
    api.get('/admin/faculty').then(setFaculty).catch(() => setFaculty([]));
  }, []);

  if (!faculty) return <p className="muted">Loading…</p>;

  return (
    <CrudPage
      title="Subjects"
      singular="subject"
      path="/admin/subjects"
      intro="A subject is taken by every student in its department and semester."
      defaults={{ code: '', name: '', department: '', semester: '', facultyId: '' }}
      columns={[
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Subject' },
        { key: 'department', label: 'Department' },
        { key: 'semester', label: 'Semester' },
        { key: 'facultyName', label: 'Faculty', render: (r) => r.facultyName || <span className="muted">Unassigned</span> },
      ]}
      fields={[
        { name: 'code', label: 'Subject code', required: true, lockOnEdit: true },
        { name: 'name', label: 'Subject name', required: true },
        { name: 'department', label: 'Department', required: true },
        { name: 'semester', label: 'Semester', type: 'number', required: true },
        {
          name: 'facultyId', label: 'Faculty', type: 'select', emptyLabel: 'Unassigned',
          options: faculty.map((f) => ({ value: f.id, label: f.name })),
        },
      ]}
    />
  );
}
