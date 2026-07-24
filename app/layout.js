import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'KUPRIN — Kigali Unified Patient Records & Insurance Network',
  description: 'Permissioned, interoperable health data platform for Kigali, Rwanda',
};

// Runs before paint, before React hydrates — without this, the page would
// flash light mode for a beat on every load even for someone who picked dark,
// since AppContext can't apply the class until after it mounts.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem('kuprin_theme');
    var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
