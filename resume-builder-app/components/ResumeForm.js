'use client';

import { useState } from 'react';
import { emptyResumeData, flattenForTemplate } from '../lib/types';

const TEXT_FIELDS = [
  { key: 'name', label: 'Full Name' },
  { key: 'Address', label: 'Address' },
  { key: 'Mobile', label: 'Mobile Number' },
  { key: 'email', label: 'Email' },
  { key: 'github', label: 'GitHub URL' },
  { key: 'linkedin', label: 'LinkedIn URL' },
];

const ACADEMIC_FIELDS = [
  { key: 'careerObjective', label: 'Career Objective', textarea: true },
  { key: 'ProfessionalQualifications', label: 'Professional Qualification', textarea: true },
  { key: 'educationalQualifications', label: 'Educational Qualifications', textarea: true },
  { key: 'technicalSkill', label: 'Technical Skills', textarea: true },
];

const OTHER_FIELDS = [
  { key: 'coCurricularActivities', label: 'Co-curricular Activities', textarea: true },
  { key: 'reward', label: 'Reward & Accolades', textarea: true },
  { key: 'certifications', label: 'Certifications', textarea: true },
  { key: 'strengths', label: 'Strengths' },
  { key: 'areasOfImprovement', label: 'Areas of Improvement' },
  { key: 'hobbies', label: 'Hobbies' },
  { key: 'areaOfInterest', label: 'Areas of Interest' },
];

const PERSONAL_FIELDS = [
  { key: 'dateOfBirth', label: 'Date of Birth' },
  { key: 'gender', label: 'Gender' },
  { key: 'nationality', label: 'Nationality' },
  { key: 'maritalStatus', label: 'Marital Status' },
  { key: 'language', label: 'Languages Known' },
  { key: 'motherTongue', label: 'Mother Tongue' },
  { key: 'fatherName', label: "Father's Name" },
  { key: 'passwortDetails', label: 'Passport Details' },
  { key: 'permanentAddress', label: 'Permanent Address' },
];

const FOOTER_FIELDS = [
  { key: 'reference', label: 'References', textarea: true },
  { key: 'declaration', label: 'Declaration', textarea: true },
  { key: 'currentDate', label: 'Date' },
  { key: 'place', label: 'Place' },
];

function Field({ field, value, onChange }) {
  const commonProps = {
    id: field.key,
    name: field.key,
    value: value ?? '',
    onChange: (e) => onChange(field.key, e.target.value),
  };
  return (
    <div className="field">
      <label htmlFor={field.key}>{field.label}</label>
      {field.textarea ? (
        <textarea rows={3} {...commonProps} />
      ) : (
        <input type="text" {...commonProps} />
      )}
    </div>
  );
}

function ProjectFields({ title, project, onChange }) {
  const update = (key, value) => onChange({ ...project, [key]: value });
  return (
    <fieldset className="project-fieldset">
      <legend>{title}</legend>
      <div className="field">
        <label>Title</label>
        <input
          type="text"
          value={project.title}
          onChange={(e) => update('title', e.target.value)}
        />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea
          rows={2}
          value={project.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </div>
      <div className="field">
        <label>Role</label>
        <input
          type="text"
          value={project.role}
          onChange={(e) => update('role', e.target.value)}
        />
      </div>
      <div className="field">
        <label>Duration</label>
        <input
          type="text"
          value={project.duration}
          onChange={(e) => update('duration', e.target.value)}
        />
      </div>
    </fieldset>
  );
}

export default function ResumeForm() {
  const [form, setForm] = useState(emptyResumeData());
  const [loading, setLoading] = useState(null); // 'docx' | 'pdf' | null
  const [error, setError] = useState('');

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setProject = (key) => (project) => setForm((prev) => ({ ...prev, [key]: project }));

  async function handleDownload(format) {
    setError('');
    setLoading(format);
    try {
      const payload = { data: flattenForTemplate(form), format };

      const res = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = (form.name || 'resume').replace(/[^a-zA-Z0-9_-]+/g, '_') || 'resume';
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
    <form
      className="resume-form"
      onSubmit={(e) => e.preventDefault()}
    >
      <section>
        <h2>Basic Details</h2>
        <div className="grid">
          {TEXT_FIELDS.map((f) => (
            <Field key={f.key} field={f} value={form[f.key]} onChange={setField} />
          ))}
        </div>
      </section>

      <section>
        <h2>Academic Record</h2>
        {ACADEMIC_FIELDS.map((f) => (
          <Field key={f.key} field={f} value={form[f.key]} onChange={setField} />
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        <ProjectFields title="Minor Project" project={form.project1} onChange={setProject('project1')} />
        <ProjectFields title="Other Project" project={form.project2} onChange={setProject('project2')} />
      </section>

      <section>
        <h2>Activities & Skills</h2>
        {OTHER_FIELDS.map((f) => (
          <Field key={f.key} field={f} value={form[f.key]} onChange={setField} />
        ))}
      </section>

      <section>
        <h2>Personal Details</h2>
        <div className="grid">
          {PERSONAL_FIELDS.map((f) => (
            <Field key={f.key} field={f} value={form[f.key]} onChange={setField} />
          ))}
        </div>
      </section>

      <section>
        <h2>References & Declaration</h2>
        {FOOTER_FIELDS.map((f) => (
          <Field key={f.key} field={f} value={form[f.key]} onChange={setField} />
        ))}
      </section>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => handleDownload('docx')}
        >
          {loading === 'docx' ? 'Generating...' : 'Download Word (.docx)'}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => handleDownload('pdf')}
        >
          {loading === 'pdf' ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
    </form>
  );
}
