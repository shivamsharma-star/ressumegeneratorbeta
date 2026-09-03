'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TemplateSelector from './TemplateSelector';
import Preview from './Preview';
import { defaultResumeData } from '@/lib/types';

const resumeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  email: z.string().email('Invalid email address'),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  careerObjective: z.string().optional(),
  professionalQualifications: z.string().optional(),
  educationalQualifications: z.string().optional(),
  technicalSkill: z.string().optional(),
  title1: z.string().optional(),
  description1: z.string().optional(),
  role1: z.string().optional(),
  duration1: z.string().optional(),
  title2: z.string().optional(),
  description2: z.string().optional(),
  role2: z.string().optional(),
  duration2: z.string().optional(),
  coCurricularActivities: z.string().optional(),
  reward: z.string().optional(),
  certifications: z.string().optional(),
  strengths: z.string().optional(),
  areasOfImprovement: z.string().optional(),
  hobbies: z.string().optional(),
  areaOfInterest: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.string().optional(),
  language: z.string().optional(),
  motherTongue: z.string().optional(),
  fatherName: z.string().optional(),
  passwortDetails: z.string().optional(),
  permanentAddress: z.string().optional(),
  reference: z.string().optional(),
  declaration: z.string().optional(),
  currentDate: z.string().optional(),
  place: z.string().optional(),
});

export default function ResumeForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [documentType, setDocumentType] = useState('word');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const { register, handleSubmit, formState: { errors }, getValues, watch } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: defaultResumeData,
  });

  const formData = watch();

  const onSubmit = async (data) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, type: documentType }),
      });

      if (!response.ok) throw new Error('Failed to generate document');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = documentType === 'word' ? 'docx' : 'html';
      a.download = `${data.name.replace(/\s+/g, '_')}_Resume.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = () => {
    const data = getValues();
    setPreviewData(data);
    setShowPreview(true);
  };

  const renderField = (label, name, placeholder = '', type = 'text') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {type === 'textarea' ? (
        <textarea
          {...register(name)}
          placeholder={placeholder}
          className="form-textarea"
          rows="3"
        />
      ) : (
        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          className="form-input"
        />
      )}
      {errors[name] && (
        <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {errors[name].message}
        </p>
      )}
    </div>
  );

  const renderEntry = (fields, title, addButtonText, fieldsConfig) => {
    // Simplified version - you can expand as needed
    return (
      <div className="card">
        <div className="section-title">{title}</div>
        {fields.map((field, index) => (
          <div key={field.id} className="entry-card">
            <div className="entry-header">
              <h4 style={{ fontWeight: '600', color: '#4b5563' }}>Entry {index + 1}</h4>
              <button
                type="button"
                className="btn btn-danger"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
              >
                Remove
              </button>
            </div>
            <div className="grid-2">
              {fieldsConfig.map((config) => (
                <div key={config.name}>
                  <label className="form-label">{config.label}</label>
                  <input
                    {...register(`${title.toLowerCase()}.${index}.${config.name}`)}
                    placeholder={config.placeholder}
                    className="form-input"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary" style={{ width: '100%' }}>
          + {addButtonText}
        </button>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="card">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0.5rem' }}>
          📄 Resume Builder
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280' }}>
          Fill in your details and download your professional resume
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Template Selector */}
        <TemplateSelector />

        {/* Personal Information */}
        <div className="card">
          <h2 className="section-title">Personal Information</h2>
          <div className="grid-2">
            {renderField('Full Name *', 'name', 'Rahul Sharma')}
            {renderField('Address *', 'address', '123, Main Street, City')}
            {renderField('Mobile Number *', 'mobile', '+91 98765 43210')}
            {renderField('Email *', 'email', 'rahul@example.com', 'email')}
            {renderField('GitHub Profile', 'github', 'https://github.com/username')}
            {renderField('LinkedIn Profile', 'linkedin', 'https://linkedin.com/in/username')}
          </div>
        </div>

        {/* Career Objective */}
        <div className="card">
          <h2 className="section-title">Career Objective</h2>
          {renderField('Career Objective', 'careerObjective', 'Seeking a challenging position...', 'textarea')}
        </div>

        {/* Academic Record */}
        <div className="card">
          <h2 className="section-title">Academic Record</h2>
          {renderField('Professional Qualifications', 'professionalQualifications', 'B.Tech, MBA etc.', 'textarea')}
          {renderField('Educational Qualifications', 'educationalQualifications', '10th, 12th, Graduation details', 'textarea')}
          {renderField('Technical Skills', 'technicalSkill', 'Java, Python, React, etc.', 'textarea')}
        </div>

        {/* Projects */}
        <div className="card">
          <h2 className="section-title">Projects</h2>
          <div className="grid-2">
            {renderField('Project 1 - Title', 'title1', 'Resume Builder')}
            {renderField('Project 1 - Description', 'description1', 'Brief description', 'textarea')}
            {renderField('Project 1 - Role', 'role1', 'Developer')}
            {renderField('Project 1 - Duration', 'duration1', 'Jan 2024 - Mar 2024')}
          </div>
          <hr className="section-divider" />
          <div className="grid-2">
            {renderField('Project 2 - Title', 'title2', 'E-commerce Website')}
            {renderField('Project 2 - Description', 'description2', 'Brief description', 'textarea')}
            {renderField('Project 2 - Role', 'role2', 'Lead Developer')}
            {renderField('Project 2 - Duration', 'duration2', 'Apr 2024 - Jun 2024')}
          </div>
        </div>

        {/* Activities */}
        <div className="card">
          <h2 className="section-title">Activities & Achievements</h2>
          {renderField('Co-curricular Activities', 'coCurricularActivities', 'Debate club, Sports, etc.', 'textarea')}
          {renderField('Reward & Accolades', 'reward', 'Best Employee, Academic Excellence', 'textarea')}
          {renderField('Certifications', 'certifications', 'AWS Certified, Google IT Support', 'textarea')}
        </div>

        {/* Personal Attributes */}
        <div className="card">
          <h2 className="section-title">Personal Attributes</h2>
          <div className="grid-2">
            {renderField('Strengths', 'strengths', 'Team player, Quick learner')}
            {renderField('Areas of Improvement', 'areasOfImprovement', 'Public speaking, Time management')}
            {renderField('Hobbies', 'hobbies', 'Reading, Photography')}
            {renderField('Areas of Interest', 'areaOfInterest', 'AI/ML, Cloud Computing')}
          </div>
        </div>

        {/* Personal Details */}
        <div className="card">
          <h2 className="section-title">Personal Details</h2>
          <div className="grid-2">
            {renderField('Date of Birth', 'dateOfBirth', '01/01/1990')}
            {renderField('Gender', 'gender', 'Male/Female/Other')}
            {renderField('Nationality', 'nationality', 'Indian')}
            {renderField('Marital Status', 'maritalStatus', 'Single/Married')}
            {renderField('Languages Known', 'language', 'English, Hindi')}
            {renderField('Mother Tongue', 'motherTongue', 'Hindi')}
            {renderField("Father's Name", 'fatherName', 'Mr. XYZ')}
            {renderField('Passport Details', 'passwortDetails', 'Passport Number, Issue Date')}
            {renderField('Permanent Address', 'permanentAddress', 'Full address', 'textarea')}
          </div>
        </div>

        {/* References */}
        <div className="card">
          <h2 className="section-title">References & Declaration</h2>
          {renderField('References', 'reference', 'Contact details of references', 'textarea')}
          {renderField('Declaration', 'declaration', 'I hereby declare...', 'textarea')}
          <div className="grid-2">
            {renderField('Date', 'currentDate', new Date().toLocaleDateString('en-IN'))}
            {renderField('Place', 'place', 'City, State')}
          </div>
        </div>

        {/* Actions */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                value="word"
                checked={documentType === 'word'}
                onChange={() => setDocumentType('word')}
              />
              <span>Word (.docx)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                value="pdf"
                checked={documentType === 'pdf'}
                onChange={() => setDocumentType('pdf')}
              />
              <span>PDF</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handlePreview}
              className="btn btn-secondary"
            >
              👁️ Preview
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="btn btn-primary"
            >
              {isGenerating ? 'Generating...' : `📥 Download ${documentType === 'word' ? 'Word' : 'PDF'}`}
            </button>
          </div>
        </div>
      </form>

      <Preview isOpen={showPreview} onClose={() => setShowPreview(false)} data={previewData} />
    </div>
  );
}