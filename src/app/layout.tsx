import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google';
import "./globals.css";
import type React from "react"
import Providers from './providers'
import BootstrapClient from "@/components/BootstrapClient"
import { UserProvider } from '@auth0/nextjs-auth0/client'
import { TRPCProvider } from './trpc-provider'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: "Mobile Chatbot",
  description: "Mobile-friendly chatbot interface",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geistSans.className}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ margin: 0, padding: 0 }}>
        <UserProvider>
          <TRPCProvider>
            <Providers>{children}</Providers>
          </TRPCProvider>
          <BootstrapClient />
        </UserProvider>
      </body>
    </html>
  );
}
