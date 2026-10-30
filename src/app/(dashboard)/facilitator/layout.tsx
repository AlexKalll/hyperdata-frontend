// app/facilitator/layout.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function FacilitatorLayout({
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
