import './globals.css';
import { ReactNode } from 'react';

/**
 * Root layout for the application.
 *
 * This component wraps all pages and imports global styles. It defines
 * the basic HTML structure and applies a minimal margin and padding
 * to ensure content is not flush against the edges of the viewport.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}