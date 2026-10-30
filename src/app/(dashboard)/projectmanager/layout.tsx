// app/projectmanager/layout.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function ProjectManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
