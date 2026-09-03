'use client';

export default function Preview({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Resume Preview</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div>
          {/* Personal Information */}
          <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.name}</h3>
            <p style={{ color: '#4b5563' }}>{data.address}</p>
            <p style={{ color: '#4b5563' }}>Mobile: {data.mobile} | Email: {data.email}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.875rem', color: '#2563eb' }}>
              {data.github && <span>GitHub: {data.github}</span>}
              {data.linkedin && <span>LinkedIn: {data.linkedin}</span>}
            </div>
          </div>

          {/* Career Objective */}
          {data.careerObjective && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontWeight: 'bold', color: '#374151' }}>Career Objective</h4>
              <p style={{ color: '#4b5563' }}>{data.careerObjective}</p>
            </div>
          )}

          {/* Academic Record */}
          {(data.professionalQualifications || data.educationalQualifications || data.technicalSkill) && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontWeight: 'bold', color: '#374151' }}>Academic Record</h4>
              {data.professionalQualifications && (
                <div style={{ marginLeft: '1rem' }}>
                  <span style={{ fontWeight: '500' }}>Professional Qualification:</span>
                  <span style={{ color: '#4b5563', marginLeft: '0.5rem' }}>{data.professionalQualifications}</span>
                </div>
              )}
              {data.educationalQualifications && (
                <div style={{ marginLeft: '1rem' }}>
                  <span style={{ fontWeight: '500' }}>Educational Qualifications:</span>
                  <span style={{ color: '#4b5563', marginLeft: '0.5rem' }}>{data.educationalQualifications}</span>
                </div>
              )}
              {data.technicalSkill && (
                <div style={{ marginLeft: '1rem' }}>
                  <span style={{ fontWeight: '500' }}>Technical Skills:</span>
                  <span style={{ color: '#4b5563', marginLeft: '0.5rem' }}>{data.technicalSkill}</span>
                </div>
              )}
            </div>
          )}

          {/* Projects */}
          {(data.title1 || data.title2) && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ fontWeight: 'bold', color: '#374151' }}>Projects</h4>
              {data.title1 && (
                <div style={{ marginLeft: '1rem', borderLeft: '2px solid #3b82f6', paddingLeft: '1rem' }}>
                  <div><span style={{ fontWeight: '500' }}>Title:</span> {data.title1}</div>
                  {data.description1 && <div><span style={{ fontWeight: '500' }}>Description:</span> {data.description1}</div>}
                  <div><span style={{ fontWeight: '500' }}>Role:</span> {data.role1 || 'N/A'}</div>
                  <div><span style={{ fontWeight: '500' }}>Duration:</span> {data.duration1 || 'N/A'}</div>
                </div>
              )}
              {data.title2 && (
                <div style={{ marginLeft: '1rem', borderLeft: '2px solid #3b82f6', paddingLeft: '1rem', marginTop: '0.5rem' }}>
                  <div><span style={{ fontWeight: '500' }}>Title:</span> {data.title2}</div>
                  {data.description2 && <div><span style={{ fontWeight: '500' }}>Description:</span> {data.description2}</div>}
                  <div><span style={{ fontWeight: '500' }}>Role:</span> {data.role2 || 'N/A'}</div>
                  <div><span style={{ fontWeight: '500' }}>Duration:</span> {data.duration2 || 'N/A'}</div>
                </div>
              )}
            </div>
          )}

          {/* More sections as needed */}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary">
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}