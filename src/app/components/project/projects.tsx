// pages/Projects.tsx
"use client";
import React, { useState, useEffect } from "react";
import ProjectCard from "../project/projectCard";
import AddProjectModal from "../project/addProjectModal";
import TaskTable from "../project/taskTable";
import { NewProjectProfiles } from "@/lib/hooks/useProject";
import { ProjectDetail, Project, ProjectResponse } from "@/app/types/project";
import { useSession } from "next-auth/react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, Search, Loader2, Plus } from "lucide-react";
import { FilterComponent } from "@/components/ui/filterComponent";
import { PaginationControls } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";

interface PaginationProps {
  pageCount: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  showingText: string;
}

const ProjectsPage: React.FC = () => {
  const [filters, setFilters] = useState<{ [key: string]: string | boolean }>({});
  
  const handleFilterChange = (
    newFilters: { [key: string]: string | boolean },
    endpoint: string
  ) => {
    setFilters(newFilters);
    setPage(1);
  };
  
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [projectToUpdate, setProjectToUpdate] = useState<ProjectResponse | null>(null);
  
  const handleBackClick = () => {
    setIsTaskModalOpen(false);
    setSelectedProject(null);
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
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);
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
  } = NewProjectProfiles({
    page,
    pageSize,
    searchQuery: debouncedSearch,
    verificationStatus,
  });
  
  const router = useRouter();
  
  const handleTaskClick = (projectId: string) => {
    router.push(`/admin/projectDetail/${projectId}`);
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
  
  const handleProjectClick = (project: ProjectResponse) => {
    setSelectedProject(project);
    setIsTaskModalOpen(true);
  };

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
          <div className="flex flex-row justify-end items-center mb-6">
            <div className="relative mr-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Project..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
             
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-2 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="mr-2" />
              New Project
            </button>
          </div>

          {paginatedParojectData.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center py-12">
              <img 
                src="/empty.svg" 
                alt="No projects found" 
                className="w-64 h-64 opacity-50"
              />
              
              {/* Loading overlay for empty state */}
              {isprojectLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>
          ) : isprojectLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
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
                  tags={project.tags ? project.tags.map((tag) => tag) : null}
                />
              ))}
            </div>
          )}
          
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

          {isModalOpen && (
            <AddProjectModal onClose={() => setIsModalOpen(false)} />
          )}
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
                tags={selectedProject.tags ? selectedProject.tags.map((tag) => tag) : null}
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

export default ProjectsPage;
