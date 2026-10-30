// app/reviewer/layout.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function ReviewerLayout({
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
