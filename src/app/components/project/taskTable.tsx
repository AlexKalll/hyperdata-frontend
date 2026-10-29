import React, { useState } from "react";
import {
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Search,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2,
  X,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { renderPaginationButtons } from "@/components/ui/paginationHelper";
import { Input } from "@/components/ui/input";
// import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useGetProjectTask } from "@/lib/hooks/useProject";
import { useAssignProjectManager } from "@/lib/hooks/useProject";
import { useRouter } from "next/navigation";
import { userRoleProfiles } from "@/lib/hooks/useFetchUser";
import TaskCard from "./taskCard";
import { Task, TaskCardType } from "@/app/types/project";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialogLeft";
import { UserTask } from "@/app/types/global";
import { useAddSingleMicroTask } from "@/lib/hooks/useMicrotask";
import { formatDateMedium } from "@/app/types/dateUtils";
import { toast } from "sonner";

interface User {
  fullName: string;
  role: string;
  status: "Active" | "Inactive";
  user: {
    id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
  };
}

interface TaskTableProps {
  tags?: string[] | null;
  projectId: string;
  cover_image_url: string | undefined;
  projectTitle: string;
  projectStatus: "Active" | "Inactive";
  createdOn: string;
  lastUpdated: string;
  description: string;
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

interface PaginationProps {
  pageCount: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  showingText: string;
}

// Using unified userRoleProfiles hook for project manager search

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
        {renderPaginationButtons({
          currentPage: pagination.page,
          totalPages: pagination.pageCount,
          onPageChange: pagination.setPage,
        })}
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

const TaskTable: React.FC<TaskTableProps> = ({
  projectId,
  projectTitle,
  cover_image_url,
  projectStatus,
  createdOn,
  lastUpdated,
  description,
  manager,
  tags,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "Overiew" | "Task Details" | "Project Details" | "Micro Tasks" | "Users"
  >("Micro Tasks");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectManagers: [] as string[],
    project_id: projectId,
  });
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize, setTaskPageSize] = useState(10);
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<string>();
  const debouncedTaskSearch = useDebounce(taskSearchQuery, 500);
  const debouncedUserSearch = useDebounce(userSearchQuery, 500);
  const { data: tasksData, isLoading: isTaskLoading } = useGetProjectTask({
    taskPage,
    taskPageSize,
    searchQuery: debouncedTaskSearch,
    projectId,
    verificationStatus,
  });
  const addProjectManagerMutation = useAssignProjectManager();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addProjectManagerMutation.mutateAsync({
        email: formData.projectManagers[0],
        project_id: projectId,
      });
    } catch (error) {
      toast.error("Failed to assign project manager.");
    }
  };
  // Fetch tasks
  const [searchQuery, setSearchQuery] = useState("");
  // Fetch users
  const { data: usersData, isLoading: isUserLoading } = userRoleProfiles({
    page: userPage,
    pageSize: userPageSize,
    searchQuery: debouncedUserSearch,
    verificationStatus,
    role: "project_manager",
  });

  const tasks: TaskCardType[] = tasksData?.data?.result || [];
  const taskTotalElements = tasksData?.data?.total || 0;
  const taskTotalPages = tasksData?.data?.totalPages || 1;
  const taskStartRecord = tasks.length ? (taskPage - 1) * taskPageSize + 1 : 0;
  const taskEndRecord = Math.min(taskPage * taskPageSize, taskTotalElements);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const users: any[] = usersData?.data?.result || [];
  const userTotalElements = usersData?.data?.total || 0;
  const userTotalPages = usersData?.data?.totalPages || 1;
  const userStartRecord = users.length ? (userPage - 1) * userPageSize + 1 : 0;
  const userEndRecord = Math.min(userPage * userPageSize, userTotalElements);
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const [manualEmail, setManualEmail] = useState("");
  const handleRemoveManager = (email: string) => {
    setFormData((prev) => ({ ...prev, projectManagers: [] }));
  };
  const handleAddManager = (user: { id: string; email: string }) => {
    setFormData((prev) => ({ ...prev, projectManagers: [user.email] }));
    setSearchQuery("");
    setShowUserDropdown(false);
  };
  const handleAddManualEmail = () => {
    if (validateEmail(manualEmail)) {
      setFormData((prev) => ({ ...prev, projectManagers: [manualEmail] }));
      setManualEmail("");
      setShowUserDropdown(false);
    } else {
      toast.error("Please enter a valid email address.");
    }
  };
  const handleTaskClick = (taskId: string) => {
    // For Next.js App Router (src/app directory)
    router.push(`/admin/tasks/${taskId}`);
  };
  // Columns for Users Table (unchanged)
  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: "fullName",
      header: "Full Name",
      enableSorting: true,
    },
    {
      accessorKey: "role",
      header: "Role",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => (
        // <span className="flex items-center space-x-1">
        //   <span
        //     className={`h-2 w-2 rounded-full ${
        //       row.original.status?.toLowerCase() === "active"
        //         ? "bg-[#037847]"
        //         : "bg-purple-500"
        //     }`}
        //   ></span>
        //   <span>{row.original.status}</span>
        // </span>
        <div
          className={`flex items-center space-x-1 px-2 py-2 rounded-2xl ${
            row.original.status.toLowerCase() === "active"
              ? "bg-red-500"
              : "bg-[#ECFDF3]"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              row.original.status.toLowerCase() === "active"
                ? "bg-red-500"
                : "bg-[#037847]"
            }`}
          ></span>
          <span
            className={`text-xs text-gray-600 ${
              row.original.status.toLowerCase() === "active"
                ? "text-red-500"
                : "text-[#037847]"
            }`}
          >
            {row.original.status.toLowerCase() === "active"
              ? "Inactive"
              : "Active"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "",
      cell: () => (
        <div className="flex space-x-2">
          <button aria-label="View user">
            <Eye className="h-4 w-4 text-gray-500" />
          </button>
          <button aria-label="More options">
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      ),
    },
  ];

  const userTable = useReactTable({
    data: users,
    columns: userColumns,
    state: {
      sorting,
      pagination: { pageIndex: userPage - 1, pageSize: userPageSize },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: userTotalElements,
  });

  return (
    <div className="w-full max-w-full p-1">
      {/* Header */}

      <div className="flex items-center mb-4 flex-row justify-start">
        <img
          src={
            cover_image_url == ""
              ? "/noCover.png"
              : `${process.env.NEXT_PUBLIC_API_BASE_URL}/${cover_image_url}`
          }
          alt="Project"
          className="h-25 w-40 object-cover mr-4 rounded-lg"
        />
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-800">
              {projectTitle}
            </h2>

            <span className="flex items-center space-x-1 px-2 py-2 rounded-2xl   bg-[#ECFDF3] text-[#037847]rounded-md text-sm">
              <span
                className={`h-2 w-2 mr-1  rounded-full ${
                  projectStatus?.toLowerCase() === "active"
                    ? "bg-[#037847]"
                    : "bg-red-500"
                }`}
              ></span>
              {projectStatus}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Created on {createdOn ? formatDateMedium(createdOn) : ""} • Last
            Update {lastUpdated ? formatDateMedium(lastUpdated) : ""}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 mb-4">
        <nav className="flex space-x-4">
          {/* <button
            onClick={() => setActiveTab("Overiew")}
            className={`py-2 px-4 text-sm text-gray-500 ${
              activeTab === "Task Details"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button> */}
          <button
            onClick={() => setActiveTab("Project Details")}
            className={`py-2 px-4 text-sm text-gray-500 ${
              activeTab === "Project Details"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Project Details
          </button>
          <button
            onClick={() => setActiveTab("Micro Tasks")}
            className={`py-2 px-4 text-sm text-gray-500 ${
              activeTab === "Micro Tasks"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Tasks
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "Project Details" && (
        <div className="grid grid-cols-[2fr_1fr] gap-x-[5%]">
          <div className="border border-gray-100 rounded-lg p-4 bg-white hover:shadow-md transition-shadow overflow-y-auto overflow-x-auto scrollbar-hide">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                General Details
              </h3>
              <div className="mt-2 mb-2">
                {Array.isArray(tags) && tags.length > 0 ? (
                  <div className="flex flex-wrap">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-1 py-0.5 text-sm bg-[#F3F3F3] rounded-2xl flex items-center mr-2"
                      >
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

                        <span className="ml-1"> {tag}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <></>
                )}
              </div>
              <p className="text-sm text-gray-600">{description}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <div>
                  <span className="text-gray-500">Status:</span>{" "}
                  <span className="text-green-600">{projectStatus}</span>
                </div>

                <div>
                  <span className="text-gray-500">Created On:</span>{" "}
                  {createdOn ? formatDateMedium(createdOn) : ""}
                </div>
              </div>
            </div>
          </div>
          <div className="border border-gray-100 rounded-lg p-4 bg-white hover:shadow-md transition-shadow overflow-y-auto overflow-x-auto scrollbar-hide">
            <p className="text-lg text-gray-600">Assigned Project Manager</p>

            <div className="space-y-1 pb-4 flex-row flex items-center gap-4 mt-7">
              <img
                src={
                  manager?.profile_picture == null
                    ? "/default-avatar.png"
                    : `${process.env.NEXT_PUBLIC_API_BASE_URL}/${manager?.profile_picture}`
                }
                alt="User"
                className="w-17 h-17 mt-2 mb-2 rounded-full"
              />

              <div>
                <h2 className="text-xl font-semibold">
                  {manager.first_name} {manager.last_name}
                </h2>

                <span className="overflow-x-auto scrollbar-hide text-gray-600">
                  {manager.email}
                </span>
                <span className="overflow-x-auto scrollbar-hide text-gray-600">
                  {manager.phone_number}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mt-3 mb-3 px-2 ">
                <div className="flex flex-col items-start ">
                  <span className="text-gray-500">Status:</span>
                  <Badge variant={manager.is_active ? "active" : "deactivated"}>
                    {manager.is_active ? "active" : "deactivated"}
                  </Badge>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-gray-500">Phone number</span>
                  <span className="text-gray-500">
                    <Badge className="bg-white"></Badge>
                    {manager.phone_number}
                  </span>
                </div>
              </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="ml-2 bg-white text-primary !border-primary hover:bg-gray-100 rounded-lg px-4 py-2"
                >
                  {" "}
                  <svg
                    width="20"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.2497 3.88106V8.04773M18.333 5.9644H14.1663M4.31632 13.2944C3.26799 13.9094 0.520488 15.1636 2.19382 16.7327C3.01215 17.4994 3.92215 18.0477 5.06715 18.0477H11.5988C12.7438 18.0477 13.6547 17.4994 14.4713 16.7327C16.1455 15.1636 13.398 13.9086 12.3497 13.2944C11.1293 12.5869 9.74364 12.2143 8.33299 12.2143C6.92233 12.2143 5.53671 12.5869 4.31632 13.2944ZM11.6663 6.38106C11.6663 7.26512 11.3151 8.11296 10.69 8.73809C10.0649 9.36321 9.21704 9.7144 8.33299 9.7144C7.44893 9.7144 6.60109 9.36321 5.97597 8.73809C5.35084 8.11296 4.99965 7.26512 4.99965 6.38106C4.99965 5.49701 5.35084 4.64916 5.97597 4.02404C6.60109 3.39892 7.44893 3.04773 8.33299 3.04773C9.21704 3.04773 10.0649 3.39892 10.69 4.02404C11.3151 4.64916 11.6663 5.49701 11.6663 6.38106Z"
                      stroke="#095FAF"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>{" "}
                  Reassign Project Manager
                </Button>
              </DialogTrigger>
              <DialogContent>
                <div className="mb-4 border border-gray-100 rounded-md p-3">
                  <div className="mb-3">
                    <input
                      type="email"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="Enter email manually..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualEmail}
                      className="mt-2 w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                    >
                      Add Email
                    </button>
                    <div className="mt-4">
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Search project managers..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {isUserLoading ? (
                    <div className="text-center py-4">Loading users...</div>
                  ) : (usersData?.data?.result ?? []).length > 0 ? (
                    <div className="max-h-40 overflow-y-auto scrollbar-hide">
                      {usersData?.data?.result?.map((user: any) => (
                        <div
                          key={user.id}
                          onClick={() => handleAddManager(user)}
                          className={`flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer ${
                            formData.projectManagers.includes(user.email)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {user.name?.charAt(0) || user.email?.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-500 ">
                              {user.first_name || "No name"}{" "}
                              {user.last_name || ""}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                          {formData.projectManagers.includes(user.email) && (
                            <div className="ml-auto text-blue-500">
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative flex flex-col items-center justify-center py-8">
                      <img 
                        src="/empty.svg" 
                        alt="No users found" 
                        className="w-32 h-32 opacity-50"
                      />
                    </div>
                  )}
                </div>

                {formData.projectManagers[0] && (
                  <div className="space-y-2 mb-4">
                    {(() => {
                      const email = formData.projectManagers[0];
                      const user = usersData?.data?.result?.find(
                        (u: any) => u.email === email
                      );
                      return (
                        <div className="flex items-center justify-between bg-blue-50 p-2 rounded-md">
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                              {user?.email?.charAt(0) || email.charAt(0)}
                            </span>
                            <div>
                              <p className="text-sm text-gray-700">
                                {user?.email || email}
                              </p>
                              <p className="text-xs text-gray-500">{email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveManager(email)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="mt-2 w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                >
                  Assign Project Manager
                </button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {activeTab === "Micro Tasks" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="rounded-md px-3 py-1 text-sm"></div>
      
          </div>
          {tasks.length === 0 ? (
            <div className="relative flex flex-col items-center justify-center py-12">
              <img 
                src="/empty.svg" 
                alt="No tasks found" 
                className="w-64 h-64 opacity-50"
              />
              
              {/* Loading overlay for empty state */}
              {isTaskLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>
          ) : isTaskLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
              ))}
            </div>
          )}
          <div className="flex items-center justify-between py-4">
            <PaginationControls
              pagination={{
                pageCount: taskTotalPages,
                page: taskPage,
                setPage: setTaskPage,
                pageSize: taskPageSize,
                setPageSize: setTaskPageSize,
                showingText:
                  taskTotalElements > 0
                    ? `Showing ${taskStartRecord} to ${taskEndRecord} out of ${taskTotalElements} records`
                    : "",
              }}
            />
          </div>
        </div>
      )}

      {activeTab === "Users" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className=" py-1 text-sm"></div>
            <div className="border border-gray-300 rounded-md px-3 py-1 flex items-center">
              <Search className="h-4 w-4 text-gray-500 mr-2" />
              <Input
                type="text"
                placeholder="Search"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="text-sm focus:outline-none border-none"
              />
            </div>
          </div>
          <div className="rounded-md border border-gray-100 bg-white overflow-hidden relative">
            {isUserLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10"></div>
            )}
            <Table>
              <TableHeader>
                {userTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-sm font-bold text-gray-700 bg-gray-50 px-2 py-5"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className="flex items-center space-x-1 cursor-pointer"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            {header.column.getCanSort() && (
                              <span className="text-gray-500">
                                {header.column.getIsSorted() === "asc" ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : header.column.getIsSorted() === "desc" ? (
                                  <ArrowDown className="h-4 w-4" />
                                ) : (
                                  <ArrowUpDown className="h-4 w-4" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {userTable.getRowModel().rows?.length ? (
                  userTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="border-gray-100">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4 px-7 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={userColumns.length}
                      className="h-24 text-center"
                    >
                      {isUserLoading ? (
                        ""
                      ) : (
                        <div className="flex justify-center items-center h-48">
                          <></>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between py-4">
            <PaginationControls
              pagination={{
                pageCount: userTotalPages,
                page: userPage,
                setPage: setUserPage,
                pageSize: userPageSize,
                setPageSize: setUserPageSize,
                showingText:
                  userTotalElements > 0
                    ? `Showing ${userStartRecord} to ${userEndRecord} out of ${userTotalElements} records`
                    : "",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTable;
