import React from 'react';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const metadata = {
  title: 'ECU FORGE MASTERCLASS | Powered by MECH-MOTO',
  description: 'Master automotive diagnostics, ECU technology, electrical systems, and vehicle remapping through structured technical masterclasses.',
  keywords: ['ECU Tuning', 'Automotive Diagnostics', 'Bosch MED17', 'CAN Bus', 'EV High Voltage', 'MECH-MOTO'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-brand-bg text-white min-h-screen flex flex-col justify-between">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
