
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { ScheduleProvider } from '@/contexts/ScheduleContext';
import { UnplannedRequestProvider } from '@/contexts/UnplannedRequestContext'; // Added
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: 'AmpShare',
  description: 'Schedule high voltage appliance use for your building.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <AuthProvider>
            <ScheduleProvider>
              <UnplannedRequestProvider> {/* Added */}
                {children}
                <Toaster />
              </UnplannedRequestProvider> {/* Added */}
            </ScheduleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
