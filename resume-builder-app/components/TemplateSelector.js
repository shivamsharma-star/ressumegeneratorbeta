'use client';

import { useState } from 'react';

const templates = [
  { id: 'professional', name: 'Professional', description: 'Clean and corporate' },
  { id: 'modern', name: 'Modern', description: 'Contemporary design' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
  { id: 'creative', name: 'Creative', description: 'Creative layout' },
];

export default function TemplateSelector() {
  const [selected, setSelected] = useState('professional');

  return (
    <div className="card">
      <h2 className="section-title">Select Template</h2>
      <div className="template-grid">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => setSelected(template.id)}
            className={`template-card ${selected === template.id ? 'active' : ''}`}
          >
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              {template.name}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {template.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}