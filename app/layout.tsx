import "./globals.css";
import ErrorBoundary from './components/ErrorBoundary'

export const metadata = {
  title: 'Baby Feeding Tracker',
  description: 'Track your baby\'s feeding sessions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
