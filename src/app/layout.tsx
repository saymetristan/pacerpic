import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from './providers';
import { AuthSync } from '@/components/auth/auth-sync';
import { UserProvider } from '@auth0/nextjs-auth0/client';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PacerPic",
  description: "Encuentra tus fotos deportivas al instante",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider>
          <AuthSync>
            <Providers>
              {children}
            </Providers>
          </AuthSync>
        </UserProvider>
      </body>
    </html>
  );
}
