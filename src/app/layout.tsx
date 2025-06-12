import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import type React from "react"
import Providers from './providers'
import BootstrapClient from "@/components/BootstrapClient"
import { TRPCProvider } from './trpc-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Mobile Chatbot",
  description: "Mobile-friendly chatbot interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body className={inter.variable} style={{ margin: 0, padding: 0 }}>
        <Providers>
          <TRPCProvider>
            {children}
          </TRPCProvider>
          <BootstrapClient />
        </Providers>
      </body>
    </html>
  );
}
