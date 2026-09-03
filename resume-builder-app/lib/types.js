/**
 * IMPORTANT: These keys must match the {{placeholders}} inside
 * template/ressumetemp.docx EXACTLY (same spelling, same case).
 * If you edit the .docx template and add/rename a placeholder,
 * update this file (and ResumeForm.js) to match.
 *
 * @typedef {Object} ProjectData
 * @property {string} title
 * @property {string} description
 * @property {string} role
 * @property {string} duration
 *
 * @typedef {Object} ResumeFormState
 * @property {string} name
 * @property {string} Address
 * @property {string} Mobile
 * @property {string} email
 * @property {string} github
 * @property {string} linkedin
 * @property {string} careerObjective
 * @property {string} ProfessionalQualifications
 * @property {string} educationalQualifications
 * @property {string} technicalSkill
 * @property {ProjectData} project1
 * @property {ProjectData} project2
 * @property {string} coCurricularActivities
 * @property {string} reward
 * @property {string} certifications
 * @property {string} strengths
 * @property {string} areasOfImprovement
 * @property {string} hobbies
 * @property {string} areaOfInterest
 * @property {string} dateOfBirth
 * @property {string} gender
 * @property {string} nationality
 * @property {string} maritalStatus
 * @property {string} language
 * @property {string} motherTongue
 * @property {string} fatherName
 * @property {string} passwortDetails  // NOTE: kept as-is, this is a typo already baked into the .docx template
 * @property {string} permanentAddress
 * @property {string} reference
 * @property {string} declaration
 * @property {string} currentDate
 * @property {string} place
 */

/** @returns {ResumeFormState} */
export function emptyResumeData() {
  return {
    name: '',
    Address: '',
    Mobile: '',
    email: '',
    github: '',
    linkedin: '',
    careerObjective: '',
    ProfessionalQualifications: '',
    educationalQualifications: '',
    technicalSkill: '',
    project1: { title: '', description: '', role: '', duration: '' },
    project2: { title: '', description: '', role: '', duration: '' },
    coCurricularActivities: '',
    reward: '',
    certifications: '',
    strengths: '',
    areasOfImprovement: '',
    hobbies: '',
    areaOfInterest: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    maritalStatus: '',
    language: '',
    motherTongue: '',
    fatherName: '',
    passwortDetails: '',
    permanentAddress: '',
    reference: '',
    declaration: '',
    currentDate: new Date().toLocaleDateString('en-GB'),
    place: '',
  };
}

/**
 * Flattens the form state (which groups project fields into project1/project2
 * for a nicer UI) into the flat key set the .docx template actually expects
 * (title1, description1, role1, duration1, title2, ...).
 *
 * @param {ResumeFormState} form
 */
export function flattenForTemplate(form) {
  const { project1, project2, ...rest } = form;
  return {
    ...rest,
    title1: project1?.title || '',
    description1: project1?.description || '',
    role1: project1?.role || '',
    duration1: project1?.duration || '',
    title2: project2?.title || '',
    description2: project2?.description || '',
    role2: project2?.role || '',
    duration2: project2?.duration || '',
  };
}
