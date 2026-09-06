'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function loadTemplates() {
    try {
      const res = await fetch('/api/admin/templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    setError('');
    setStatus('');

    if (!file) {
      setError('Choose a .docx file first');
      return;
    }

    const body = new FormData();
    body.append('file', file);
    body.append('name', name || file.name);

    setUploading(true);
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'x-admin-token': token },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setStatus(`Uploaded "${data.template.name}"`);
      setName('');
      setFile(null);
      e.target.reset();
      loadTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      loadTemplates();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <section>
        <h2>Admin Token</h2>
        <div className="field">
          <label htmlFor="token">
            Admin token (set <code>ADMIN_TOKEN</code> in your .env — leave blank if unset)
          </label>
          <input
            id="token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
      </section>

      <section>
        <h2>Upload New Template</h2>
        <form onSubmit={handleUpload}>
          <div className="field">
            <label htmlFor="tname">Template name</label>
            <input
              id="tname"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. College Placement Resume"
            />
          </div>
          <div className="field">
            <label htmlFor="tfile">.docx file</label>
            <input
              id="tfile"
              type="file"
              accept=".docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {error && <p className="error">{error}</p>}
          {status && <p className="status">{status}</p>}

          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Template'}
          </button>
        </form>
      </section>

      <section>
        <h2>Existing Templates</h2>
        {templates.length === 0 && <p>No templates uploaded yet.</p>}
        <ul className="template-list">
          {templates.map((t) => (
            <li key={t.id}>
              <span>{t.name}</span>
              <button type="button" className="danger" onClick={() => handleDelete(t.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
