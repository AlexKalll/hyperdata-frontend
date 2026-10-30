"use client";
import ProjectArchive from "@/app/components/project/projectsArchive";
import AuthenticatedPage from "@/app/components/layout/AuthenticatedPage";

export default function UsersPage() {
  return (
    <AuthenticatedPage loadingMessage="">
      <div>
        <div className="flex justify-between items-center mb-6"></div>
        <ProjectArchive />
      </div>
    </AuthenticatedPage>
  );
}
