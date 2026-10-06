// app/layout.tsx
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/app/components/Providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mahder",
  description: "Mahder data platform",
  icons: {
    icon: "/Mahder Logo XS.png",
    apple: "/Mahder Logo XS.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>
          <Toaster richColors position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
