import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { ScheduleProvider } from '@/contexts/ScheduleContext';
import { UnplannedRequestProvider } from '@/contexts/UnplannedRequestContext';
import { ThemeProvider } from "next-themes";
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { WebComponentsLoader } from '@/components/WebComponentsLoader';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={`${inter.className} font-body antialiased min-h-screen`}>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <ScheduleProvider>
                <UnplannedRequestProvider>
                  <WebComponentsLoader />
                  {children}
                  <Toaster />
                </UnplannedRequestProvider>
              </ScheduleProvider>
            </AuthProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
