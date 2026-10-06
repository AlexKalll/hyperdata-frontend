"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DeleteTask } from "./deleteProjectArchive";
import {
  Calendar,
  CheckSquare,
  MoreVertical,
  ArrowRight,
  Pen,
  Loader2,
} from "lucide-react";
import UpdateProjectModal from "../project/updateProjectModal";
import { formatDateMedium } from "@/app/types/dateUtils";

interface ProjectCardProps {
  title: string;
  status: string;
  cover_image_url: string | undefined;
  description: string;
  onViewProject?: () => void; // Changed from onClick to onViewProject
  isLoading?: boolean;
  id: string;
  start_date?: string;
  end_date?: string;
  manager_id?: string;
  created_by?: string;
  updated_by?: string | null;
  created_date?: string;
  updated_date?: string;
  manager: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    profile_picture: string;
    birth_date: string;
    gender: string;
    is_active: true;
    created_by: string;
    updated_by: string;
    created_date: string;
    updated_date: string;
    language_id: string;
    dialect_id: string;
    role_id: string;
    woreda: string;
    city: string;
    zone_id: string;
    region_id: string;
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  cover_image_url,
  status,
  description,
  isLoading = false,
  onViewProject, // Changed from onClick to onViewProject
  start_date,
  end_date,
  manager_id = "",
  created_by = "",
  updated_by = null,
  created_date,
  updated_date,
  manager,
}) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [isOpenDeletor, setIsOpenDeletor] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shouldShowReadMore = useMemo(() => {
    const sentenceCount = description.split(/[.!?]\s/).length;
    const charLimit = 120;
    return sentenceCount > 1 || description.length > charLimit;
  }, [description]);

  const handleMoreOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full mb-10 bg-white rounded-lg border border-gray-200 overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      <div>
        {" "}
        {/* Removed onClick from this container */}
        <img
          src={
            cover_image_url == ""
              ? "/logo/project-placeholder.svg"
              : `${process.env.NEXT_PUBLIC_API_BASE_URL}/${cover_image_url}`
          }
          alt="Project cover"
          className="h-25 w-full object-cover"
        />
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <span className="flex items-center space-x-1 text-sm text-green-600">
                <span
                  className={`h-2 w-2 rounded-full ${
                    status.toLowerCase() == "active"
                      ? "bg-green-500"
                      : "bg-purple-500"
                  }`}
                ></span>
                <span>{status}</span>
              </span>
            </div>

            <div className="relative" ref={dropdownRef}>
              <Button
                aria-label="More options"
                variant="ghost"
                size="sm"
                aria-expanded={isDropdownOpen}
                aria-controls="dropdown-menu"
                onClick={handleMoreOptionsClick}
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </Button>

              {isDropdownOpen && (
                <div
                  id="dropdown-menu"
                  className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsOpenDeletor(true);
                      }}
                      className="w-full text-left px-4 py-2 text-primary hover:bg-gray-100 flex items-center"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row">
            <div className="space-x-4 mt-2 text-sm text-gray-600 mr-4">
              <div className="flex items-center space-x-1">
                <svg
                  width="12"
                  height="13"
                  viewBox="0 0 12 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 1.41211V2.41211M3 1.41211V2.41211"
                    stroke="#667085"
                    strokeWidth="0.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.99775 6.91211H6.00225M5.99775 8.91211H6.00225M7.9955 6.91211H8M4 6.91211H4.00449M4 8.91211H4.00449"
                    stroke="#667085"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1.75 4.41211H10.25"
                    stroke="#667085"
                    strokeWidth="0.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1.25 6.53371C1.25 4.35508 1.25 3.26575 1.87606 2.58893C2.50212 1.91211 3.50975 1.91211 5.525 1.91211H6.475C8.49025 1.91211 9.4979 1.91211 10.124 2.58893C10.75 3.26575 10.75 4.35508 10.75 6.53371V6.79051C10.75 8.96916 10.75 10.0585 10.124 10.7353C9.4979 11.4121 8.49025 11.4121 6.475 11.4121H5.525C3.50975 11.4121 2.50212 11.4121 1.87606 10.7353C1.25 10.0585 1.25 8.96916 1.25 6.79051V6.53371Z"
                    stroke="#667085"
                    strokeWidth="0.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1.5 4.41211H10.5"
                    stroke="#667085"
                    strokeWidth="0.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span>{start_date ? formatDateMedium(start_date) : ""}</span>
              </div>
            </div>
          </div>

          <div>
            <p
              className={`mt-3 text-sm text-gray-600 ${showFull ? "" : "line-clamp-2"}`}
            >
              {description}
            </p>
            {shouldShowReadMore && !showFull && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFull(true);
                }}
                className="mt-1 text-blue-500 text-sm hover:underline"
              >
                Read more
              </button>
            )}
          </div>

          <div className="flex flex-row justify-end">
            <Button
              variant="outline"
              className="mt-4 space-x-1 text-primary hover:text-blue-800"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsOpenDeletor(true);
              }}
            >
              <span className="text-sm font-semibold">Restore Project</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Update Project Modal */}
      {isUpdateModalOpen && (
        <UpdateProjectModal
          onClose={() => setIsUpdateModalOpen(false)}
          projectData={{
            id,
            name: title,
            status: status,
            start_date,
            end_date,
            description,
            manager_id,
            image: null,
            created_by,
            updated_by,
            created_date,
            updated_date,
            manager,
          }}
        />
      )}

      <DeleteTask
        isOpen={isOpenDeletor}
        onClose={() => setIsOpenDeletor(false)}
        task_id={id ? id : ""}
        task_name={title}
      />
    </div>
  );
};

export default ProjectCard;
