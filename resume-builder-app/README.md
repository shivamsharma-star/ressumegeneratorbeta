# Resume Generator (Next.js)

Fills your college `.docx` template with the user's form data — it never builds a
new document, it only replaces the `{{placeholders}}` already inside
`template/ressumetemp.docx`. That same filled `.docx` is then converted to PDF,
so both downloads come from one source of truth.

## How data flows

```
ResumeForm (browser)
  -> POST /api/generate-document  { data, format }
      -> lib/ressumemegeratarator.js
          -> generateDocxBuffer(data)   // Docxtemplater injects data into template/ressumetemp.docx
          -> generatePdfBuffer(data)    // same docx buffer -> LibreOffice headless -> PDF
      -> route.js streams the file back with Content-Disposition: attachment
```

## 1. Install dependencies

```bash
npm install
```

## 2. Install LibreOffice (required only for PDF export)

`docxtemplater` only edits the `.docx` XML — it can't render a PDF by itself.
To convert the filled `.docx` to a real PDF, this project shells out to
LibreOffice's headless mode via the `libreoffice-convert` package. Word
downloads work with no extra setup; PDF downloads need `soffice` on the machine
running `npm run dev` / your server.

- **Ubuntu/Debian**: `sudo apt-get install libreoffice`
- **macOS**: `brew install --cask libreoffice`
- **Windows**: install LibreOffice and make sure `soffice.exe` is on PATH
- **Docker/production**: use a base image that already has LibreOffice
  installed, or add it in your Dockerfile, e.g.:
  ```dockerfile
  RUN apt-get update && apt-get install -y libreoffice --no-install-recommends
  ```
- **Serverless hosts without LibreOffice (e.g. plain Vercel functions)**: these
  can't run `soffice`. Either deploy on a normal Node server/VM/Docker
  container, or swap `generatePdfBuffer` in `lib/ressumemegeratarator.js` to
  call an external conversion service (e.g. a small Gotenberg container, or a
  cloud conversion API) instead of `libreoffice-convert`.

## 3. Run it

```bash
npm run dev
```

Open http://localhost:3000, fill the form, and click **Download Word (.docx)**
or **Download PDF**.

## Editing the template

The template lives at `template/ressumetemp.docx`. Its placeholders are:

```
name, Address, Mobile, email, github, linkedin, careerObjective,
ProfessionalQualifications, educationalQualifications, technicalSkill,
title1, description1, role1, duration1,
title2, description2, role2, duration2,
coCurricularActivities, reward, certifications, strengths,
areasOfImprovement, hobbies, areaOfInterest,
dateOfBirth, gender, nationality, maritalStatus, language, motherTongue,
fatherName, passwortDetails, permanentAddress,
reference, declaration, currentDate, place
```

If you add/rename/remove a `{{placeholder}}` in the `.docx`:
1. Update `lib/types.js` (`emptyResumeData`, `flattenForTemplate`).
2. Update the field lists in `components/ResumeForm.js`.

**Important when editing the .docx in Word:** if you retype a `{{tag}}` and
Word's autocorrect/spellcheck splits it across multiple runs, docxtemplater
won't find it. Easiest fix: type the whole `{{tagName}}` in a plain-text editor
first, or turn off autocorrect, then paste it in as one block, then re-save.
