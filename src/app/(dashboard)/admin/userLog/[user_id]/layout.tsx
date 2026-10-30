"use client";
import ServerLayout from "@/app/components/layout/ServerLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ServerLayout isPublicRoute={true}>{children}</ServerLayout>;
}
