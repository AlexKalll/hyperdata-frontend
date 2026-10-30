// pages/Projects.tsx
"use client";
import React, { useState, useEffect } from "react";
import ProjectCard from "../project/projectCardArchive";
import AddProjectModal from "../project/addProjectModal";
import TaskTable from "../project/taskTable";
import { NewProjectProfilesArchive } from "@/lib/hooks/useProject";
import { ProjectDetail, Project, ProjectResponse } from "@/app/types/project";
import { useSession } from "next-auth/react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
interface PaginationProps {
  pageCount: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  showingText: string;
}
const PaginationControls: React.FC<{ pagination: PaginationProps }> = ({
  pagination,
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <span className="md:text-sm text-xs text-gray-500">Showing</span>
        <select
          value={pagination.pageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            pagination.setPageSize(newSize);
            pagination.setPage(1);
          }}
          className="border  border-gray-100 rounded-md md:text-sm text-xs px-2 py-1 bg-white"
          title="Page Size"
        >
          {[5, 10, 20, 30, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div className="md:text-sm text-xs pl-2 text-gray-500">
        {pagination.showingText}
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
          disabled={pagination.page <= 1}
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        {Array.from(
          { length: Math.max(1, pagination.pageCount) },
          (_, i) => i + 1
        ).map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pagination.page === pageNumber ? "outline" : "ghost"}
            className={
              pagination.page === pageNumber
                ? "bg-primary text-black font-bold border-primary"
                : ""
            }
            size="sm"
            onClick={() => pagination.setPage(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}
        <Button
          size="sm"
          onClick={() => pagination.setPage(pagination.page + 1)}
          disabled={pagination.page >= pagination.pageCount}
        >
          <ChevronRightIcon className="md:w-4 md:h-4 w-2 h-2" />
        </Button>
      </div>
    </div>
  );
};
const ProjectsArchivePage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [projectToUpdate, setProjectToUpdate] =
    useState<ProjectResponse | null>(null);
  const handleBackClick = () => {
    setIsTaskModalOpen(false);
    setSelectedProject(null); // Optional: Clear selected project for clarity
  };

  const handleUpdateProjectClick = (project: ProjectResponse) => {
    setProjectToUpdate(project);
    setIsUpdateModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  const { data: session, status } = useSession();

  const [page, setPage] = useState(1);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectResponse | null>(null);

  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [verificationStatus, setVerificationStatus] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const {
    data: parojectData,
    isLoading: isprojectLoading,
    error,
  } = NewProjectProfilesArchive({
    page,
    pageSize,
    searchQuery: debouncedSearch,
    verificationStatus,
  });
  const router = useRouter();
  const handleTaskClick = (projectId: string) => {
    // For Next.js App Router (src/app directory)
    router.push(`/admin/projectDetail/${projectId}`);
  };
  interface LoadingDateProps {}

  const loadingdate: React.FC<LoadingDateProps> = () => {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  };
  useEffect(() => {
    if (!error && parojectData?.data?.result) {
      setProjects(parojectData.data.result);
    } else if (error) {
      console.error("Error fetching projects:", error.message);
    }
  }, [error, parojectData]);

  const paginatedParojectData = parojectData?.data.result || [];
  const parojectTotalElements = parojectData?.data?.total || 0;
  const parojectTotalPages = Math.ceil(parojectTotalElements / pageSize) || 0;
  const parojectStartRecord = paginatedParojectData.length
    ? (page - 1) * pageSize + 1
    : 0;
  const projectEndRecord = Math.min(page * pageSize, parojectTotalElements);
  const [taskLoading, setTaskLoading] = useState(false);
  // Fetch projects from the endpoint
  const handleProjectClick = (project: ProjectResponse) => {
    setSelectedProject(project);
    setIsTaskModalOpen(true);
  };
  {
  }
  return (
    <div className="p-1">
      {status === "loading" || status === "unauthenticated" ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </div>
      ) : !isTaskModalOpen ? (
        <div>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedParojectData.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  cover_image_url={project.cover_image_url}
                  start_date={project.start_date}
                  end_date={project.end_date}
                  manager_id={project.manager_id}
                  created_by={project.created_by}
                  isLoading={isprojectLoading}
                  updated_by={project.updated_by}
                  created_date={project.created_date}
                  updated_date={project.updated_date}
                  title={project.name}
                  manager={project.manager}
                  status={
                    project.status.toLowerCase() === "active"
                      ? "Active"
                      : project.status === "inactive"
                        ? "Inactive"
                        : "Inactive"
                  }
                  description={project.description}
                  onViewProject={() => handleTaskClick(project.id)}
                />
              ))}
            </div>
            <div className="flex items-center justify-between py-4">
              <PaginationControls
                pagination={{
                  pageCount: parojectTotalPages,
                  page: page,
                  setPage: setPage,
                  pageSize: pageSize,
                  setPageSize: setPageSize,
                  showingText:
                    parojectTotalElements > 0
                      ? `Showing ${parojectStartRecord} to ${projectEndRecord} out of ${parojectTotalElements} records`
                      : "",
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div>
          {selectedProject && (
            <div className="-mt-27 ">
              <button
                onClick={handleBackClick}
                className="relative z-10 px-4 py-2 bg-white text-primary rounded-md mb-2 border border-white"
                style={{ touchAction: "manipulation" }}
              >
                ← Back
              </button>

              <TaskTable
                projectId={selectedProject.id}
                cover_image_url={selectedProject.cover_image_url}
                projectTitle={selectedProject.name}
                manager={selectedProject.manager}
                projectStatus={
                  selectedProject.status === "Active" ? "Active" : "Inactive"
                }
                createdOn={selectedProject.start_date}
                lastUpdated={selectedProject.end_date}
                description={selectedProject.description}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsArchivePage;
