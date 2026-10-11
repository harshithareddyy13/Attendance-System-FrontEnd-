import CrudPage from '../../components/CrudPage.jsx';

export default function Faculty() {
  return (
    <CrudPage
      title="Faculty"
      singular="faculty member"
      path="/admin/faculty"
      intro="Faculty can take attendance for the subjects assigned to them."
      defaults={{ username: '', name: '', email: '', department: '', password: '' }}
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'username', label: 'Username' },
        { key: 'department', label: 'Department' },
        { key: 'email', label: 'Email' },
      ]}
      fields={[
        { name: 'username', label: 'Username', required: true, lockOnEdit: true },
        { name: 'name', label: 'Full name', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'department', label: 'Department', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true },
      ]}
    />
  );
}
