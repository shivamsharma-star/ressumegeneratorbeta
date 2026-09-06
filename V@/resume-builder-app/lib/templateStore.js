import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PizZip from 'pizzip';
import { sanitizeDocumentXml } from './sanitizeTemplate';

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

/** Runs sanitizeDocumentXml on the .docx buffer's word/document.xml before it's ever saved. */
function sanitizeDocxBuffer(buffer) {
  const zip = new PizZip(buffer);
  const xmlFile = zip.file('word/document.xml');
  if (!xmlFile) return buffer; // not a real docx; let downstream code raise a clearer error
  const fixedXml = sanitizeDocumentXml(xmlFile.asText());
  zip.file('word/document.xml', fixedXml);
  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

function saveTemplateInternal({ name, buffer }) {
  ensureDirs();
  const sanitized = sanitizeDocxBuffer(buffer);
  const id = crypto.randomUUID();
  const fileName = `${id}.docx`;
  fs.writeFileSync(path.join(UPLOADS_DIR, fileName), sanitized);

  const list = readManifestRaw();
  const record = { id, name, fileName, uploadedAt: new Date().toISOString() };
  list.push(record);
  writeManifest(list);
  return record;
}

/** First run convenience: if no templates exist yet, seed the sample template so the app isn't empty. */
function seedIfEmpty() {
  const list = readManifestRaw();
  if (list.length > 0) return;
  if (!fs.existsSync(SEED_TEMPLATE_PATH)) return;
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
  return true;
}
