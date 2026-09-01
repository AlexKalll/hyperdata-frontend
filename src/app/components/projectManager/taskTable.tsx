"use client";
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
  Copy,
  Plus,
  Users,
  Link2,
  ChevronDown,
} from "lucide-react";
import { useSession } from "next-auth/react";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Basedata } from "@/app/types/basedate";
import { useBasedataall } from "@/lib/hooks/useBasedata";
import { toast } from "sonner";
import {
  useGetProjectTask,
  useGetProjectTaskFliter,
  useGetProjectTaskArchiveFliter,
  useGetProjectUser,
  useAddTask,
} from "@/lib/hooks/useProject";
import { useRouter } from "next/navigation";
import { GenerateInvitationLink } from "@/lib/hooks/useProjectManager";
import TaskCard from "./taskCardEdit";
import TaskCardArchive from "./taskCardArchive";
import CreateTaskForm from "./createTaskForm";
import { TaskCardType } from "@/app/types/project";
import { User, Project_User } from "@/app/types/global";
import { formatDateMedium } from "@/app/types/dateUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProjectOverview from "./projectOverview";
import { FilterComponent } from "@/components/ui/filterComponent";

interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_date: string;
  updated_date: string;
  deletedAt: string | null;
}

interface InvitationLink {
  invitation_link_id: string;
  organization: string;
  link: string;
  dateCreated: string;
  role: string;
}

interface TaskTableProps {
  projectId: string;
  tags?: string[] | null;
  cover_image_url: string | undefined;
  projectTitle: string;
  projectStatus: "Active" | "Inactive" | "active" | "inactive";
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
    is_active: boolean;
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

interface CreateTaskFormData {
  name: string;
  description: string;
  project_id: string;
  task_type_id: string;
  language_id: string;
  is_public: boolean;
  require_contributor_test: boolean;
  max_contributor_per_micro_task: number | null;
  max_expected_no_of_contributors: number | null;
  max_dataset_per_reviewer: number | null;
  max_contributor_per_facilitator: number | null;
  max_micro_task_per_contributor: number | null;
  minimum_seconds?: number | null;
  maximum_seconds?: number | null;
  appriximate_time_per_batch: number | null;
  minimum_characters_length: number | null;
  maximum_characters_length: number | null;
  contributor_completion_time_limit: number | null;
  reviewer_completion_time_limit: number | null;
  reviewer_payment_per_microtask: number | null;
  contributor_payment_per_microtask: number | null;
  max_retry_per_task: number | null;
  batch: number | null;
  is_dialect_specific: boolean;
  dialects?: string[];
  is_age_specific: boolean;
  age?: { min: number; max: number };
  is_sector_specific: boolean;
  sectors?: string[];
  is_gender_specific: boolean;
  gender?: { male: number; female: number };
  is_location_specific: boolean;
  locations?: { name: string }[];
}

const fetchOrganizations = async (accessToken?: string) => {
  if (!accessToken) {
    throw new Error("No session or access token found");
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/organization/all`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) throw new Error("Failed to fetch organizations");
  return response.json();
};

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
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<
    "Overview" | "Project Details" | "Micro Tasks" | "Users" | "Archive"
  >("Micro Tasks");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize, setTaskPageSize] = useState(10);
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<string>();
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<
    "Contributor" | "Facilitator" | "Reviewer" | ""
  >("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [maxInvitations, setMaxInvitations] = useState<number>(0);
  const [invitationLinks, setInvitationLinks] = useState<InvitationLink[]>([]);
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [filters, setFilters] = useState<{ [key: string]: string | boolean }>(
    {},
  );
  const [showGeneratedLinkAddress, setShowGenerateLinkAddress] =
    useState(false);
  const [generatedLinkAddress, setGeneratedLinkAddress] = useState<string>();
  const [showInviteUsers, setShowInviteUsers] = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const debouncedTaskSearch = useDebounce(taskSearchQuery, 500);
  const debouncedUserSearch = useDebounce(userSearchQuery, 500);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLinkAddress || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const [copied, setCopied] = useState(false);
  const { data: organizationData } = useBasedataall({
    servicename: "organization",
  });
  const organizationOptions =
    organizationData?.data?.map((organization: Basedata) => ({
      id: organization.id,
      name: organization.name,
    })) || [];
  useGetProjectTaskArchiveFliter;
  const { data: tasksData, isLoading: isTaskLoading } = useGetProjectTaskFliter(
    {
      taskPage,
      taskPageSize,
      searchQuery: debouncedTaskSearch,
      projectId,
      verificationStatus,
      filters,
    },
  );
  const { data: archivedTasksData, isLoading: isArchivedTasksLoading } =
    useGetProjectTaskArchiveFliter({
      taskPage,
      taskPageSize,
      searchQuery: debouncedTaskSearch,
      projectId,
      verificationStatus,
      filters,
    });
  const { data: usersData, isLoading: isUserLoading } = useGetProjectUser({
    userPage,
    userPageSize,
    searchQuery: debouncedTaskSearch,
    projectId,
    verificationStatus,
  });
  const { data: organizationsData, isLoading: isOrganizationsLoading } =
    useQuery({
      queryKey: ["organizations"],
      queryFn: () => fetchOrganizations(session?.access_token),
    });
  const addLinkMutation = GenerateInvitationLink();
  const handleFilterChange = (
    newFilters: { [key: string]: string | boolean },
    endpoint: string,
  ) => {
    setFilters(newFilters);
    setTaskPage(1);
  };
  const filterableColumns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "is_public", header: "Public" },
    { accessorKey: "is_closed", header: "Closed" },
  ];
  const tasks: TaskCardType[] = tasksData?.data?.result || [];
  const taskTotalElements = tasksData?.data?.total || 0;
  const taskTotalPages = tasksData?.data?.totalPages || 1;
  const taskStartRecord = tasks.length ? (taskPage - 1) * taskPageSize + 1 : 0;
  const taskEndRecord = Math.min(taskPage * taskPageSize, taskTotalElements);

  const archivedTasks: TaskCardType[] = archivedTasksData?.data?.result || [];
  const archivedTaskTotalElements = archivedTasksData?.data?.total || 0;
  const archivedTaskTotalPages = archivedTasksData?.data?.totalPages || 1;
  const archivedTaskStartRecord = archivedTasks.length
    ? (taskPage - 1) * taskPageSize + 1
    : 0;
  const archivedTaskEndRecord = Math.min(
    taskPage * taskPageSize,
    archivedTaskTotalElements,
  );

  const users: Project_User[] = usersData?.data?.result || [];
  const userTotalElements = usersData?.data?.total || 0;
  const userTotalPages = usersData?.data?.totalPages || 1;
  const userStartRecord = users.length ? (userPage - 1) * userPageSize + 1 : 0;
  const userEndRecord = Math.min(userPage * userPageSize, userTotalElements);

  const handleTaskClick = (taskId: string) => {
    router.push(`/projectmanager/tasks/${taskId}`);
  };

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrganization || !selectedRole || !expiryDate) {
      console.info("Missing required fields for invitation link");
      return;
    }
    if (!session || !session.access_token) {
      toast.info("No session or access token found");
      return;
    }
    try {
      const responseLink = await addLinkMutation.mutateAsync({
        expiry_date: expiryDate,
        max_invitations: maxInvitations,
        organization_id: selectedOrganization,
        projectId,
        role: selectedRole,
      });
      let user_type =
        responseLink.data.data.role.toLowerCase() === "reviewers" ||
        responseLink.data.data.role.toLowerCase() === "reviewer"
          ? "reviewer"
          : responseLink.data.data.role.toLowerCase();

      user_type =
        responseLink.data.data.role.toLowerCase() === "facilitators" ||
        responseLink.data.data.role.toLowerCase() === "facilitators"
          ? "facilitator"
          : responseLink.data.data.role.toLowerCase();

      setGeneratedLinkAddress(
        `${process.env.NEXT_PUBLIC_BASE_URL}/linkForm/${user_type}/${responseLink.data.data.id}`,
      );

      setTimeout(() => {
        setShowGenerateLinkAddress(true);
      }, 200);
    } catch (error) {}
  };
  const generateLinkMutation = async (e: React.FormEvent) => {
    e.preventDefault();
  };
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
  };

  const addTaskMutation = useAddTask();
  const handleCreateTaskSubmit = async (formData: CreateTaskFormData) => {
    try {
      await addTaskMutation.mutateAsync(formData);
    } catch (error) {
      // Error handling is done in useAddTask hook
    }
  };

  const userColumns: ColumnDef<Project_User>[] = [
    {
      accessorKey: "fullName",
      header: "Full Name",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="font-medium text-gray-900">
            {row.original.user?.first_name} {row.original.user?.middle_name}{" "}
            {row.original.user?.last_name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="text-gray-700">{row.original.user?.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center space-x-1 px-2 py-2 rounded-2xl ${
              row.original.status?.toLowerCase() === "active"
                ? "bg-[#ECFDF3] px-2 py-1"
                : "bg-[#EAECF0]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                row.original.status?.toLowerCase() === "active"
                  ? "bg-[#037847]"
                  : "bg-[#b8bbc0e2] "
              }`}
            ></span>
            <span
              className={`text-xs text-gray-600 ${
                row.original.status?.toLowerCase() === "active"
                  ? "text-[#037847]"
                  : "text-[#DDDFE3]"
              }`}
            >
              {row.original.status}
            </span>
          </div>
         
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
  const handleProjectBackClick = () => {
    router.push(`/projectmanager/project`);
  };
  return (
    <>
      {showCreateTaskForm ? (
        <div className="mb-2">
          <CreateTaskForm
            onSubmit={handleCreateTaskSubmit}
            onCancel={() => setShowCreateTaskForm(false)}
            projectId={projectId}
          />
        </div>
      ) : (
        <div className="w-full max-w-full p-2 sm:p-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-4">
            <img
              src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${cover_image_url}`}
              alt="Project"
              className="h-20 sm:h-25 rounded-2xl w-32 sm:w-40 object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words">
                  {projectTitle}
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Created on {createdOn ? formatDateMedium(createdOn) : ""}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100 mb-4 overflow-x-auto">
            <nav className="flex space-x-2 sm:space-x-4 min-w-max">
              <button
                onClick={() => setActiveTab("Overview")}
                className={`py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === "Overview"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    d="M7.55137 4.02194L2.69926 8.26778C2.28317 8.63192 2.56215 9.27858 3.13532 9.27858C3.48549 9.27858 3.76937 9.54075 3.76937 9.86425V12.5672C3.76937 14.8925 3.76937 16.0552 4.55147 16.7776C5.33357 17.5 6.59235 17.5 9.10992 17.5H10.8901C13.4077 17.5 14.6664 17.5 15.4485 16.7776C16.2307 16.0552 16.2307 14.8925 16.2307 12.5672V9.86425C16.2307 9.54075 16.5145 9.27858 16.8647 9.27858C17.4378 9.27858 17.7168 8.63192 17.3008 8.26778L12.4486 4.02194C11.2891 3.00732 10.7093 2.5 10 2.5C9.29067 2.5 8.71092 3.00732 7.55137 4.02194Z"
                    stroke={activeTab === "Overview" ? "#095FAF" : "#667085"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 13.333H10.0075"
                    stroke={activeTab === "Overview" ? "#095FAF" : "#667085"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Overview
              </button>
              <button
                onClick={() => setActiveTab("Project Details")}
                className={`py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === "Project Details"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg
                  width="20"
                  height="18"
                  viewBox="0 0 20 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    d="M15.0003 11.5V6.5C15.0003 4.14333 15.0003 2.96417 14.2678 2.2325C13.5362 1.5 12.357 1.5 10.0003 1.5H6.66699C4.31033 1.5 3.13116 1.5 2.39949 2.2325C1.66699 2.96417 1.66699 4.14333 1.66699 6.5V11.5C1.66699 13.8567 1.66699 15.0358 2.39949 15.7675C3.13116 16.5 4.31033 16.5 6.66699 16.5H16.667M5.00033 5.66667H11.667M5.00033 9H11.667M5.00033 12.3333H8.33366"
                    stroke={
                      activeTab === "Project Details" ? "#095FAF" : "#667085"
                    }
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 5.66699H15.8333C17.0117 5.66699 17.6008 5.66699 17.9667 6.03366C18.3333 6.39949 18.3333 6.98866 18.3333 8.16699V14.8337C18.3333 15.2757 18.1577 15.6996 17.8452 16.0122C17.5326 16.3247 17.1087 16.5003 16.6667 16.5003C16.2246 16.5003 15.8007 16.3247 15.4882 16.0122C15.1756 15.6996 15 15.2757 15 14.8337V5.66699Z"
                    stroke={
                      activeTab === "Project Details" ? "#095FAF" : "#667085"
                    }
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Project Details
              </button>
              <button
                onClick={() => setActiveTab("Micro Tasks")}
                className={`py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === "Micro Tasks"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    d="M5.42742 13.3337H8.76076M5.42742 9.16699H12.0941M8.34409 18.3337H9.17742M6.25826 18.3337C5.29992 18.3128 4.65492 18.3337 3.82242 18.1462C2.94742 17.917 2.40576 17.3753 2.21909 16.292C2.03159 15.5837 2.09159 12.437 2.09409 9.43783C2.09576 7.11033 2.11076 4.99949 2.30242 4.56283C2.57326 3.62533 3.19742 2.95866 5.13409 2.93783M13.3574 2.93783C14.0241 3.00033 15.7658 2.93783 16.1058 4.85449C16.2908 5.89616 16.2516 7.37533 16.2516 9.14616M6.81992 4.58366C7.69492 4.60449 10.5049 4.58366 11.4633 4.58366C12.4208 4.58366 12.9266 3.79533 12.9208 3.06283C12.9141 2.31616 12.2541 1.73366 11.6083 1.66699H6.79992C6.02909 1.70866 5.50826 2.33366 5.42492 2.95866C5.34159 3.81283 5.96659 4.54199 6.81992 4.58366ZM15.2316 11.9795C14.0858 13.1462 11.8791 15.2295 11.8791 15.3753C11.7016 15.6228 11.5458 16.1253 11.4416 16.8337C11.3116 17.4903 11.1549 18.0628 11.3383 18.2295C11.5216 18.3962 12.2108 18.2562 12.9408 18.1045C13.5241 18.042 14.0658 17.8337 14.3358 17.6253C14.7316 17.2753 17.4174 14.5628 17.7299 14.2087C17.9583 13.8962 17.9799 13.3128 17.7799 12.9587C17.6674 12.7087 16.9591 12.042 16.7299 11.8545C16.4995 11.7124 16.2296 11.6478 15.9598 11.6703C15.69 11.6928 15.4353 11.8012 15.2316 11.9795Z"
                    stroke={activeTab === "Micro Tasks" ? "#095FAF" : "#667085"}
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Tasks
              </button>
              <button
                onClick={() => setActiveTab("Users")}
                className={`py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === "Users"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    d="M17.3117 15C17.9361 15 18.4328 14.6071 18.8787 14.0576C19.7916 12.9328 18.2927 12.034 17.7211 11.5938C17.14 11.1463 16.4912 10.8928 15.8333 10.8333M15 9.16667C16.1506 9.16667 17.0833 8.23392 17.0833 7.08333C17.0833 5.93274 16.1506 5 15 5"
                    stroke={activeTab === "Users" ? "#095FAF" : "#667085"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2.68798 15C2.06355 15 1.5669 14.6071 1.12096 14.0576C0.208084 12.9328 1.7069 12.034 2.27854 11.5938C2.85965 11.1463 3.50849 10.8928 4.16634 10.8333M4.58301 9.16667C3.43242 9.16667 2.49968 8.23392 2.49968 7.08333C2.49968 5.93274 3.43242 5 4.58301 5"
                    stroke={activeTab === "Users" ? "#095FAF" : "#667085"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.73618 12.593C5.88469 13.1195 3.65216 14.1946 5.01193 15.5398C5.67616 16.197 6.41594 16.667 7.34603 16.667H12.6534C13.5834 16.667 14.3232 16.197 14.9874 15.5398C16.3472 14.1946 14.1147 13.1195 13.2632 12.593C11.2664 11.3583 8.73286 11.3583 6.73618 12.593Z"
                    stroke={activeTab === "Users" ? "#095FAF" : "#667085"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12.9164 6.24967C12.9164 7.86051 11.6105 9.16634 9.99969 9.16634C8.38886 9.16634 7.08301 7.86051 7.08301 6.24967C7.08301 4.63884 8.38886 3.33301 9.99969 3.33301C11.6105 3.33301 12.9164 4.63884 12.9164 6.24967Z"
                    stroke={activeTab === "Users" ? "#095FAF" : "#667085"}
                    strokeWidth="1.5"
                  />
                </svg>
                Users
              </button>
              <button
                onClick={() => setActiveTab("Archive")}
                className={`py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium flex items-center whitespace-nowrap ${
                  activeTab === "Archive"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    d="M16.5 4.83333H1.5M16.5 4.83333V9.83333C16.5 12.9758 16.4992 14.5467 15.5233 15.5233C14.5475 16.5 12.9758 16.5 9.83333 16.5H8.16667C5.02417 16.5 3.45333 16.4992 2.47667 15.5233C1.5 14.5475 1.5 12.9758 1.5 9.83333V4.83333M16.5 4.83333L15.5 3.5C14.7642 2.51833 14.3958 2.0275 13.8683 1.76417C13.34 1.5 12.7267 1.5 11.5 1.5H6.5C5.27333 1.5 4.66 1.5 4.13167 1.76417C3.60417 2.0275 3.23583 2.51833 2.5 3.5L1.5 4.83333"
                    stroke={activeTab === "Archive" ? "#095FAF" : "#667085"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 13.1667V7.75M6.5 11.0833C6.99167 11.5892 8.3 13.5833 9 13.5833C9.7 13.5833 11.0083 11.5892 11.5 11.0833"
                    stroke={activeTab === "Archive" ? "#095FAF" : "#667085"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Archive
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "Overview" && (
            <ProjectOverview projectId={projectId} />
          )}
          {activeTab === "Project Details" && (
            <div>
              <div className="border border-gray-100 rounded-lg p-4 bg-white  hover:shadow-md transition-shadow">
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
                      <span className="font-medium">Status:</span>{" "}
                      <span className="text-green-600">
                        {" "}
                        <span
                          className={`h-2 w-2 px-2 py-2  rounded-full ${
                            projectStatus === "Active" ||
                            projectStatus === "active"
                              ? "bg-[#ECFDF3]"
                              : "bg-red-500"
                          }`}
                        >
                          {" "}
                          {projectStatus}{" "}
                        </span>
                      </span>
                    </div>

                    <div className="ml-auto">
                      <span className="font-medium">Created On:</span>{" "}
                      <div>
                        {" "}
                        <span className="font-medium">
                          {createdOn ? formatDateMedium(createdOn) : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Micro Tasks" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4"></div>
                <div className="px-3 py-1 flex items-center">
                  <div className="flex  mr-4">
                    <FilterComponent
                      columns={filterableColumns}
                      onFilterChangeAction={handleFilterChange}
                      initialFilters={filters}
                      endpoint={``}
                    />
                  </div>
                  <Button
                    onClick={() => setShowCreateTaskForm(true)}
                    className="bg-primary text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Task
                  </Button>
                </div>
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
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={handleTaskClick}
                      />
                    ))}
                  </div>
                </>
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
              <div className="flex justify-between items-center mb-4 mt-6"></div>
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
                            className="text-sm font-bold text-gray-500 bg-gray-50 px-6 py-4 text-left"
                          >
                            {header.isPlaceholder ? null : (
                              <div
                                className="flex items-center space-x-1 cursor-pointer"
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                <span>
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </span>
                                {header.column.getCanSort() && (
                                  <span className="text-gray-500">
                                    {header.column.getIsSorted() === "asc" ? (
                                      <ArrowUp className="h-4 w-4" />
                                    ) : header.column.getIsSorted() ===
                                      "desc" ? (
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
                            <TableCell
                              key={cell.id}
                              className="py-4 px-6 text-sm text-gray-700 align-middle"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
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
                            <div className="flex justify-center items-center h-48"></div>
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

          {activeTab === "Archive" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-md px-3 py-1 text-sm"></div>
                </div>
                <div className="px-3 py-1 flex items-center">
                  <div className="flex  mr-4">
                    <FilterComponent
                      columns={filterableColumns}
                      onFilterChangeAction={handleFilterChange}
                      initialFilters={filters}
                      endpoint={``}
                    />
                  </div>
                </div>
              </div>

              {archivedTasks.length === 0 ? (
                <div className="relative flex flex-col items-center justify-center py-12">
                  <img
                    src="/empty.svg"
                    alt="No archived tasks found"
                    className="w-64 h-64 opacity-50"
                  />

                  {/* Loading overlay for empty state */}
                  {isArchivedTasksLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}
                </div>
              ) : isArchivedTasksLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedTasks.map((task) => (
                      <TaskCardArchive
                        key={task.id}
                        task={task}
                        onClick={handleTaskClick}
                      />
                    ))}
                  </div>
                </>
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
        </div>
      )}
    </>
  );
};

export default TaskTable;
