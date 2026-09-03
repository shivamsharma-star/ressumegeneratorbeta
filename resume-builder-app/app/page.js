import ResumeForm from '../components/ResumeForm';

export default function Home() {
  return (
    <main className="page">
      <h1>Resume Generator</h1>
      <p className="subtitle">
        Fill in your details below. Your data is injected directly into the college
        template — download it as a Word document or PDF.
      </p>
      <ResumeForm />
    </main>
  );
}
