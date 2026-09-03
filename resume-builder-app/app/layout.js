import './globals.css';

export const metadata = {
  title: 'Resume Builder',
  description: 'Create professional resumes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}