import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

export const metadata = {
  icons: {
    icon: [
      { url: '/icon?size=32', sizes: '32x32', type: 'image/png' },
      { url: '/icon?size=16', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icon?size=180', sizes: '180x180', type: 'image/png' },
    ],
  },
}
