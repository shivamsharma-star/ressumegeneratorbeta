import './globals.css';

export const metadata = {
  title: 'Resume Generator',
  description: 'Fill the form, download your resume as Word or PDF using the college template.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
