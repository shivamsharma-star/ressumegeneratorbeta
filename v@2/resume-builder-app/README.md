# Resume Generator (Next.js) — Dynamic Templates + Photo + PDF, No System Install

Admin uploads any `.docx` resume template. The app **parses the template to
find its own variables** (`{{name}}`, `{{email}}`, `{%photo}`, ...), builds a
form on the fly from whatever it finds, injects the user's answers (including
a photo, given as a URL) straight into that same `.docx`, and offers both
Word and PDF downloads — with **zero system-level installs** (no LibreOffice,
no Word, nothing outside `npm install`).

## Architecture

```
ADMIN
  Admin Dashboard (/admin)
    -> POST /api/admin/templates (multipart upload)
        -> lib/sanitizeTemplate.js   (fixes any {{tag}} Word split across runs)
        -> lib/templateStore.js      (saves .docx + metadata under data/)

USER
  Home (/) -> lists templates from lib/templateStore.js
  Pick one -> /generate/[templateId]
      -> lib/templateParser.js parses the .docx and finds:
           {{tagName}}  -> a text field
           {%tagName}   -> an image (photo URL) field
      -> DynamicResumeForm renders exactly those fields, nothing hardcoded

  Submit -> POST /api/generate-document { templateId, data, format }
      -> lib/ressumemegeratarator.js
           1. fetches any photo URLs into buffers
           2. Docxtemplater + docxtemplater-image-module-free inject text
              and photos directly into the ORIGINAL .docx (no new document
              is created — same structure/formatting, only tags replaced)
           3. for PDF: that exact filled .docx is converted via
              lib/docxToPdf.js (mammoth -> HTML -> puppeteer -> PDF)
      -> route.js streams the file back as a download
```

## Why mammoth + puppeteer instead of `docx-pdf` / `libreoffice-convert`

You asked for PDF conversion "only using a Node.js library, without
installing anything on the system" (like `docx-pdf`). Worth knowing:
**`docx-pdf`, `libreoffice-convert`, and every similar npm package actually
work by silently shelling out to a LibreOffice (`soffice`) install on the
machine** — the npm package itself does no rendering. If LibreOffice isn't
installed, they all fail at runtime.

To genuinely need nothing beyond `npm install`, this project instead:

1. Uses **mammoth** (pure JS — reads the `.docx` XML directly, no native
   binary) to convert the filled `.docx` into HTML. Embedded/injected images
   come through as inline base64 `<img>` tags.
2. Uses **puppeteer** to print that HTML to PDF. Puppeteer downloads its own
   bundled Chromium automatically during `npm install` — you don't install a
   browser or any OS package yourself.

**Trade-off:** this won't pixel-match Word's exact layout the way a real
Word/LibreOffice render would (some tab stops / spacing can shift slightly in
complex templates). For a clean resume template like the one used here it
looks correct. If you ever need perfect fidelity and are fine installing
LibreOffice on the server, swap `lib/docxToPdf.js` for `libreoffice-convert`
— everything else stays the same.

## 1. Install

```bash
npm install
```

(Puppeteer's Chromium download happens automatically here — it needs
internet access during install, and typically works out of the box on
Linux/macOS/Windows without extra system packages.)

## 2. (Optional) protect the admin dashboard

```bash
cp .env.example .env.local
# edit ADMIN_TOKEN=your-secret
```

If `ADMIN_TOKEN` is unset, upload/delete are open (fine for local dev only).
This token check is intentionally simple — for a real deployment, put the
`/admin` route behind proper authentication (e.g. NextAuth) instead.

## 3. Run

```bash
npm run dev
```

- `http://localhost:3000/admin` — upload a `.docx` template
- `http://localhost:3000` — pick a template, fill the auto-generated form,
  download Word or PDF

A sample template (`template/ressumetemp.docx`) is auto-seeded on first run
so the list isn't empty.

## Troubleshooting: "malformed xml" / "Template contains malformed xml"

This means the `.docx` has an unmatched `{` or `}` somewhere — usually a
half-typed tag (`{{name}` missing a brace, `{%photo` missing its closing
`}`), or a stray `{`/`}` typed as normal text elsewhere in the document.

**As of this version, uploads are validated before they're saved**
(`lib/templateValidation.js`): the admin upload endpoint now actually tries
to compile the template with Docxtemplater right after sanitizing it, and if
that fails, the upload is **rejected** with a message showing the text
around the problem brace(s) — instead of saving a broken template that only
fails later when a user tries to generate their resume.

If you already have a broken template saved from before this fix:
1. Go to `/admin`, delete the broken template.
2. Fix the `.docx` (search for any lone `{` or `}` and either complete the
   tag correctly or remove the stray character).
3. Re-upload — you'll now get a precise error immediately if something is
   still wrong, instead of a generic failure during generation.

## Template authoring rules (for whoever prepares the .docx)

- **Text field:** type `{{fieldName}}` directly in the Word document, e.g.
  `{{name}}`, `{{email}}`, `{{careerObjective}}`. Whatever name you use
  becomes the form field's label automatically.
- **Photo field:** type `{%photo}` (single `%`, no double braces) where the
  picture should go. The user will paste an image URL in the generated form;
  the app downloads that image server-side and embeds it in the document at
  render time.
- Avoid retyping a tag with autocorrect/spellcheck fighting you — if Word
  splits `{{name}}` into separate runs, the app now **auto-repairs this on
  upload** (`lib/sanitizeTemplate.js`), so in practice this is rarely an
  issue, but keeping tags typed in one go is still the safest habit.
- Every `{{tag}}` you add is automatically picked up — there is nothing to
  register in code. Delete a tag from the `.docx` and re-upload, and it just
  disappears from the form.

## File/data storage

Uploaded templates live in `data/uploads/*.docx`; their metadata (id, name,
upload date) is in `data/templates.json`. This is intentionally simple
(no database) — swap `lib/templateStore.js` for a real DB-backed
implementation if you need multi-server deployment, since local disk storage
won't be shared across serverless instances.
