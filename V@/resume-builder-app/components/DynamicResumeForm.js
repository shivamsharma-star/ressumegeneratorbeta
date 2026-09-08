'use client';

import { useState, useEffect } from 'react';

export default function DynamicResumeForm({ templateId, templateName, variables }) {
  const [formData, setFormData] = useState(() => {
    const initial = {};
    variables.forEach((v) => {
      initial[v.name] = '';
    });
    return initial;
  });
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const update = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  async function handleDownload(format) {
    setError('');
    setSuccess('');
    setLoading(format);
    
    try {
      const res = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, data: formData, format }),
      });

      if (!res.ok) {
        let errorMsg = `Request failed with status ${res.status}`;
        try {
          const errBody = await res.json();
          errorMsg = errBody.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = (formData.name || templateName || 'resume')
        .replace(/[^a-zA-Z0-9_-]+/g, '_') || 'resume';
      a.href = url;
      a.download = `${safeName}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess(`✅ ${format.toUpperCase()} downloaded successfully!`);
    } catch (err) {
      setError(err.message || 'Something went wrong while generating the file.');
    } finally {
      setLoading(null);
    }
  }

  // Auto-fill current date if variable exists
  useEffect(() => {
    if (variables.some(v => v.name === 'currentDate')) {
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setFormData(prev => ({ ...prev, currentDate: today }));
    }
  }, [variables]);

  return (
    <form className="resume-form" onSubmit={(e) => e.preventDefault()}>
      <section>
        <h2>{templateName}</h2>
        <p className="subtitle">Fill in your details below. All fields are required unless marked optional.</p>

        {variables.map((v) => (
          <div className="field" key={v.name}>
            <label htmlFor={v.name}>
              {v.name}
              {v.type === 'image' ? ' 📸 (image URL)' : ''}
              {v.name === 'currentDate' ? ' (auto-filled)' : ''}
            </label>
            <input
              id={v.name}
              name={v.name}
              type="text"
              placeholder={v.type === 'image' ? 'https://example.com/photo.jpg' : `Enter ${v.name}`}
              value={formData[v.name] ?? ''}
              onChange={(e) => update(v.name, e.target.value)}
              disabled={v.name === 'currentDate'}
              required={v.name !== 'currentDate'}
            />
            {v.type === 'image' && formData[v.name] && (
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

      {error && <p className="error">❌ {error}</p>}
      {success && <p className="status">{success}</p>}

      <div className="actions">
        <button 
          type="button" 
          disabled={loading !== null} 
          onClick={() => handleDownload('docx')}
        >
          {loading === 'docx' ? '⏳ Generating...' : '📄 Download Word (.docx)'}
        </button>
        <button 
          type="button" 
          disabled={loading !== null} 
          onClick={() => handleDownload('pdf')}
        >
          {loading === 'pdf' ? '⏳ Generating...' : '📑 Download PDF'}
        </button>
      </div>
    </form>
  );
}