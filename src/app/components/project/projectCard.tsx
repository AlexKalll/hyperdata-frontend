"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DeleteTask } from "./deleteProject";
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
  tags?: string[] | null;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  tags,
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
                        setIsUpdateModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-primary hover:bg-gray-100 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="mr-2"
                      >
                        <path
                          d="M11.7282 3.23796C12.3492 2.56515 12.6597 2.22875 12.9896 2.03252C13.7857 1.55905 14.766 1.54432 15.5754 1.99368C15.9108 2.17991 16.2308 2.50685 16.8709 3.16071C17.511 3.81458 17.8311 4.14151 18.0133 4.48419C18.4532 5.31101 18.4388 6.31241 17.9753 7.12566C17.7832 7.46271 17.4539 7.7799 16.7953 8.41425L8.95892 15.962C7.71082 17.1642 7.08675 17.7652 6.3068 18.0698C5.52685 18.3745 4.66942 18.3521 2.95455 18.3072L2.72123 18.3012C2.19917 18.2875 1.93814 18.2807 1.78641 18.1084C1.63467 17.9362 1.65538 17.6703 1.69682 17.1386L1.71932 16.8498C1.83592 15.353 1.89422 14.6047 2.18651 13.9319C2.47878 13.2592 2.98295 12.713 3.99127 11.6205L11.7282 3.23796Z"
                          stroke="#095FAF"
                          strokeWidth="1.25"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10.8333 3.33325L16.6666 9.16659"
                          stroke="#095FAF"
                          strokeWidth="1.25"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M11.6667 18.3333H18.3334"
                          stroke="#095FAF"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsOpenDeletor(true);
                      }}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 flex items-center"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2"
                      >
                        <path
                          d="M4.24996 8.99967H13.4166M16.2812 8.99967C16.2812 10.975 15.4965 12.8694 14.0998 14.2661C12.703 15.6629 10.8086 16.4476 8.83329 16.4476C6.85798 16.4476 4.96358 15.6629 3.56682 14.2661C2.17006 12.8694 1.38538 10.975 1.38538 8.99967C1.38538 7.02436 2.17006 5.12996 3.56682 3.7332C4.96358 2.33645 6.85798 1.55176 8.83329 1.55176C10.8086 1.55176 12.703 2.33645 14.0998 3.7332C15.4965 5.12996 16.2812 7.02436 16.2812 8.99967Z"
                          stroke="#D03710"
                          strokeWidth="1.25"
                        />
                      </svg>
                      Delete Project
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
          <div className="mt-2 mb-2">
            {Array.isArray(tags) && tags.length > 0 ? (
              tags.length < 3 ? (
                <span className="flex flex-row">
                  <span className="px-1 py-0.5 text-sm bg-[#F3F3F3] rounded-2xl flex items-center mr-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.209 2.91699C10.6922 2.91699 11.084 3.30874 11.084 3.79199C11.084 4.27524 10.6922 4.66699 10.209 4.66699C9.72574 4.66699 9.33398 4.27524 9.33398 3.79199C9.33398 3.30874 9.72574 2.91699 10.209 2.91699Z"
                        stroke="#667085"
                        strokeWidth="0.875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M1.61745 6.5007C1.03237 7.15403 1.02012 8.13986 1.55678 8.83403C2.59921 10.1872 3.81208 11.4001 5.16528 12.4425C5.85945 12.9792 6.84528 12.9669 7.49862 12.3819C9.2647 10.8021 10.9242 9.10712 12.4663 7.30803C12.622 7.12909 12.7178 6.90597 12.7405 6.66986C12.8361 5.6222 13.0339 2.60403 12.2143 1.78503C11.3947 0.966029 8.37712 1.1632 7.32945 1.25945C7.09335 1.28207 6.87022 1.37793 6.69128 1.53361C4.89221 3.07549 3.19722 4.73481 1.61745 6.5007Z"
                        stroke="#667085"
                        strokeWidth="0.875"
                      />
                      <path
                        d="M4.08398 8.16699L5.83398 9.91699"
                        stroke="#667085"
                        strokeWidth="0.875"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <span className="ml-1"> {tags[0]}</span>
                  </span>
                  {tags[1] && (
                    <span>
                      <span className="px-1 py-0.5 text-sm bg-[#F3F3F3] rounded-2xl flex items-center mr-2">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.209 2.91699C10.6922 2.91699 11.084 3.30874 11.084 3.79199C11.084 4.27524 10.6922 4.66699 10.209 4.66699C9.72574 4.66699 9.33398 4.27524 9.33398 3.79199C9.33398 3.30874 9.72574 2.91699 10.209 2.91699Z"
                            stroke="#667085"
                            strokeWidth="0.875"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M1.61745 6.5007C1.03237 7.15403 1.02012 8.13986 1.55678 8.83403C2.59921 10.1872 3.81208 11.4001 5.16528 12.4425C5.85945 12.9792 6.84528 12.9669 7.49862 12.3819C9.2647 10.8021 10.9242 9.10712 12.4663 7.30803C12.622 7.12909 12.7178 6.90597 12.7405 6.66986C12.8361 5.6222 13.0339 2.60403 12.2143 1.78503C11.3947 0.966029 8.37712 1.1632 7.32945 1.25945C7.09335 1.28207 6.87022 1.37793 6.69128 1.53361C4.89221 3.07549 3.19722 4.73481 1.61745 6.5007Z"
                            stroke="#667085"
                            strokeWidth="0.875"
                          />
                          <path
                            d="M4.08398 8.16699L5.83398 9.91699"
                            stroke="#667085"
                            strokeWidth="0.875"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="ml-1">{tags[1]}</span>
                      </span>
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  <span>
                    <span className="px-1 py-0.5 text-sm bg-[#F3F3F3]rounded-2xl flex items-center mr-2">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.209 2.91699C10.6922 2.91699 11.084 3.30874 11.084 3.79199C11.084 4.27524 10.6922 4.66699 10.209 4.66699C9.72574 4.66699 9.33398 4.27524 9.33398 3.79199C9.33398 3.30874 9.72574 2.91699 10.209 2.91699Z"
                          stroke="#667085"
                          strokeWidth="0.875"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M1.61745 6.5007C1.03237 7.15403 1.02012 8.13986 1.55678 8.83403C2.59921 10.1872 3.81208 11.4001 5.16528 12.4425C5.85945 12.9792 6.84528 12.9669 7.49862 12.3819C9.2647 10.8021 10.9242 9.10712 12.4663 7.30803C12.622 7.12909 12.7178 6.90597 12.7405 6.66986C12.8361 5.6222 13.0339 2.60403 12.2143 1.78503C11.3947 0.966029 8.37712 1.1632 7.32945 1.25945C7.09335 1.28207 6.87022 1.37793 6.69128 1.53361C4.89221 3.07549 3.19722 4.73481 1.61745 6.5007Z"
                          stroke="#667085"
                          strokeWidth="0.875"
                        />
                        <path
                          d="M4.08398 8.16699L5.83398 9.91699"
                          stroke="#667085"
                          strokeWidth="0.875"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span className="ml-1"> {tags[0]}</span>
                    </span>
                    {tags[1] && (
                      <span>
                        <span className="px-1 py-0.5 text-sm bg-[#F3F3F3] rounded-2xl flex items-center mr-2">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.209 2.91699C10.6922 2.91699 11.084 3.30874 11.084 3.79199C11.084 4.27524 10.6922 4.66699 10.209 4.66699C9.72574 4.66699 9.33398 4.27524 9.33398 3.79199C9.33398 3.30874 9.72574 2.91699 10.209 2.91699Z"
                              stroke="#667085"
                              strokeWidth="0.875"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M1.61745 6.5007C1.03237 7.15403 1.02012 8.13986 1.55678 8.83403C2.59921 10.1872 3.81208 11.4001 5.16528 12.4425C5.85945 12.9792 6.84528 12.9669 7.49862 12.3819C9.2647 10.8021 10.9242 9.10712 12.4663 7.30803C12.622 7.12909 12.7178 6.90597 12.7405 6.66986C12.8361 5.6222 13.0339 2.60403 12.2143 1.78503C11.3947 0.966029 8.37712 1.1632 7.32945 1.25945C7.09335 1.28207 6.87022 1.37793 6.69128 1.53361C4.89221 3.07549 3.19722 4.73481 1.61745 6.5007Z"
                              stroke="#667085"
                              strokeWidth="0.875"
                            />
                            <path
                              d="M4.08398 8.16699L5.83398 9.91699"
                              stroke="#667085"
                              strokeWidth="0.875"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="ml-1">{tags[1]}</span>
                        </span>
                      </span>
                    )}
                  </span>
                  {` +${tags.length - 2} more`}
                </span>
              )
            ) : (
              <span></span> // or "-" if you want placeholder
            )}
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
            <button
              className="mt-4 space-x-1 text-primary hover:text-blue-800"
              onClick={onViewProject} // Added onClick to the View Project button
            >
              <span className="text-sm font-semibold">
                View Project &#8594;
              </span>
            </button>
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
            tags: tags || [],
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
