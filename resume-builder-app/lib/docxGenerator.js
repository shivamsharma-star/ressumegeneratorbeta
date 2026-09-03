import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

export async function generateDOCX(data) {
  // Yeh aapki Word template ke structure ke hisaab se exactly match karega
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
        // === HEADER SECTION ===
        new Paragraph({
          children: [
            new TextRun({
              text: data.name.toUpperCase(),
              size: 32,
              bold: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.address, size: 22 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Mobile: ${data.mobile}    Email: ${data.email}`, size: 22 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.github, size: 22 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.linkedin, size: 22 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),

        // === CAREER OBJECTIVE ===
        new Paragraph({
          children: [
            new TextRun({ text: 'Career Objective:', size: 24, bold: true }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.careerObjective, size: 22 })],
          spacing: { after: 200 },
        }),

        // === ACADEMIC RECORD ===
        new Paragraph({
          children: [
            new TextRun({ text: 'Academic Record:', size: 24, bold: true }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Professional Qualification:', size: 22, bold: true }),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\t${data.professionalQualifications}`, size: 22 }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Educational Qualifications:', size: 22, bold: true }),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\t${data.educationalQualifications}`, size: 22 }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Technical Skills:', size: 22, bold: true }),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\t${data.technicalSkill}`, size: 22 }),
          ],
          spacing: { after: 200 },
        }),

        // === MINOR PROJECT ===
        new Paragraph({
          children: [
            new TextRun({ text: 'Minor Project:', size: 24, bold: true }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\tTitle: ${data.title1}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\tDescription: ${data.description1}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\tRole: ${data.role1}\tDuration: ${data.duration1}`, size: 22 }),
          ],
          spacing: { after: 200 },
        }),

        // === OTHER PROJECT ===
        new Paragraph({
          children: [
            new TextRun({ text: 'Other Project:', size: 24, bold: true }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\tTitle: ${data.title2}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\tDescription: ${data.description2}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\tRole: ${data.role2}\tDuration: ${data.duration2}`, size: 22 }),
          ],
          spacing: { after: 200 },
        }),

        // === CO-CURRICULAR ACTIVITIES ===
        new Paragraph({
          children: [
            new TextRun({ text: 'Co-curricular Activities:', size: 24, bold: true }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\t${data.coCurricularActivities}`, size: 22 }),
          ],
          spacing: { after: 200 },
        }),

        // === REWARD & ACCOLADES ===
        new Paragraph({
          children: [
            new TextRun({ text: 'Reward & Accolades:', size: 24, bold: true }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\t${data.reward}`, size: 22 }),
          ],
          spacing: { after: 200 },
        }),

        // === CERTIFICATIONS ===
        new Paragraph({
          children: [
            new TextRun({ text: 'Certifications:', size: 24, bold: true }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `\t${data.certifications}`, size: 22 }),
          ],
          spacing: { after: 200 },
        }),

        // === STRENGTHS ===
        new Paragraph({
          children: [
            new TextRun({ text: `Strengths\t\t\t:  ${data.strengths}`, size: 22 }),
          ],
          spacing: { after: 50 },
        }),

        // === AREAS OF IMPROVEMENT ===
        new Paragraph({
          children: [
            new TextRun({ text: `Areas of Improvement\t\t:  ${data.areasOfImprovement}`, size: 22 }),
          ],
          spacing: { after: 50 },
        }),

        // === HOBBIES ===
        new Paragraph({
          children: [
            new TextRun({ text: `Hobbies\t\t\t:  ${data.hobbies}`, size: 22 }),
          ],
          spacing: { after: 50 },
        }),

        // === AREAS OF INTEREST ===
        new Paragraph({
          children: [
            new TextRun({ text: `Areas of Interest\t\t:  ${data.areaOfInterest}`, size: 22 }),
          ],
          spacing: { after: 200 },
        }),

        // === PERSONAL DETAILS ===
        new Paragraph({
          children: [
            new TextRun({ text: 'Personal Details:', size: 24, bold: true }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Date of Birth\t\t\t: ${data.dateOfBirth}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Gender\t\t\t\t: ${data.gender}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Nationality\t\t\t: ${data.nationality}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Marital Status\t\t\t: ${data.maritalStatus}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Languages Known\t\t: ${data.language}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Mother Tongue\t\t: ${data.motherTongue}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Father's Name\t\t: ${data.fatherName}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Passport Details\t\t: ${data.passwortDetails}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Permanent Address\t\t: ${data.permanentAddress}`, size: 22 }),
          ],
          spacing: { after: 200 },
        }),

        // === REFERENCES ===
        new Paragraph({
          children: [
            new TextRun({ text: 'References:', size: 24, bold: true }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.reference, size: 22 })],
          spacing: { after: 200 },
        }),

        // === DECLARATION ===
        new Paragraph({
          children: [
            new TextRun({ text: 'Declaration:', size: 24, bold: true }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: data.declaration, size: 22 })],
          spacing: { after: 200 },
        }),

        // === DATE & PLACE ===
        new Paragraph({
          children: [
            new TextRun({ text: `Date: ${data.currentDate}`, size: 22 }),
          ],
          spacing: { after: 25 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Place: ${data.place}\t\t\t\t\t${data.name}`, size: 22 }),
          ],
          spacing: { after: 50 },
        }),
      ],
    }],
  });

  return await Packer.toBlob(doc);
}