import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vault – Secure Password & API Key Manager",
  description: "A premium, zero-knowledge vault to securely store and manage your passwords, API keys, and sensitive notes with end-to-end encryption.",
  keywords: ["password manager", "API key vault", "secure", "encrypted", "2FA"],
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#070b14" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
