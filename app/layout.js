import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'KUNRN — Kigali Unified Patient Records & Insurance Network',
  description: 'Permissioned, interoperable health data platform for Kigali, Rwanda',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
