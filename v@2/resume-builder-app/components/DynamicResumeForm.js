'use client';

import { useState } from 'react';

export default function DynamicResumeForm({ templateId, templateName, variables }) {
  const [formData, setFormData] = useState(() => {
    const initial = {};
    variables.forEach((v) => {
      initial[v.name] = '';
    });
    return initial;
  });
  const [loading, setLoading] = useState(null); // 'docx' | 'pdf' | null
  const [error, setError] = useState('');

  const update = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  async function handleDownload(format) {
    setError('');
    setLoading(format);
    try {
      const res = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, data: formData, format }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName =
        (formData.name || templateName || 'resume').replace(/[^a-zA-Z0-9_-]+/g, '_') || 'resume';
      a.href = url;
      a.download = `${safeName}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Something went wrong while generating the file.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <form className="resume-form" onSubmit={(e) => e.preventDefault()}>
      <section>
        <h2>{templateName}</h2>

        {variables.map((v) => (
          <div className="field" key={v.name}>
            <label htmlFor={v.name}>
              {v.name}
              {v.type === 'image' ? ' (photo URL)' : ''}
            </label>
            <input
              id={v.name}
              name={v.name}
              type="text"
              placeholder={v.type === 'image' ? 'https://example.com/photo.jpg' : ''}
              value={formData[v.name] ?? ''}
              onChange={(e) => update(v.name, e.target.value)}
            />
            {v.type === 'image' && formData[v.name] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData[v.name]}
                alt="Preview"
                className="photo-preview"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = 'block';
                }}
              />
            )}
          </div>
        ))}
      </section>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button type="button" disabled={loading !== null} onClick={() => handleDownload('docx')}>
          {loading === 'docx' ? 'Generating...' : 'Download Word (.docx)'}
        </button>
        <button type="button" disabled={loading !== null} onClick={() => handleDownload('pdf')}>
          {loading === 'pdf' ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
    </form>
  );
}
