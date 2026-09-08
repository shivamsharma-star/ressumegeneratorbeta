import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PizZip from 'pizzip';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const MANIFEST_PATH = path.join(DATA_DIR, 'templates.json');
const SEED_TEMPLATE_PATH = path.join(process.cwd(), 'template', 'ressumetemp.docx');

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(MANIFEST_PATH)) fs.writeFileSync(MANIFEST_PATH, '[]', 'utf-8');
}

function readManifestRaw() {
  ensureDirs();
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function writeManifest(list) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(list, null, 2), 'utf-8');
}

function validateDocx(buffer) {
  try {
    const zip = new PizZip(buffer);
    if (!zip.file('word/document.xml')) {
      throw new Error('Invalid DOCX: missing word/document.xml');
    }
    return true;
  } catch (err) {
    throw new Error(`Invalid DOCX file: ${err.message}`);
  }
}

function saveTemplateInternal({ name, buffer }) {
  ensureDirs();
  
  // Validate but DON'T modify
  validateDocx(buffer);
  
  const id = crypto.randomUUID();
  const fileName = `${id}.docx`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  // Save AS-IS without any modification
  fs.writeFileSync(filePath, buffer);

  const list = readManifestRaw();
  const record = { id, name, fileName, uploadedAt: new Date().toISOString() };
  list.push(record);
  writeManifest(list);
  console.log(`✅ Template saved: ${name} (${id})`);
  return record;
}

function seedIfEmpty() {
  const list = readManifestRaw();
  if (list.length > 0) return;
  if (!fs.existsSync(SEED_TEMPLATE_PATH)) {
    console.warn('No seed template found at:', SEED_TEMPLATE_PATH);
    return;
  }
  console.log('🌱 Seeding default template...');
  const buffer = fs.readFileSync(SEED_TEMPLATE_PATH);
  saveTemplateInternal({ name: 'Default College Resume', buffer });
}

export function listTemplates() {
  seedIfEmpty();
  return readManifestRaw().sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
}

export function getTemplate(id) {
  return readManifestRaw().find((t) => t.id === id) || null;
}

export function getTemplateFilePath(id) {
  const t = getTemplate(id);
  if (!t) return null;
  return path.join(UPLOADS_DIR, t.fileName);
}

export function saveTemplate({ name, buffer }) {
  return saveTemplateInternal({ name, buffer });
}

export function deleteTemplate(id) {
  const list = readManifestRaw();
  const idx = list.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  const [removed] = list.splice(idx, 1);
  writeManifest(list);
  const filePath = path.join(UPLOADS_DIR, removed.fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  console.log(`🗑️ Template deleted: ${removed.name}`);
  return true;
}