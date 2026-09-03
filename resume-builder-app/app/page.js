'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '', address: '', mobile: '', email: '', github: '', linkedin: '',
    careerObjective: '', professionalQualifications: '', educationalQualifications: '',
    technicalSkill: '', title1: '', description1: '', role1: '', duration1: '',
    title2: '', description2: '', role2: '', duration2: '',
    coCurricularActivities: '', reward: '', certifications: '',
    strengths: '', areasOfImprovement: '', hobbies: '', areaOfInterest: '',
    dateOfBirth: '', gender: '', nationality: '', maritalStatus: '',
    language: '', motherTongue: '', fatherName: '', passwortDetails: '',
    permanentAddress: '', reference: '', declaration: '',
    currentDate: new Date().toLocaleDateString('en-IN'), place: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedData = localStorage.getItem('resumeFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('resumeFormData', JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const downloadResume = async (format) => {
    if (!formData.name || !formData.name.trim()) {
      setError('⚠️ Please fill Name field');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData, format }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.name.replace(/\s+/g, '_')}_Resume.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      setError('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', placeholder = '' }) => (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
        {label}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          rows="3"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold' }}>
        📄 Resume Builder
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Fill your details and download resume in Word or PDF format
      </p>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Personal Information */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>👤 Personal Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Full Name *" name="name" placeholder="Rahul Sharma" />
            <Field label="Address *" name="address" placeholder="123, Main Street" />
            <Field label="Mobile *" name="mobile" placeholder="+91 98765 43210" />
            <Field label="Email *" name="email" placeholder="rahul@gmail.com" />
            <Field label="GitHub" name="github" placeholder="https://github.com/username" />
            <Field label="LinkedIn" name="linkedin" placeholder="https://linkedin.com/in/username" />
          </div>
        </div>

        {/* Career Objective */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>🎯 Career Objective</h2>
          <Field label="Career Objective" name="careerObjective" type="textarea" placeholder="Seeking a challenging position..." />
        </div>

        {/* Academic Record */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>📚 Academic Record</h2>
          <Field label="Professional Qualifications" name="professionalQualifications" type="textarea" placeholder="B.Tech, MBA" />
          <Field label="Educational Qualifications" name="educationalQualifications" type="textarea" placeholder="10th, 12th, Graduation" />
          <Field label="Technical Skills" name="technicalSkill" type="textarea" placeholder="Java, Python, React" />
        </div>

        {/* Projects */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>💻 Projects</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Project 1 Title" name="title1" placeholder="Resume Builder" />
            <Field label="Project 1 Description" name="description1" type="textarea" placeholder="Brief description" />
            <Field label="Project 1 Role" name="role1" placeholder="Developer" />
            <Field label="Project 1 Duration" name="duration1" placeholder="Jan 2024 - Mar 2024" />
          </div>
          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Project 2 Title" name="title2" placeholder="E-commerce Website" />
            <Field label="Project 2 Description" name="description2" type="textarea" placeholder="Brief description" />
            <Field label="Project 2 Role" name="role2" placeholder="Lead Developer" />
            <Field label="Project 2 Duration" name="duration2" placeholder="Apr 2024 - Jun 2024" />
          </div>
        </div>

        {/* Activities */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>🏆 Activities & Achievements</h2>
          <Field label="Co-curricular Activities" name="coCurricularActivities" type="textarea" placeholder="Debate club, Sports" />
          <Field label="Reward & Accolades" name="reward" type="textarea" placeholder="Best Employee, Academic Excellence" />
          <Field label="Certifications" name="certifications" type="textarea" placeholder="AWS Certified, Google IT Support" />
        </div>

        {/* Personal Attributes */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>🧠 Personal Attributes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Strengths" name="strengths" placeholder="Team player, Quick learner" />
            <Field label="Areas of Improvement" name="areasOfImprovement" placeholder="Public speaking" />
            <Field label="Hobbies" name="hobbies" placeholder="Reading, Photography" />
            <Field label="Areas of Interest" name="areaOfInterest" placeholder="AI/ML, Cloud Computing" />
          </div>
        </div>

        {/* Personal Details */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>📋 Personal Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Date of Birth" name="dateOfBirth" placeholder="01/01/1990" />
            <Field label="Gender" name="gender" placeholder="Male/Female/Other" />
            <Field label="Nationality" name="nationality" placeholder="Indian" />
            <Field label="Marital Status" name="maritalStatus" placeholder="Single/Married" />
            <Field label="Languages Known" name="language" placeholder="English, Hindi" />
            <Field label="Mother Tongue" name="motherTongue" placeholder="Hindi" />
            <Field label="Father's Name" name="fatherName" placeholder="Mr. XYZ" />
            <Field label="Passport Details" name="passwortDetails" placeholder="Passport Number" />
            <Field label="Permanent Address" name="permanentAddress" type="textarea" placeholder="Full address" />
          </div>
        </div>

        {/* References */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>📝 References & Declaration</h2>
          <Field label="References" name="reference" type="textarea" placeholder="Contact details" />
          <Field label="Declaration" name="declaration" type="textarea" placeholder="I hereby declare..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Date" name="currentDate" />
            <Field label="Place" name="place" placeholder="City, State" />
          </div>
        </div>

        {/* Download Buttons */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => downloadResume('docx')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? '⏳ Generating...' : '📄 Download Word (.docx)'}
            </button>
            <button
              type="button"
              onClick={() => downloadResume('pdf')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? '⏳ Generating...' : '📑 Download PDF'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}