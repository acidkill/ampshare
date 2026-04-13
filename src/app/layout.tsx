import './globals.css';

export const metadata = {
  title: 'AmpShare',
  description: 'Manage your appliance schedules',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-textDark font-sans antialiased">
        {children}
      </body>
    </html>
  )
}