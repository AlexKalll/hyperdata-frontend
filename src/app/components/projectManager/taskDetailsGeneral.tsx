"use client";
import React, { useState } from "react";
import InstructionView from "@/app/components/projectManager/instructionView";
import { TaskInstructions } from "@/app/types/project";
import { TaskResponseData } from "@/app/types/project";
import CreateTaskInstruction from "@/app/components/projectManager/createTaskInstruction";
import UpdateTAskForm from "@/app/components/projectManager/updateTaskForm";
import UpdateProjectModal from "../projectManager/updatePayment";

interface TaskCardProps {
  task: TaskResponseData;
  type: boolean;
}
const TaskDetailsGeneral: React.FC<TaskCardProps> = ({ task, type }) => {
  const [isInstructionFullScreen, setIsInstructionFullScreen] = useState(false);
  const [editTaskScreen, setEditTaskScreen] = useState(false);
  const [showCreateInstructionForm, setShowCreateInstructionForm] =
    useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<any>(null);
  const handleOpenInstruction = (instruction: TaskInstructions) => {
    setSelectedInstruction(instruction);
    setTimeout(() => {
      setIsInstructionFullScreen(true);
    }, 100);
  };
  const EditSVGPayment: React.FC = () => {
    return (
      <>
        {type ? (
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation(); // Prevent triggering the card's onClick
              setIsUpdateModalOpen(true);
            }}
          >
            <svg
              width="30"
              height="25"
              viewBox="0 0 46 24"
              fill="none"
              className="ml-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="46" height="24" rx="8" fill="white" />
              <path
                d="M15.7281 5.23796C16.3491 4.56515 16.6596 4.22875 16.9895 4.03252C17.7856 3.55905 18.7659 3.54432 19.5754 3.99368C19.9108 4.17991 20.2308 4.50685 20.8709 5.16071C21.5109 5.81458 21.831 6.14151 22.0133 6.48419C22.4532 7.31101 22.4388 8.31241 21.9753 9.12566C21.7832 9.46271 21.4539 9.7799 20.7953 10.4142L12.9589 17.962C11.7108 19.1642 11.0867 19.7652 10.3067 20.0698C9.52679 20.3745 8.66935 20.3521 6.95449 20.3072L6.72117 20.3012C6.19911 20.2875 5.93808 20.2807 5.78635 20.1084C5.6346 19.9362 5.65532 19.6703 5.69675 19.1386L5.71925 18.8498C5.83586 17.353 5.89416 16.6047 6.18645 15.9319C6.47872 15.2592 6.98289 14.713 7.99121 13.6205L15.7281 5.23796Z"
                stroke="#095FAF"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
              <path
                d="M14.8333 5.33325L20.6666 11.1666"
                stroke="#095FAF"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
              <path
                d="M15.6667 20.3333H22.3334"
                stroke="#095FAF"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <></>
        )}
      </>
    );
  };
  const EditSVG: React.FC = () => {
    return (
      <>
        {type ? (
          <button onClick={() => setEditTaskScreen(true)}>
            <svg
              width="30"
              height="25"
              viewBox="0 0 46 24"
              fill="none"
              className="ml-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="46" height="24" rx="8" fill="white" />
              <path
                d="M15.7281 5.23796C16.3491 4.56515 16.6596 4.22875 16.9895 4.03252C17.7856 3.55905 18.7659 3.54432 19.5754 3.99368C19.9108 4.17991 20.2308 4.50685 20.8709 5.16071C21.5109 5.81458 21.831 6.14151 22.0133 6.48419C22.4532 7.31101 22.4388 8.31241 21.9753 9.12566C21.7832 9.46271 21.4539 9.7799 20.7953 10.4142L12.9589 17.962C11.7108 19.1642 11.0867 19.7652 10.3067 20.0698C9.52679 20.3745 8.66935 20.3521 6.95449 20.3072L6.72117 20.3012C6.19911 20.2875 5.93808 20.2807 5.78635 20.1084C5.6346 19.9362 5.65532 19.6703 5.69675 19.1386L5.71925 18.8498C5.83586 17.353 5.89416 16.6047 6.18645 15.9319C6.47872 15.2592 6.98289 14.713 7.99121 13.6205L15.7281 5.23796Z"
                stroke="#095FAF"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
              <path
                d="M14.8333 5.33325L20.6666 11.1666"
                stroke="#095FAF"
                strokeWidth="1.25"
                strokeLinejoin="round"
              />
              <path
                d="M15.6667 20.3333H22.3334"
                stroke="#095FAF"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <></>
        )}
      </>
    );
  };
  return (
    <>
      {isInstructionFullScreen ? (
        <>
          <InstructionView
            onCancel={() => setIsInstructionFullScreen(false)}
            taskInstructions={selectedInstruction}
            open={isInstructionFullScreen}
            setOpen={setIsInstructionFullScreen}
          />
        </>
      ) : (
        <>
          {editTaskScreen ? (
            <>
              <UpdateTAskForm
                task={task}
                onCancel={() => setEditTaskScreen(false)}
              />
            </>
          ) : (
            <div className="grid grid-cols-[2fr_1fr] gap-x-[2%]">
              {/* Left Column */}
              <div
                className="py-4 bg-white overflow-y-auto"
                style={{
                  scrollbarWidth: "none" /* Firefox */,
                  msOverflowStyle: "none" /* Internet Explorer 10+ */,
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none; /* Safari and Chrome */
                  }
                `}</style>
                {/* ── Basic Information ── */}
                <div className="mb-6 p-6 border border-gray-100  rounded-lg">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 22 22"
                      fill="none"
                      className="mr-4"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.541 6.54636L19.0886 5.76114C18.7464 5.1673 18.5753 4.87038 18.2842 4.75197C17.9931 4.63358 17.6638 4.727 17.0053 4.91386L15.8868 5.22891C15.4664 5.32586 15.0253 5.27086 14.6415 5.07364L14.3327 4.89547C14.0035 4.68464 13.7504 4.3738 13.6102 4.00843L13.3041 3.09416C13.1028 2.48915 13.0022 2.18664 12.7626 2.01361C12.523 1.84058 12.2048 1.84058 11.5682 1.84058H10.5463C9.90989 1.84058 9.59162 1.84058 9.35201 2.01361C9.11243 2.18664 9.01179 2.48915 8.81052 3.09416L8.50439 4.00843C8.36425 4.3738 8.11107 4.68464 7.78191 4.89547L7.4731 5.07364C7.08925 5.27086 6.6482 5.32586 6.2278 5.22891L5.10926 4.91386C4.45078 4.727 4.12155 4.63358 3.83044 4.75197C3.53932 4.87038 3.36823 5.1673 3.02604 5.76114L2.57359 6.54636C2.25284 7.103 2.09246 7.38133 2.12359 7.67762C2.15471 7.9739 2.36942 8.21266 2.79881 8.69019L3.74393 9.74682C3.97493 10.0392 4.13893 10.5489 4.13893 11.0071C4.13893 11.4656 3.97499 11.975 3.74396 12.2676L2.79881 13.3242C2.36942 13.8018 2.15472 14.0405 2.12359 14.3368C2.09246 14.6331 2.25284 14.9114 2.57359 15.468L3.02603 16.2532C3.36822 16.847 3.53932 17.144 3.83044 17.2624C4.12155 17.3808 4.45079 17.2874 5.10928 17.1005L6.22777 16.7854C6.64823 16.6885 7.08937 16.7435 7.47327 16.9408L7.78203 17.119C8.11112 17.3298 8.36424 17.6406 8.50436 18.006L8.81052 18.9204C9.01179 19.5254 9.11243 19.8279 9.35201 20.0009C9.59162 20.1739 9.90989 20.1739 10.5463 20.1739H11.5682C12.2048 20.1739 12.523 20.1739 12.7626 20.0009C13.0022 19.8279 13.1028 19.5254 13.3041 18.9204L13.6103 18.006C13.7504 17.6406 14.0034 17.3298 14.3326 17.119L14.6414 16.9408C15.0253 16.7435 15.4664 16.6885 15.8868 16.7854L17.0053 17.1005C17.6638 17.2874 17.9931 17.3808 18.2842 17.2624C18.5753 17.144 18.7464 16.847 19.0886 16.2532L19.541 15.468C19.8618 14.9114 20.0221 14.6331 19.991 14.3368C19.9599 14.0405 19.7452 13.8018 19.3158 13.3242L18.3706 12.2676C18.1396 11.975 17.9756 11.4656 17.9756 11.0071C17.9756 10.5489 18.1397 10.0392 18.3706 9.74682L19.3158 8.69019C19.7452 8.21266 19.9599 7.9739 19.991 7.67762C20.0221 7.38133 19.8618 7.103 19.541 6.54636Z"
                        stroke="black"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M14.2262 11.0001C14.2262 12.772 12.7898 14.2084 11.0179 14.2084C9.24596 14.2084 7.80957 12.772 7.80957 11.0001C7.80957 9.22816 9.24596 7.79175 11.0179 7.79175C12.7898 7.79175 14.2262 9.22816 14.2262 11.0001Z"
                        stroke="black"
                        strokeWidth="1.8"
                      />
                    </svg>
                    Basic Information <EditSVG />
                  </h3>

                  <p className="text-sm break-words  text-gray-600 mb-4">
                    {task.description || "No description available."}
                  </p>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Task Type
                      </span>
                      <span className="text-purple-600 bg-purple-100 rounded-full px-2.5 py-0.5 mt-1 inline-block w-fit">
                        {task.taskType?.task_type || "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Language
                      </span>
                      <span className="text-gray-600 mt-1">
                        {task.language?.name || "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Contributor Test
                      </span>
                      <span
                        className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium w-fit
                    ${
                      task.require_contributor_test
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                      >
                        {task.require_contributor_test ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Public Access
                      </span>
                      <span
                        className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium w-fit
                    ${
                      task.is_public
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                      >
                        {task.is_public ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Demographics & Targeting ── */}
                <div className="mb-6 p-6 border border-gray-100  rounded-lg">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 22 22"
                      fill="none"
                      className="mr-4"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.541 6.54636L19.0886 5.76114C18.7464 5.1673 18.5753 4.87038 18.2842 4.75197C17.9931 4.63358 17.6638 4.727 17.0053 4.91386L15.8868 5.22891C15.4664 5.32586 15.0253 5.27086 14.6415 5.07364L14.3327 4.89547C14.0035 4.68464 13.7504 4.3738 13.6102 4.00843L13.3041 3.09416C13.1028 2.48915 13.0022 2.18664 12.7626 2.01361C12.523 1.84058 12.2048 1.84058 11.5682 1.84058H10.5463C9.90989 1.84058 9.59162 1.84058 9.35201 2.01361C9.11243 2.18664 9.01179 2.48915 8.81052 3.09416L8.50439 4.00843C8.36425 4.3738 8.11107 4.68464 7.78191 4.89547L7.4731 5.07364C7.08925 5.27086 6.6482 5.32586 6.2278 5.22891L5.10926 4.91386C4.45078 4.727 4.12155 4.63358 3.83044 4.75197C3.53932 4.87038 3.36823 5.1673 3.02604 5.76114L2.57359 6.54636C2.25284 7.103 2.09246 7.38133 2.12359 7.67762C2.15471 7.9739 2.36942 8.21266 2.79881 8.69019L3.74393 9.74682C3.97493 10.0392 4.13893 10.5489 4.13893 11.0071C4.13893 11.4656 3.97499 11.975 3.74396 12.2676L2.79881 13.3242C2.36942 13.8018 2.15472 14.0405 2.12359 14.3368C2.09246 14.6331 2.25284 14.9114 2.57359 15.468L3.02603 16.2532C3.36822 16.847 3.53932 17.144 3.83044 17.2624C4.12155 17.3808 4.45079 17.2874 5.10928 17.1005L6.22777 16.7854C6.64823 16.6885 7.08937 16.7435 7.47327 16.9408L7.78203 17.119C8.11112 17.3298 8.36424 17.6406 8.50436 18.006L8.81052 18.9204C9.01179 19.5254 9.11243 19.8279 9.35201 20.0009C9.59162 20.1739 9.90989 20.1739 10.5463 20.1739H11.5682C12.2048 20.1739 12.523 20.1739 12.7626 20.0009C13.0022 19.8279 13.1028 19.5254 13.3041 18.9204L13.6103 18.006C13.7504 17.6406 14.0034 17.3298 14.3326 17.119L14.6414 16.9408C15.0253 16.7435 15.4664 16.6885 15.8868 16.7854L17.0053 17.1005C17.6638 17.2874 17.9931 17.3808 18.2842 17.2624C18.5753 17.144 18.7464 16.847 19.0886 16.2532L19.541 15.468C19.8618 14.9114 20.0221 14.6331 19.991 14.3368C19.9599 14.0405 19.7452 13.8018 19.3158 13.3242L18.3706 12.2676C18.1396 11.975 17.9756 11.4656 17.9756 11.0071C17.9756 10.5489 18.1397 10.0392 18.3706 9.74682L19.3158 8.69019C19.7452 8.21266 19.9599 7.9739 19.991 7.67762C20.0221 7.38133 19.8618 7.103 19.541 6.54636Z"
                        stroke="black"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M14.2262 11.0001C14.2262 12.772 12.7898 14.2084 11.0179 14.2084C9.24596 14.2084 7.80957 12.772 7.80957 11.0001C7.80957 9.22816 9.24596 7.79175 11.0179 7.79175C12.7898 7.79175 14.2262 9.22816 14.2262 11.0001Z"
                        stroke="black"
                        strokeWidth="1.8"
                      />
                    </svg>
                    Demographics & Targeting <EditSVG />
                  </h3>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Age Range
                      </span>
                      <span className="text-gray-600 mt-1">
                        {task.taskRequirement?.age?.min ?? "–"} –{" "}
                        {task.taskRequirement?.age?.max ?? "–"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Gender
                      </span>
                      <span className="text-gray-600 mt-1">
                        Female {task.taskRequirement?.gender?.female ?? "  "}%,
                        Male {task.taskRequirement?.gender?.male ?? "   "}%
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Dialect Specific
                      </span>
                      <span
                        className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium w-fit
                    ${
                      task.taskRequirement.is_dialect_specific
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                      >
                        {task.taskRequirement.is_dialect_specific
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>

                    <div className="flex flex-col ">
                      <span className="font-semibold text-gray-800">
                        Dialect(s)
                      </span>
                      <div className="flex ">
                        <span className=" text-gray-600 mt-1 bg-gray-200 px-2 py-1 rounded-2xl">
                          {task.taskRequirement?.dialects
                            ?.map((d) => d.name)
                            .join(", ") || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Location & Sectors ── */}
                <div className="mb-6 p-6 border border-gray-100  rounded-lg">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 22 23"
                      fill="none"
                      className="mr-4"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.4829 20.1071C12.0854 20.4793 11.554 20.6873 11.001 20.6873C10.448 20.6873 9.91668 20.4793 9.51913 20.1071C5.8786 16.6778 0.999864 12.847 3.37908 7.28536C4.66549 4.27823 7.75348 2.354 11.001 2.354C14.2486 2.354 17.3366 4.27823 18.623 7.28536C20.9992 12.84 16.1324 16.6897 12.4829 20.1071Z"
                        stroke="black"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M14.2083 10.604C14.2083 12.3759 12.7719 13.8123 11 13.8123C9.22807 13.8123 7.79166 12.3759 7.79166 10.604C7.79166 8.83205 9.22807 7.39563 11 7.39563C12.7719 7.39563 14.2083 8.83205 14.2083 10.604Z"
                        stroke="black"
                        strokeWidth="1.8"
                      />
                    </svg>
                    Location & Sectors <EditSVG />
                  </h3>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Location Specific
                      </span>
                      <span
                        className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium w-fit
                    ${
                      task.taskRequirement.is_location_specific
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                      >
                        {task.taskRequirement.is_location_specific
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Location(s)
                      </span>
                      <span className="text-gray-600 mt-1">
                        {Array.isArray(task.taskRequirement?.locations)
                          ? task.taskRequirement.locations
                              .map((l) => l.name)
                              .join(", ") || "N/A"
                          : task.taskRequirement?.locations &&
                              typeof task.taskRequirement.locations ===
                                "object" &&
                              "name" in task.taskRequirement.locations
                            ? (
                                task.taskRequirement.locations as {
                                  name: string;
                                }
                              ).name
                            : "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Sector Specific
                      </span>
                      <span
                        className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium w-fit
                    ${
                      task.taskRequirement.is_sector_specific
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                      >
                        {task.taskRequirement.is_sector_specific ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Sector(s)
                      </span>
                      <span className="text-gray-600 mt-1">
                        {task.taskRequirement?.sectors
                          ?.map((s) => s.name)
                          .join(", ") || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mb-6 p-6 border border-gray-100  rounded-lg">
                  <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      className="mr-4"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16 14C16 14.8284 16.6716 15.5 17.5 15.5C18.3284 15.5 19 14.8284 19 14C19 13.1716 18.3284 12.5 17.5 12.5C16.6716 12.5 16 13.1716 16 14Z"
                        stroke="black"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M18.9 8C18.9656 7.67689 19 7.34247 19 7C19 4.23858 16.7614 2 14 2C11.2386 2 9 4.23858 9 7C9 7.34247 9.03443 7.67689 9.10002 8"
                        stroke="black"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M7 7.99324H16C18.8284 7.99324 20.2426 7.99324 21.1213 8.87234C22 9.75145 22 11.1663 22 13.9961V15.9971C22 18.8269 22 20.2418 21.1213 21.1209C20.2426 22 18.8284 22 16 22H10C6.22876 22 4.34315 22 3.17157 20.8279C2 19.6557 2 17.7692 2 13.9961V11.9952C2 8.22211 2 6.33558 3.17157 5.16344C4.11466 4.2199 5.52043 4.03589 8 4H10"
                        stroke="black"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>{" "}
                    Payment
                    <EditSVGPayment />
                  </h3>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Contributor credit (credits per microtask)
                      </span>
                      <span className="text-gray-600 mt-1">
                        {task.payment?.contributor_credit_per_microtask ||
                          "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        Reviewer credit (credits per microtask)
                      </span>
                      <span className="text-gray-600 mt-1">
                        {task.payment?.reviewer_credit_per_microtask || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div
                className="mb-4 bg-white overflow-y-auto overflow-x-hidden"
                style={{
                  scrollbarWidth: "none" /* Firefox */,
                  msOverflowStyle: "none" /* Internet Explorer 10+ */,
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none; /* Safari and Chrome */
                  }
                `}</style>
                <div
                  className="mt-6 p-6 border border-gray-100 rounded-lg overflow-auto"
                  style={{
                    scrollbarWidth: "none" /* Firefox */,
                    msOverflowStyle: "none" /* Internet Explorer 10+ */,
                  }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Task Instruction
                  </h3>
                  {type ? (
                    <>
                      <CreateTaskInstruction
                        open={showCreateInstructionForm}
                        setOpen={setShowCreateInstructionForm}
                        taskId={task.id}
                        onCancel={() => setShowCreateInstructionForm(false)}
                      />

                      <button
                        onClick={() => setShowCreateInstructionForm(true)}
                        className="border mb-2 border-gray-300 hover:border-blue-500 text-primary px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <span className="text-xl">+</span>
                        <span>Add Instruction</span>
                      </button>
                    </>
                  ) : (
                    <></>
                  )}
                  <div className="  mb-4">
                    {task.taskInstructions?.length > 0 ? (
                      task.taskInstructions.map((instruction) => (
                        <div
                          key={instruction.id}
                          className="border mb-2 border-gray-300 rounded-lg px-2 py-2  space-x-2"
                        >
                          <span className="text-sm flex-wrap text-gray-700 break-words">
                            {instruction.title}
                          </span>
                          <button
                            onClick={() => handleOpenInstruction(instruction)}
                            style={{ touchAction: "manipulation" }}
                          >
                            <svg
                              width="25"
                              height="25"
                              viewBox="0 0 35 35"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                width="34.1091"
                                height="34.1091"
                                rx="5.81818"
                                fill="#095FAF"
                                fillOpacity="0.1"
                              />
                              <path
                                d="M17.8651 12.4641L22.2629 13.635M16.9236 15.9611L19.1216 16.547M17.0332 22.5505L17.9121 22.7854C20.3993 23.4487 21.643 23.7794 22.6231 23.2165C23.6024 22.6546 23.9359 21.4174 24.6019 18.9449L25.5443 15.447C26.2113 12.9736 26.5438 11.7373 25.9782 10.7627C25.4126 9.78802 24.1698 9.4573 21.6817 8.79495L20.8028 8.56004C18.3155 7.89677 17.0719 7.56606 16.0927 8.12892C15.1125 8.69086 14.779 9.92804 14.1121 12.4006L13.1706 15.8984C12.5036 18.3719 12.1701 19.6081 12.7367 20.5828C13.3023 21.5565 14.5459 21.8881 17.0332 22.5505Z"
                                stroke="#095FAF"
                                strokeWidth="1.65818"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M17.0544 25.2957L16.1774 25.5352C13.6957 26.2105 12.4557 26.5486 11.4774 25.9747C10.5009 25.4017 10.1674 24.1414 9.50325 21.6192L8.5627 18.0522C7.89758 15.5309 7.56502 14.2697 8.12973 13.2767C8.61797 12.4172 9.68473 12.4485 11.0666 12.4485"
                                stroke="#095FAF"
                                strokeWidth="1.65818"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No instructions added.
                      </p>
                    )}
                  </div>
                </div>
                {/* Task Configuration */}
                <div className="mt-6 p-6 border border-gray-100 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 18 21"
                      fill="none"
                      className="mr-4"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.20837 7.89316C1.20837 4.70958 1.20837 3.11733 2.14796 2.12824C3.08754 1.13916 4.60004 1.13916 7.62504 1.13916H10.375C13.4 1.13916 14.9125 1.13916 15.8521 2.12916C16.7917 3.11641 16.7917 4.70866 16.7917 7.89224V12.7176C16.7917 15.9012 16.7917 17.4934 15.8521 18.4825C14.9125 19.4716 13.4 19.4725 10.375 19.4725H7.62504C4.60004 19.4725 3.08754 19.4725 2.14796 18.4825C1.20837 17.4952 1.20837 15.903 1.20837 12.7194V7.89316Z"
                        stroke="black"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5.33337 1.13916L5.40854 1.59108C5.59187 2.68833 5.68354 3.23741 6.06854 3.56374C6.45171 3.88916 7.00812 3.88916 8.12096 3.88916H9.87821C10.9901 3.88916 11.5465 3.88916 11.9315 3.56374C12.3165 3.23741 12.4082 2.68833 12.5906 1.59108L12.6667 1.13916M5.33337 13.9725H9.00004M5.33337 9.38916H12.6667"
                        stroke="black"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Task Configuration <EditSVG />
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        Batch size (microtasks/batch):
                      </span>
                      <span className="text-gray-600 p-1">
                        {task.taskRequirement.batch}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">
                          Approximate time per batch (minutes):
                      </span>
                      <span className="text-gray-600 p-1">
                        {task.taskRequirement.appriximate_time_per_batch}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        Maximum contributors per facilitator (contributors/facilitator):
                      </span>
                      <span className="text-gray-600 p-1">
                        {task.taskRequirement.max_contributor_per_facilitator}
                      </span>
                    </div>
                    {task.taskType.task_type === "text-audio" && (
                      <>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            Maximum audio length (seconds):
                          </span>
                          <span className="text-gray-600 p-1">
                            {task.taskRequirement.maximum_seconds}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            Minimum audio length (seconds):
                          </span>
                          <span className="text-gray-600 p-1">
                            {task.taskRequirement.minimum_seconds}
                          </span>
                        </div>
                      </>
                    )}
                    {task.taskType.task_type != "text-audio" && (
                      <>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            Maximum character length (characters):
                          </span>
                          <span className="text-gray-600 p-1">
                            {task.taskRequirement.maximum_characters_length}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            Minimum character length (characters):
                          </span>
                          <span className="text-gray-600 p-1">
                            {task.taskRequirement.minimum_characters_length}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">
                          Reviewer completion time (days)
                      </span>
                      <span className="text-gray-600 p-1">
                        {task.reviewer_completion_time_limit != null
                          ? `${task.reviewer_completion_time_limit} day${task.reviewer_completion_time_limit === 1 ? "" : "s"}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">
                          Contributor completion time (days):
                      </span>
                      <span className="text-gray-600 p-1">
                        {task.contributor_completion_time_limit != null
                          ? `${Math.round(task.contributor_completion_time_limit / 24)} day${Math.round(task.contributor_completion_time_limit / 24) === 1 ? "" : "s"}`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">
                          Maximum contributors per microtask (contributors/microtask):
                      </span>
                      <span className="text-gray-600 p-1">
                        {task?.taskRequirement
                          ?.max_contributor_per_micro_task || ""}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">
                          Maximum microtasks per contributor (microtasks/contributor):
                      </span>
                      <span className="text-gray-600 p-1">
                        {task?.taskRequirement
                          ?.max_micro_task_per_contributor || ""}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">
                          Maximum datasets per reviewer (datasets/reviewer):
                      </span>
                      <span className="text-gray-600 p-1">
                        {task?.taskRequirement?.max_dataset_per_reviewer || ""}
                      </span>
                    </div>
                    {/* <div className="flex flex-col">
                      <span className="font-medium">
                        Expected total contributors:
                      </span>
                      <span className="text-gray-600 p-1">
                        {task?.taskRequirement
                          ?.expected_number_of_total_contributors || "50"}
                      </span>
                    </div> */}
                    <div className="flex flex-col">
                      <span className="font-medium">
                          Maximum retries per microtask (retries/microtask):
                      </span>
                      <span className="text-gray-600 p-1">
                        {task.taskRequirement.max_retry_per_task}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {isUpdateModalOpen && (
                <UpdateProjectModal
                  onClose={() => setIsUpdateModalOpen(false)}
                  task={task}
                />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};
export default TaskDetailsGeneral;
