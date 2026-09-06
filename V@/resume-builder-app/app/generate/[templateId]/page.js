import Link from 'next/link';
import { getTemplate, getTemplateFilePath } from '../../../lib/templateStore';
import { parseTemplateVariables } from '../../../lib/templateParser';
import DynamicResumeForm from '../../../components/DynamicResumeForm';

export default function GeneratePage({ params }) {
  const template = getTemplate(params.templateId);

  if (!template) {
    return (
      <main className="page">
        <h1>Template not found</h1>
        <p>
          <Link href="/">← Back to templates</Link>
        </p>
      </main>
    );
  }

  const filePath = getTemplateFilePath(params.templateId);
  let variables = [];
  let parseError = '';
  try {
    variables = parseTemplateVariables(filePath);
  } catch (err) {
    parseError = err.message;
  }

  return (
    <main className="page">
      <p>
        <Link href="/">← Back to templates</Link>
      </p>

      {parseError ? (
        <p className="error">Could not read this template: {parseError}</p>
      ) : variables.length === 0 ? (
        <p className="error">
          This template has no {'{{variables}}'} that could be detected. Make sure it uses{' '}
          {'{{tagName}}'} for text and {'{%tagName}'} for a photo.
        </p>
      ) : (
        <DynamicResumeForm
          templateId={template.id}
          templateName={template.name}
          variables={variables}
        />
      )}
    </main>
  );
}
