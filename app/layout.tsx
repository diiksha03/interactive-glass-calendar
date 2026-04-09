import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Glass Calendar',
  description: '3D glassmorphism wall calendar with range selection and monthly notes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
