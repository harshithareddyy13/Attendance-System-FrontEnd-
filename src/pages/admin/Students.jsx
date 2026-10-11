import CrudPage from '../../components/CrudPage.jsx';

export default function Students() {
  return (
    <CrudPage
      title="Students"
      singular="student"
      path="/admin/students"
      intro="A student signs in with their roll number. Students are grouped into classes by department and semester."
      defaults={{ rollNo: '', name: '', email: '', department: '', semester: '', password: '' }}
      columns={[
        { key: 'rollNo', label: 'Roll no.' },
        { key: 'name', label: 'Name' },
        { key: 'department', label: 'Department' },
        { key: 'semester', label: 'Semester' },
        { key: 'email', label: 'Email' },
      ]}
      fields={[
        { name: 'rollNo', label: 'Roll number', required: true, lockOnEdit: true },
        { name: 'name', label: 'Full name', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'department', label: 'Department', required: true, placeholder: 'e.g. CSE' },
        { name: 'semester', label: 'Semester', type: 'number', required: true },
        { name: 'password', label: 'Password', type: 'password', placeholder: 'Defaults to the roll number' },
      ]}
    />
  );
}
