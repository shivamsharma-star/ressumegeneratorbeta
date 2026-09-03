import fs from 'fs';
import path from 'path';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

export async function generateResume(data, format = 'docx') {
  try {
    // Template path
    const templatePath = path.join(process.cwd(), 'templates', 'template1.docx');
    
    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      console.error('Template not found:', templatePath);
      // Agar template nahi hai toh naya document banao
      return await generateResumeFromScratch(data, format);
    }

    // Template read karo
    const templateBuffer = fs.readFileSync(templatePath);
    
    // Naya document banao with template data
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: 1728,
              right: 1728,
            },
          },
        },
        children: [
          // Header
          new Paragraph({
            children: [new TextRun({ text: (data.name || '').toUpperCase(), size: 32, bold: true })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: data.address || '', size: 22 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Mobile: ${data.mobile || ''}    `, size: 22 }),
              new TextRun({ text: data.email || '', size: 22, underline: {} }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: data.github || '', size: 22, underline: {} })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: data.linkedin || '', size: 22, underline: {} })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Career Objective
          new Paragraph({
            children: [new TextRun({ text: 'Career Objective:', size: 24, bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: data.careerObjective || '', size: 22 })],
            spacing: { after: 200 },
          }),

          // Academic Record
          new Paragraph({
            children: [new TextRun({ text: 'Academic Record:', size: 24, bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Professional Qualification:', size: 22, bold: true })],
            spacing: { after: 50 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\t${data.professionalQualifications || ''}`, size: 22 })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Educational Qualifications:', size: 22, bold: true })],
            spacing: { after: 50 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\t${data.educationalQualifications || ''}`, size: 22 })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'Technical Skills:', size: 22, bold: true })],
            spacing: { after: 50 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\t${data.technicalSkill || ''}`, size: 22 })],
            spacing: { after: 200 },
          }),

          // Minor Project
          new Paragraph({
            children: [new TextRun({ text: 'Minor Project:', size: 24, bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\tTitle: ${data.title1 || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\tDescription: ${data.description1 || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\tRole: ${data.role1 || ''}\tDuration: ${data.duration1 || ''}`, size: 22 })],
            spacing: { after: 200 },
          }),

          // Other Project
          new Paragraph({
            children: [new TextRun({ text: 'Other Project:', size: 24, bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\tTitle: ${data.title2 || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\tDescription: ${data.description2 || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\tRole: ${data.role2 || ''}\tDuration: ${data.duration2 || ''}`, size: 22 })],
            spacing: { after: 200 },
          }),

          // Co-curricular
          new Paragraph({
            children: [new TextRun({ text: 'Co-curricular Activities:', size: 24, bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\t${data.coCurricularActivities || ''}`, size: 22 })],
            spacing: { after: 200 },
          }),

          // Reward
          new Paragraph({
            children: [new TextRun({ text: 'Reward & Accolades:', size: 24, bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\t${data.reward || ''}`, size: 22 })],
            spacing: { after: 200 },
          }),

          // Certifications
          new Paragraph({
            children: [new TextRun({ text: 'Certifications:', size: 24, bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `\t${data.certifications || ''}`, size: 22 })],
            spacing: { after: 200 },
          }),

          // Strengths
          new Paragraph({
            children: [new TextRun({ text: `Strengths\t\t\t:  ${data.strengths || ''}`, size: 22 })],
            spacing: { after: 50 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Areas of Improvement\t\t:  ${data.areasOfImprovement || ''}`, size: 22 })],
            spacing: { after: 50 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Hobbies\t\t\t:  ${data.hobbies || ''}`, size: 22 })],
            spacing: { after: 50 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Areas of Interest\t\t:  ${data.areaOfInterest || ''}`, size: 22 })],
            spacing: { after: 200 },
          }),

          // Personal Details
          new Paragraph({
            children: [new TextRun({ text: 'Personal Details:', size: 24, bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Date of Birth\t\t\t: ${data.dateOfBirth || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Gender\t\t\t\t: ${data.gender || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Nationality\t\t\t: ${data.nationality || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Marital Status\t\t\t: ${data.maritalStatus || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Languages Known\t\t: ${data.language || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Mother Tongue\t\t: ${data.motherTongue || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Father's Name\t\t: ${data.fatherName || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Passport Details\t\t: ${data.passwortDetails || ''}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Permanent Address\t\t: ${data.permanentAddress || ''}`, size: 22 })],
            spacing: { after: 200 },
          }),

          // References
          new Paragraph({
            children: [new TextRun({ text: 'References:', size: 24, bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: data.reference || '', size: 22 })],
            spacing: { after: 200 },
          }),

          // Declaration
          new Paragraph({
            children: [new TextRun({ text: 'Declaration:', size: 24, bold: true })],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: data.declaration || '', size: 22 })],
            spacing: { after: 200 },
          }),

          // Date & Place
          new Paragraph({
            children: [new TextRun({ text: `Date: ${data.currentDate || new Date().toLocaleDateString('en-IN')}`, size: 22 })],
            spacing: { after: 25 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Place: ${data.place || ''}\t\t\t\t\t`, size: 22 }),
              new TextRun({ text: data.name || '', size: 22 }),
            ],
            spacing: { after: 50 },
          }),
        ],
      }],
    });

    // Generate buffer
    const docxBuffer = await Packer.toBuffer(doc);

    // Agar PDF chahiye toh
    if (format === 'pdf') {
      try {
        const docxToPdf = await import('docx-pdf');
        return new Promise((resolve, reject) => {
          docxToPdf.default(docxBuffer, (err, pdfBuffer) => {
            if (err) {
              console.error('PDF conversion error:', err);
              resolve(new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
            } else {
              resolve(new Blob([pdfBuffer], { type: 'application/pdf' }));
            }
          });
        });
      } catch (e) {
        console.error('PDF module error:', e);
        return new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      }
    }

    return new Blob([docxBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

  } catch (error) {
    console.error('Error in generateResume:', error);
    throw error;
  }
}

// Fallback function agar template nahi mila toh
async function generateResumeFromScratch(data, format) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [new TextRun({ text: (data.name || 'Resume').toUpperCase(), size: 32, bold: true })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: data.email || '', size: 22 })],
          alignment: AlignmentType.CENTER,
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}