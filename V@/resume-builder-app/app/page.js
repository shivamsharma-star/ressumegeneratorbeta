import Link from 'next/link';
import { listTemplates } from '../lib/templateStore';

export default function Home() {
  const templates = listTemplates();

  return (
    <main className="page">
      <h1>Resume Generator</h1>
      <p className="subtitle">Pick a template to fill in your details.</p>

      {templates.length === 0 && (
        <p>
          No templates yet. Ask an admin to upload one from the{' '}
          <Link href="/admin">Admin Dashboard</Link>.
        </p>
      )}

      <div className="template-grid">
        {templates.map((t) => (
          <Link key={t.id} href={`/generate/${t.id}`} className="template-card">
            <h3>{t.name}</h3>
            <span>Uploaded {new Date(t.uploadedAt).toLocaleDateString()}</span>
          </Link>
        ))}
      </div>

      <p className="admin-link">
        <Link href="/admin">Go to Admin Dashboard →</Link>
      </p>
    </main>
  );
}
