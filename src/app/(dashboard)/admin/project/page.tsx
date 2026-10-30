"use client";
import Project from "@/app/components/project/projects";
import AuthenticatedPage from "@/app/components/layout/AuthenticatedPage";

export default function UsersPage() {
  return (
    <AuthenticatedPage loadingMessage="">
      <div>
        <div className="flex justify-between items-center mb-6"></div>
        <Project />
      </div>
    </AuthenticatedPage>
  );
}
