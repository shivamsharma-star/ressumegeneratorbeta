import AdminDashboard from '../../components/AdminDashboard';

export const metadata = { title: 'Admin — Resume Templates' };

export default function AdminPage() {
  return (
    <main className="page">
      <h1>Admin Dashboard</h1>
      <p className="subtitle">
        Upload a Word (.docx) template. Use <code>{'{{fieldName}}'}</code> for text fields (e.g.{' '}
        <code>{'{{name}}'}</code>, <code>{'{{email}}'}</code>) and <code>{'{%photo}'}</code> for a
        photo field.
      </p>
      <AdminDashboard />
    </main>
  );
}
