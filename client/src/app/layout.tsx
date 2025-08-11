import AppShell from './components/AppShell';
import { AuthUser } from './types/application';
import './globals.css';
import { Inter } from 'next/font/google';
import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Script from "next/script";
import { useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Job Scraper',
  description: 'Job scraping application',
};
export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex`}>
       <ThemeProvider>
        <AppShell initialUser={null}>
          {children}
        </AppShell>
       </ThemeProvider>
      </body>
    </html>
  );
}