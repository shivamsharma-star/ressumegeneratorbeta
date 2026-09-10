'use client';
import { useState } from 'react';

export default function DynamicResumeForm({ templateId, templateName, variables }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, name) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Max 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, [name]: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleLinkChange = (e, name, field) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: {
        ...(prev[name] || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (format) => {
    setLoading(true);
    setStatus('Generating...');
    try {
      const response = await fetch('/api/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, data: formData, format }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setStatus('✅ Downloaded!');
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const prettyLabel = (name) =>
    name.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

  return (
    <div className="resume-form">
      <h2>{templateName}</h2>

      {variables.map((variable) => {
        if (variable.type === 'image') {
          return (
            <div key={variable.name} className="field">
              <label>{prettyLabel(variable.name)} (Image)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, variable.name)}
              />
              {formData[variable.name] && (
                <img
                  src={formData[variable.name]}
                  alt="Preview"
                  className="photo-preview"
                />
              )}
            </div>
          );
        }

        if (variable.type === 'link') {
          return (
            <div key={variable.name} className="field">
              <label>{prettyLabel(variable.name)} (Link)</label>
              <input
                type="text"
                placeholder="Link text (e.g. View Project)"
                value={formData[variable.name]?.text || ''}
                onChange={(e) => handleLinkChange(e, variable.name, 'text')}
                style={{ marginBottom: 6 }}
              />
              <input
                type="url"
                placeholder="URL (e.g. https://example.com)"
                value={formData[variable.name]?.url || ''}
                onChange={(e) => handleLinkChange(e, variable.name, 'url')}
              />
            </div>
          );
        }

        return (
          <div key={variable.name} className="field">
            <label>{prettyLabel(variable.name)}</label>
            <input
              type="text"
              name={variable.name}
              value={formData[variable.name] || ''}
              onChange={handleTextChange}
              placeholder={`Enter ${variable.name}`}
            />
          </div>
        );
      })}

      <div className="actions">
        <button onClick={() => handleSubmit('docx')} disabled={loading}>
          Download DOCX
        </button>
        <button onClick={() => handleSubmit('pdf')} disabled={loading}>
          Download PDF
        </button>
      </div>

      {status && <p className="status">{status}</p>}
    </div>
  );
}


// 'use client';

// import { useState, useEffect } from 'react';

// export default function DynamicResumeForm({ templateId, templateName, variables }) {
//   const [formData, setFormData] = useState(() => {
//     const initial = {};
//     variables.forEach((v) => {
//       initial[v.name] = '';
//     });
//     return initial;
//   });
//   const [loading, setLoading] = useState(null);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const update = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

//   async function handleDownload(format) {
//     setError('');
//     setSuccess('');
//     setLoading(format);
    
//     try {
//       const res = await fetch('/api/generate-document', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ templateId, data: formData, format }),
//       });

//       if (!res.ok) {
//         let errorMsg = `Request failed with status ${res.status}`;
//         try {
//           const errBody = await res.json();
//           errorMsg = errBody.error || errorMsg;
//         } catch {}
//         throw new Error(errorMsg);
//       }

//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       const safeName = (formData.name || templateName || 'resume')
//         .replace(/[^a-zA-Z0-9_-]+/g, '_') || 'resume';
//       a.href = url;
//       a.download = `${safeName}.${format}`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
      
//       setSuccess(`✅ ${format.toUpperCase()} downloaded successfully!`);
//     } catch (err) {
//       setError(err.message || 'Something went wrong while generating the file.');
//     } finally {
//       setLoading(null);
//     }
//   }

//   // Auto-fill current date if variable exists
//   useEffect(() => {
//     if (variables.some(v => v.name === 'currentDate')) {
//       const today = new Date().toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//       setFormData(prev => ({ ...prev, currentDate: today }));
//     }
//   }, [variables]);

//   return (
//     <form className="resume-form" onSubmit={(e) => e.preventDefault()}>
//       <section>
//         <h2>{templateName}</h2>
//         <p className="subtitle">Fill in your details below. All fields are required unless marked optional.</p>

//         {variables.map((v) => (
//           <div className="field" key={v.name}>
//             <label htmlFor={v.name}>
//               {v.name}
//               {v.type === 'image' ? ' 📸 (image URL)' : ''}
//               {v.name === 'currentDate' ? ' (auto-filled)' : ''}
//             </label>
//             <input
//               id={v.name}
//               name={v.name}
//               type="text"
//               placeholder={v.type === 'image' ? 'https://example.com/photo.jpg' : `Enter ${v.name}`}
//               value={formData[v.name] ?? ''}
//               onChange={(e) => update(v.name, e.target.value)}
//               disabled={v.name === 'currentDate'}
//               required={v.name !== 'currentDate'}
//             />
//             {v.type === 'image' && formData[v.name] && (
//               <img
//                 src={formData[v.name]}
//                 alt="Preview"
//                 className="photo-preview"
//                 onError={(e) => {
//                   e.currentTarget.style.display = 'none';
//                 }}
//                 onLoad={(e) => {
//                   e.currentTarget.style.display = 'block';
//                 }}
//               />
//             )}
//           </div>
//         ))}
//       </section>

//       {error && <p className="error">❌ {error}</p>}
//       {success && <p className="status">{success}</p>}

//       <div className="actions">
//         <button 
//           type="button" 
//           disabled={loading !== null} 
//           onClick={() => handleDownload('docx')}
//         >
//           {loading === 'docx' ? '⏳ Generating...' : '📄 Download Word (.docx)'}
//         </button>
//         <button 
//           type="button" 
//           disabled={loading !== null} 
//           onClick={() => handleDownload('pdf')}
//         >
//           {loading === 'pdf' ? '⏳ Generating...' : '📑 Download PDF'}
//         </button>
//       </div>
//     </form>
//   );
// }