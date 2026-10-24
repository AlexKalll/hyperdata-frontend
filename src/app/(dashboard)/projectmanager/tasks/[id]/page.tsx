"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  useTask,
  useGetTaskUserDetail,
  useTaskDistrubuion,
  useTaskReviwerDistrubuion,
  useTaskClose,
  useRemoveTaskUser,
  useToggleActivateTaskUser,
} from "@/lib/hooks/useProject";
import { UserData } from "@/app/types/global";
import { MoreHorizontal } from "lucide-react";
import TaskDatasetSubmit from "@/app/components/projectManager/microTaskDatasetSubmit";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Basedata } from "@/app/types/basedate";
import AddMicroTaskDialog from "@/app/components/projectManager/addMicroTaskDialog";
import CreateProjectMemeber from "@/app/components/projectManager/createProjectMemeber";
import CreateContributors from "@/app/components/projectManager/createContributors";
import MicroTaskList from "@/app/components/projectManager/microTaskList";
import { useQuery } from "@tanstack/react-query";
import { useBasedataall } from "@/lib/hooks/useBasedata";
import { useSession } from "next-auth/react";
import { UserTask } from "@/app/types/global";
import { TaskInstructions } from "@/app/types/project";
import CreateTaskInstruction from "@/app/components/projectManager/createTaskInstruction";
import InstructionView from "@/app/components/projectManager/instructionView";
import TaskStatistics from "@/app/components/projectManager/taskStatistics";
import TaskStatisticsReviwer from "@/app/components/projectManager/taskStatisticsReviwer";
import TaskDetailsGeneral from "@/app/components/projectManager/taskDetailsGeneral";
import {
  useAddSingleMicroTask,
  useImportMicroTasksFromTask,
  useAddMicroTasksFromCsv,
  useAddMicroTasksFromAudio,
  useInvitation,
} from "@/lib/hooks/useMicrotask";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
  Calendar,
  Copy,
  Plus,
  Users,
  Link2,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  flexRender,
  Row,
} from "@tanstack/react-table";
import {
  GenerateTaskInvitationLink,
  GenerateAutomaticAssignXontributortoFacilitator,
} from "@/lib/hooks/useProjectManager";
import { formatDateMedium } from "@/app/types/dateUtils";
import { getInvitationUrl } from "@/lib/invitation";
import { PaginationControls } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialogBig";
import TaskDataset from "@/app/components/projectManager/taskDataset";
import AssignFacilltatorContributors from "@/app/components/projectManager/assignFacilltatorContributors";
import ShowFacilltatorContributors from "@/app/components/projectManager/showFacilltatorContributors";
import ScheduleDistribution from "@/app/components/projectManager/scheduleDistribution";
import ExportUserTask from "@/app/components/projectManager/exportUserTask";
import { set } from "date-fns";
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
  id: string;
  organization: string;
  link: string;
  dateCreated: string;
  expiration: string;
}

interface PaginationProps {
  pageCount: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  showingText: string;
}

const TaskDetailPage: React.FC = () => {
  const params = useParams();
  const taskId = params.id as string;
  const [showFormFacilitator, setShowFormFacilitator] = useState(false);
  const [showListFacilitator, setListFormFacilitator] = useState(false);
  const [selectedFacilitator, setSelectedFacilitator] =
    useState<UserTask | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { data: taskData, isLoading: isTaskLoading, error } = useTask(taskId);
  const task = taskData?.data;
  const [formDataTask, setFormDataTask] = useState({
    source_task_id: "",
    targetTaskId: "",
    from_micro_task: false,
    from_data_set: true,
  });
  const [formData, setFormData] = useState({
    title: "",
    instruction: "",
    text: "",
    task_id: taskId,
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownOpenReviewer, setIsDropdownOpenReviewer] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "Task Details"
    | "Micro Tasks"
    | "Users"
    | "submissions"
    | "Task distribution"
  >("Task Details");
  const [activeDistributionTab, setActiveDistributionTab] = useState<
    "Contributors" | "Reviewers"
  >("Contributors");
  const [selectedRole, setSelectedRole] = useState<
    "Contributor" | "Facilitator" | "Reviewer" | ""
  >("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [userSubmissionsView, setUserSubmissionsView] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showExportType, setShowExportType] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const debouncedUserSearch = useDebounce(userSearchQuery, 500);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const debouncedTaskSearch = useDebounce(taskSearchQuery, 500);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [microTaskPage, setMicroTaskPage] = useState(1);
  const [microTaskPageSize, setMicroTaskPageSize] = useState(10);
  const [userVerificationStatus, setUserVerificationStatus] = useState<
    string | undefined
  >(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [contributor_id, setContributor_id] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserTask["user"] | null>(
    null,
  );
  const [microTaskVerificationStatus, setMicroTaskVerificationStatus] =
    useState<string | undefined>(undefined);
  const [invitationPage, setInvitationPage] = useState(1);
  const [invitationPageSize, setInvitationPageSize] = useState(10);
  const [invitationSearchQuery, setInvitationSearchQuery] = useState("");
  const debouncedInvitationSearch = useDebounce(invitationSearchQuery, 500);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [showGeneratedLinkAddress, setShowGenerateLinkAddress] =
    useState(false);
  const [generatedLinkAddress, setGeneratedLinkAddress] = useState<string>();
  const [generatedLinkExpiry, setGeneratedLinkExpiry] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [maxInvitations, setMaxInvitations] = useState<number>(0);
  const [showInviteUsers, setShowInviteUsers] = useState(false);
  const [showCreateMicroTaskForm, setShowCreateMicroTaskForm] = useState(false);
  const [showCreateMemberForm, setShowCreateMemberForm] = useState(false);
  const [showCreateContributorsForm, setShowCreateContributorsForm] =
    useState(false);
  const [showCreateInstructionForm, setShowCreateInstructionForm] =
    useState(false);
  const [memebrType, setMemebrType] = useState<string>("");
  const [roleSearch, setRoleSearch] = useState<
    "Contributor" | "Reviewer" | "Facilitator"
  >("Facilitator");
  const [isInstructionFullScreen, setIsInstructionFullScreen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<any>(null);

  const handleOpenInstruction = (instruction: TaskInstructions) => {
    setSelectedInstruction(instruction);
    setTimeout(() => {
      setIsInstructionFullScreen(true);
    }, 100);
  };

  const { data: usersData, isLoading: isUserLoading } = useGetTaskUserDetail({
    userPage,
    userPageSize,
    searchQuery: debouncedUserSearch,
    taskId,
    role: roleSearch,
    verificationStatus: userVerificationStatus,
  });
  const [scheduleformData, setScheduleFormData] = useState({
    startDate: "",
    startTime: "",
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setScheduleFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "startDate" || name === "endDate") {
    }
  };

  const users: UserTask[] = usersData?.data?.result || [];
  const userTotalElements = usersData?.data?.total || 0;
  const userTotalPages = usersData?.data?.totalPages || 1;
  const userStartRecord = users.length ? (userPage - 1) * userPageSize + 1 : 0;
  const userEndRecord = Math.min(userPage * userPageSize, userTotalElements);

  const [isRemoving, setIsRemoving] = useState(false);

  const { data: invitationData, isLoading: isInvitationLoading } =
    useInvitation({
      page: invitationPage,
      pageSize: invitationPageSize,
      searchQuery: debouncedInvitationSearch,
      verificationStatus: undefined, // Adjust if your API supports filtering by verification status
      task_id: taskId,
    });

  const invitationLinks: InvitationLink[] =
    invitationData?.data?.result?.map((invitation: any) => ({
      id: invitation.id,
      organization: invitation.organization?.name || "Unknown",
      link: getInvitationUrl(invitation.role, invitation.id),
      dateCreated: formatDateMedium(invitation.created_date),
      expiration: invitation.expiry_date
        ? formatDateMedium(invitation.expiry_date)
        : "No expiration",
    })) || [];
  const invitationTotalElements = invitationData?.data?.total || 0;
  const invitationTotalPages = invitationData?.data?.totalPages || 1;
  const invitationStartRecord = invitationLinks.length
    ? (invitationPage - 1) * invitationPageSize + 1
    : 0;
  const invitationEndRecord = Math.min(
    invitationPage * invitationPageSize,
    invitationTotalElements,
  );

  const { data: session } = useSession();
  const addLinkMutation = GenerateTaskInvitationLink();
  const automaticAssignMutation =
    GenerateAutomaticAssignXontributortoFacilitator();

  const handleAutomaticAssign = (taskId: string) => {
    automaticAssignMutation.mutate({ taskId });
  };
  const fetchOrganizations = async () => {
    if (!session || !session.access_token) {
      throw new Error("No session or access token found");
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/organization/all`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) throw new Error("Failed to fetch organizations");
    return response.json();
  };

  const { data: organizationsData, isLoading: isOrganizationsLoading } =
    useQuery({
      queryKey: ["organizations"],
      queryFn: fetchOrganizations,
    });

  const organizations: Organization[] = organizationsData?.data || [];
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLinkAddress || "");
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  const taskDistrubuionMutation = useTaskDistrubuion(taskId);
  const taskReviwerDistrubuionMutation = useTaskReviwerDistrubuion(taskId);
  const taskCloseMutation = useTaskClose(taskId);
  const handleTaskDistrubuion = () => {
    taskDistrubuionMutation.mutate();
  };
  const handleTaskReviwerDistrubuion = () => {
    taskReviwerDistrubuionMutation.mutate();
  };
  const handleTaskClose = () => {
    taskCloseMutation.mutate();
  };
  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrganization || !selectedRole) {
      toast.info("Missing required fields for invitation link");
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
        taskId: taskId,
        role: selectedRole,
      });
      const invitation = responseLink.data.data;
      setGeneratedLinkAddress(getInvitationUrl(invitation.role, invitation.id));
      setGeneratedLinkExpiry(invitation.expiry_date);
      setCopied(false);
      setShowGenerateLinkAddress(true);
      toast.success("Invitation link generated successfully");
    } catch (error) {
      console.error("Error generating link:", error);
    }
  };

  const { data: organizationData } = useBasedataall({
    servicename: "organization",
  });
  const organizationOptions =
    organizationData?.data?.map((organization: Basedata) => ({
      id: organization.id,
      name: organization.name,
    })) || [];

  const userColumns: ColumnDef<UserTask>[] = [
    {
      accessorKey: "fullName",
      header: "Full Name",
      enableSorting: true,
      cell: ({ row }: { row: Row<UserTask> }) => (
        <span className="flex items-center space-x-1">
          <span>
            {row.original.user.first_name} {row.original.user.middle_name}{" "}
            {row.original.user.last_name}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      enableSorting: true,
      cell: ({ row }: { row: Row<UserTask> }) => (
        <span className="flex items-center space-x-1">
          <span>
            {row.original.user.phone_number
              ? row.original.user.phone_number
              : ""}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      enableSorting: true,
      cell: ({ row }: { row: Row<UserTask> }) => (
        <span className="flex items-center space-x-1">
          <span
            className={`py-2 px-2 rounded-2xl ${
              row.original.role?.toLowerCase() === "reviewer"
                ? "bg-[#FCEFFF] text-[#8500A3]"
                : row.original.role?.toLowerCase() === "contributor"
                  ? "bg-[#ECF6FF] text-[#095FAF]"
                  : row.original.role?.toLowerCase() === "facilitator"
                    ? "text-[#3F3748] bg-[#F2F4F7]"
                    : "text-[#3F3748] bg-[#F2F4F7]"
            }`}
          >
            {row.original.role}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      cell: ({ row }: { row: Row<UserTask> }) => (
        <span className="flex items-center space-x-1">
          <span
            className={`h-2 w-2 rounded-full ${
              row.original.status?.toLowerCase() === "active"
                ? "bg-green-500"
                : "bg-purple-500"
            }`}
          ></span>
          <span>{row.original.user.email}</span>
        </span>
      ),
    },
    ...(roleSearch === "Contributor"
      ? [
          {
            accessorKey: "Submissions",
            header: "Submissions",
            enableSorting: true,
            cell: ({ row }: { row: Row<UserTask> }) => (
              <span className="flex items-center space-x-1">
                <Button
                  className={`text-white px-2 py-2 bg-primary rounded-2xl`}
                  onClick={() => {
                    setContributor_id(row.original.user.id);
                    setSelectedUser(row.original.user);
                    setTimeout(() => {
                      setUserSubmissionsView(true);
                    }, 20);
                  }}
                >
                  View
                </Button>
              </span>
            ),
          },
        ]
      : []),
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="flex items-center space-x-1">
          <span
            className={`h-2 w-2 rounded-full ${
              row.original.status?.toLowerCase() === "active"
                ? "bg-green-500"
                : "bg-purple-500"
            }`}
          ></span>
          <span>{row.original.status}</span>
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {row.original.role === "Facilitator" ? (
            <>
              <button
                onClick={() => {
                  setShowFormFacilitator(true);
                  setSelectedFacilitator(row.original);
                }}
                className="text-gray-500 hover:text-gray-500"
                aria-label="More options"
              >
                <svg
                  width="33"
                  height="28"
                  viewBox="0 0 33 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.6"
                    y="1.1"
                    width="31.8"
                    height="25.8"
                    rx="5.4"
                    stroke="#EAECF0"
                    strokeWidth="1.2"
                  />

                  <line
                    x1="11.5"
                    y1="14"
                    x2="21.5"
                    y2="14"
                    stroke="#667085"
                    strokeWidth="0.84375"
                    strokeLinecap="round"
                  />
                  <line
                    x1="16.5"
                    y1="9"
                    x2="16.5"
                    y2="19"
                    stroke="#667085"
                    strokeWidth="0.84375"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                onClick={() => {
                  setSelectedFacilitator(row.original);

                  setTimeout(() => {
                    setListFormFacilitator(true);
                  }, 200);
                }}
                className="ml-2 mr-2 text-gray-500 hover:text-gray-500"
                aria-label="More options"
              >
                <svg
                  width="33"
                  height="28"
                  viewBox="0 0 33 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.6"
                    y="1.1"
                    width="31.8"
                    height="25.8"
                    rx="5.4"
                    stroke="#EAECF0"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M10.875 11.75C10.875 11.75 13.3934 8.9375 16.5 8.9375C19.6066 8.9375 22.125 11.75 22.125 11.75"
                    stroke="#667085"
                    strokeWidth="0.84375"
                    strokeLinecap="round"
                  />
                  <path
                    d="M21.8685 14.5878C22.0395 14.8276 22.125 14.9475 22.125 15.125C22.125 15.3025 22.0395 15.4224 21.8685 15.6622C21.1001 16.7397 19.1377 19.0625 16.5 19.0625C13.8623 19.0625 11.8999 16.7397 11.1315 15.6622C10.9605 15.4224 10.875 15.3025 10.875 15.125C10.875 14.9475 10.9605 14.8276 11.1315 14.5878C11.8999 13.5103 13.8623 11.1875 16.5 11.1875C19.1377 11.1875 21.1001 13.5103 21.8685 14.5878Z"
                    stroke="#667085"
                    strokeWidth="0.84375"
                  />
                  <path
                    d="M18.1875 15.125C18.1875 14.193 17.432 13.4375 16.5 13.4375C15.568 13.4375 14.8125 14.193 14.8125 15.125C14.8125 16.057 15.568 16.8125 16.5 16.8125C17.432 16.8125 18.1875 16.057 18.1875 15.125Z"
                    stroke="#667085"
                    strokeWidth="0.84375"
                  />
                </svg>
              </button>
            </>
          ) : (
            <></>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <button aria-label="More options">
                <svg
                  width="33"
                  height="28"
                  viewBox="0 0 24 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.733496"
                    y="17.6"
                    width="17.2"
                    height="22.5333"
                    rx="3.6"
                    transform="rotate(-90 0.733496 17.6)"
                    stroke="#EAECF0"
                    strokeWidth="0.8"
                  />
                  <path
                    d="M15.6668 9C15.6668 8.73478 15.7722 8.48043 15.9597 8.29289C16.1473 8.10536 16.4016 8 16.6668 8C16.932 8 17.1864 8.10536 17.3739 8.29289C17.5615 8.48043 17.6668 8.73478 17.6668 9C17.6668 9.26522 17.5615 9.51957 17.3739 9.70711C17.1864 9.89464 16.932 10 16.6668 10C16.4016 10 16.1473 9.89464 15.9597 9.70711C15.7722 9.51957 15.6668 9.26522 15.6668 9ZM11.0002 9C11.0002 8.73478 11.1055 8.48043 11.2931 8.29289C11.4806 8.10536 11.7349 8 12.0002 8C12.2654 8 12.5197 8.10536 12.7073 8.29289C12.8948 8.48043 13.0002 8.73478 13.0002 9C13.0002 9.26522 12.8948 9.51957 12.7073 9.70711C12.5197 9.89464 12.2654 10 12.0002 10C11.7349 10 11.4806 9.89464 11.2931 9.70711C11.1055 9.51957 11.0002 9.26522 11.0002 9ZM6.3335 9C6.3335 8.73478 6.43885 8.48043 6.62639 8.29289C6.81393 8.10536 7.06828 8 7.3335 8C7.59871 8 7.85307 8.10536 8.0406 8.29289C8.22814 8.48043 8.3335 8.73478 8.3335 9C8.3335 9.26522 8.22814 9.51957 8.0406 9.70711C7.85307 9.89464 7.59871 10 7.3335 10C7.06828 10 6.81393 9.89464 6.62639 9.70711C6.43885 9.51957 6.3335 9.26522 6.3335 9Z"
                    fill="#667085"
                  />
                </svg>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogTitle></DialogTitle>
              <DialogHeader>
                <p className="mb-8 font-bold ">User Information</p>
              </DialogHeader>

              <div className="space-y-1 pb-4 flex-row flex items-center gap-4 mt-7">
                <img
                  src={row.original.user?.image || "/default-avatar.png"}
                  alt="User"
                  className="w-17 h-17 mt-2 mb-2 rounded-full"
                />

                <div>
                  <h2 className="text-xl font-semibold">
                    {row.original.user.first_name} {row.original.user.last_name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      {row.original.user.email}
                    </span>
                  </div>
                </div>
              </div>
              <div className="">
                <DialogHeader>
                  <p className="mb-8 font-bold ">General Information</p>
                </DialogHeader>
              </div>
              <div className="py-4">
                <div className="divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                  <div className="grid grid-cols-4 items-center gap-4 px-4 py-3">
                    <span className="text-sm font-semibold text-gray-500">
                      First Name
                    </span>
                    <span className="col-span-3 text-gray-900">
                      {row.original.user.first_name}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4 px-4 py-3">
                    <span className="text-sm font-semibold text-gray-500">
                      Last Name(Grandfather Name)
                    </span>
                    <span className="col-span-3 text-gray-900">
                      {row.original.user.last_name}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4 px-4 py-3">
                    <span className="text-sm font-semibold text-gray-500">
                      Email
                    </span>
                    <span className="col-span-3 text-gray-900">
                      {row.original.user.email}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4 px-4 py-3">
                    <span className="text-sm font-semibold text-gray-500">
                      Status
                    </span>
                    <span className="col-span-3">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-2 ${row.original.status.toLowerCase() === "active" ? " bg-green-500" : "bg-red-500"}`}
                      ></span>
                      <span className="text-gray-900">
                        {row.original.status.toLowerCase() === "active"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="!bg-white !text-red-500 !border-[0.5px] !border-red-500 !hover:bg-red-100 !rounded-lg !px-4 !py-2 flex items-center gap-2"
                  onClick={(e) => {
                    setRemovedUserId(row.original.user.id);
                    setTimeout(() => {
                      handleRemove(e, row.original.user.id);
                    }, 200);
                  }}
                  disabled={isRemoving || !session?.access_token}
                >
                  {isRemoving ? "Removing..." : "Remove"}
                </Button>
                <Button
                  variant="outline"
                  className={`${row.original.status.toLowerCase() === "active" ? "text-red-500 !border-red-500 !hover:bg-red-100" : "text-primary"} !bg-white !border-[0.5px]  !rounded-lg !px-4 !py-2 flex items-center gap-2 hover:!bg-gray-100`}
                  onClick={(e) => {
                    setRemovedUserId(row.original.user.id);
                    setTimeout(() => {
                      handleActivateUser(e, row.original.user.id);
                    }, 200);
                  }}
                  disabled={isRemoving || !session?.access_token}
                >
                  {row.original.status.toLowerCase() === "active"
                    ? "Deactivate"
                    : "Activate"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
  ];

  const { mutate: addSingleMicroTask } = useAddSingleMicroTask({ taskId });
  const { mutate: addTaskfromOtherTask } = useImportMicroTasksFromTask({
    taskId,
  });
  const { mutate: addMicroTasksFromCsv } = useAddMicroTasksFromCsv({ taskId });
  const { mutate: addMicroTasksFromAudio } = useAddMicroTasksFromAudio({
    taskId,
  });

  const handleAddSingleMicroTask = (formData: {
    instruction: string;
    is_test: boolean;
    text: string;
    taskId: string;
    audioFiles?: File[];
  }) => {
    if (formData.audioFiles && formData.audioFiles.length > 0) {
      // If audio files are provided, create separate microtasks for each audio file
      formData.audioFiles.forEach((file) => {
        addMicroTasksFromAudio({
          file,
          is_test: formData.is_test,
          instruction: formData.instruction,
        });
      });
    } else {
      // Handle text-based microtask
      addSingleMicroTask(formData);
    }
  };

  const handleAudioUpload = (uploadData: {
    files: File[];
    is_test: boolean;
    instruction: string;
  }) => {
    // Process each file separately or send all files together
    // For now, let's process each file individually
    uploadData.files.forEach((file) => {
      addMicroTasksFromAudio({
        file,
        is_test: uploadData.is_test,
        instruction: uploadData.instruction,
      });
    });
  };
  const handleTaskForTask = (formData: {
    taskId: string;
    source_task_id: string;
    from_micro_task: boolean;
    from_data_set: boolean;
    limit?: number | null;
  }) => {
    addTaskfromOtherTask({
      targetTaskId: formData.taskId,
      source_task_id: formData.source_task_id,
      from_micro_task: formData.from_micro_task,
      from_data_set: formData.from_data_set,
      limit: formData.limit ? formData.limit : null,
    });
  };
  const handleCsvUpload = (uploadData: { file: File }) => {
    addMicroTasksFromCsv(uploadData);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportMenu]);
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
  const [removedUserId, setRemovedUserId] = useState<string>("");
  const RemoveUserMutation = useRemoveTaskUser();
  const ToggleActivateUserMutation = useToggleActivateTaskUser();
  const handleActivateUser = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    if (isRemoving) return; // Prevent multiple clicks

    setIsRemoving(true);

    try {
      await ToggleActivateUserMutation.mutateAsync({
        taskId,
        user_id: userId,
      });
    } catch (err) {
      console.error("Error removing user:", err);
      // Optionally show toast notification here
    } finally {
      setIsRemoving(false);
    }
  };
  const handleRemove = async (e: React.FormEvent, userId: string) => {
    e.preventDefault();
    if (isRemoving) return; // Prevent multiple clicks

    setIsRemoving(true);

    try {
      await RemoveUserMutation.mutateAsync({
        taskId,
        user_id: userId,
      });
    } catch (err) {
      console.error("Error removing user:", err);
      // Optionally show toast notification here
    } finally {
      setIsRemoving(false);
    }
  };
  if (isTaskLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Error loading task: {(error as Error).message}
        </p>
      </div>
    );
  }

  if (!task) {
    return <div className="p-6">Task is Loading.</div>;
  }

  return (
    <div className="w-full max-w-full p-4">
      {/* Header */}
      <div className="">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-600">{task.name}</h2>{" "}
          <span
            className={`text-xs  px-2 py-2 rounded-2xl text-gray-600 ${
              task.is_closed ? "text-red-500" : "text-[#037847] bg-[#ECFDF3]"
            }`}
          >
            {task.is_closed ? "Inactive" : "Active"}
          </span>
        </div>

        <div className="mt-3 mb-3 text-sm text-gray-500">
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded mr-2">
            {task.taskType?.task_type}
          </span>
          Created on{" "}
          {task.created_date ? formatDateMedium(task.created_date) : ""}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 mb-4">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("Task Details")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "Task Details"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-500"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              setActiveTab("Micro Tasks");
              setMicroTaskPage(1); // Reset page on tab switch
              setTaskSearchQuery(""); // Reset search
            }}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "Micro Tasks"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-500"
            }`}
          >
            Micro Tasks
          </button>
          <button
            onClick={() => {
              setActiveTab("Users");
              setUserPage(1); // Reset page on tab switch
              setUserSearchQuery(""); // Reset search
            }}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "Users"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-500"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => {
              setActiveTab("submissions");
              setUserPage(1); // Reset page on tab switch
              setUserSearchQuery(""); // Reset search
            }}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "submissions"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-500"
            }`}
          >
            Submissions
          </button>
          <button
            onClick={() => setActiveTab("Task distribution")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "Task distribution"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-500"
            }`}
          >
            Task distribution
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "Task Details" && (
        <TaskDetailsGeneral type={true} task={task} />
      )}

      {activeTab === "Micro Tasks" && (
        <div>
          <MicroTaskList
            taskId={taskId}
            microTaskPage={microTaskPage}
            setMicroTaskPage={setMicroTaskPage}
            microTaskPageSize={microTaskPageSize}
            setMicroTaskPageSize={setMicroTaskPageSize}
            searchQuery={debouncedTaskSearch}
            taskType={taskData.data?.taskType.task_type || ""}
            verificationStatus={microTaskVerificationStatus}
            setVerificationStatus={setMicroTaskVerificationStatus}
            showCreateMicroTaskForm={showCreateMicroTaskForm}
            setShowCreateMicroTaskForm={setShowCreateMicroTaskForm}
            taskMetadata={task}
            onSubmitSingle={handleAddSingleMicroTask}
            onSubmitCsv={handleCsvUpload}
            onSubmitAudio={handleAudioUpload}
            onSubmitTask={handleTaskForTask}
          />
        </div>
      )}

      {activeTab === "Users" && (
        <div>
          {userSubmissionsView ? (
            <>
              <button
                onClick={() => {
                  setUserSubmissionsView(false);
                }}
                className="flex items-center gap-2 mb-4 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.5 5L7.5 10L12.5 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>{" "}
                <span className="text-sm font-medium">Back</span>
              </button>
              <TaskDatasetSubmit
                task_id={taskId}
                contributor_id={contributor_id}
                user={selectedUser}
                taskType={task?.taskType.task_type}
              />
            </>
          ) : (
            <>
              <div className="space-y-4">
                {/* Invite Users Section */}
                <AssignFacilltatorContributors
                  taskID={taskId}
                  onCancel={() => setShowFormFacilitator(false)}
                  open={showFormFacilitator}
                  setopen={setShowFormFacilitator}
                  selectedFacilitator={selectedFacilitator}
                />
                {showListFacilitator && (
                  <ShowFacilltatorContributors
                    taskID={taskId}
                    onCancel={() => setListFormFacilitator(false)}
                    open={showListFacilitator}
                    selectedFacilitator={selectedFacilitator}
                  />
                )}
                <div className="border border-gray-100 rounded-lg bg-white ">
                  <button
                    onClick={() => setShowInviteUsers(!showInviteUsers)}
                    className={`w-full flex items-center justify-between p-4 text-left text-sm font-medium text-gray-500 hover:bg-gray-50 ${showInviteUsers ? "bg-gray-50" : "bg-white"}`}
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span>Invite Users</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        showInviteUsers ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {showInviteUsers && (
                    <div className="p-4 border-t border-gray-100">
                      <div className="space-y-4">
                        <div
                          className={`grid ${task.is_public ? "grid-cols-2" : "grid-cols-3"} gap-4`}
                        >
                          <div className="border border-gray-100 rounded-lg p-4 bg-white ">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-purple-200 flex items-center justify-center rounded-full">
                                <span className="text-purple-800 font-medium text-sm">
                                  Re
                                </span>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-900">
                                  Reviewer
                                </h3>
                                <p className="text-xs text-gray-500">
                                  Invite a reviewer to provide feedback
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setMemebrType("Reviewers");
                                setTimeout(() => {
                                  setShowCreateMemberForm(true);
                                }, 20);
                              }}
                              className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Invite Reviewers
                            </button>
                          </div>

                          {showCreateMemberForm ? (
                            <CreateProjectMemeber
                              open={showCreateMemberForm}
                              setOpen={setShowCreateMemberForm}
                              taskId={taskId}
                              onCancel={() => setShowCreateMemberForm(false)}
                              memberType={memebrType}
                            />
                          ) : null}

                          {!task.is_public && (
                            <>
                              {showCreateContributorsForm ? (
                                <CreateContributors
                                  open={showCreateContributorsForm}
                                  setOpen={setShowCreateContributorsForm}
                                  taskId={taskId}
                                  onCancel={() =>
                                    setShowCreateContributorsForm(false)
                                  }
                                  memberType={memebrType}
                                />
                              ) : null}

                              <div className="border border-gray-100 rounded-lg p-4 bg-white ">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-8 h-8 bg-blue-200 flex items-center justify-center rounded-full">
                                    <span className="text-blue-800 font-medium text-sm">
                                      Co
                                    </span>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-medium text-gray-900">
                                      Contributor
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                      Click to invite a contributor to
                                      collaborate on the task
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setMemebrType("Contributors");
                                    setShowCreateContributorsForm(true);
                                  }}
                                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                >
                                  <Users className="h-4 w-4 mr-2" />
                                  Invite Contributor
                                </button>
                              </div>
                            </>
                          )}

                          <div className="border border-gray-100 rounded-lg p-4 bg-white ">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-green-200 flex items-center justify-center rounded-full">
                                <span className="text-green-800 font-medium text-sm">
                                  FA
                                </span>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-900">
                                  Facilitator
                                </h3>
                                <p className="text-xs text-gray-500">
                                  Invite a facilitator to facilitate the task
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setMemebrType("Facilitator");
                                setTimeout(() => {
                                  setShowCreateMemberForm(true);
                                }, 20);
                              }}
                              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Invite Facilitator
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Invite via Invitation Link Section */}
                <div
                  className={`border border-gray-100 rounded-lg  overflow-y-auto overflow-x-auto`}
                >
                  <button
                    onClick={() => setShowInviteLink(!showInviteLink)}
                    className={`${showInviteLink ? " bg-gray-50" : " bg-white "} w-full flex items-center justify-between p-4 text-left text-sm font-medium text-gray-500 hover:bg-gray-50`}
                  >
                    <div className={` flex items-center space-x-2`}>
                      <Link2 className="h-5 w-5 text-gray-400" />
                      <span>Invite via Invitation Link</span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        showInviteLink ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {showInviteLink && (
                    <div className="p-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-500">
                            Organization
                          </label>
                          <select
                            value={selectedOrganization}
                            onChange={(e) =>
                              setSelectedOrganization(e.target.value)
                            }
                            className="w-full p-2 border border-gray-100 rounded focus:outline-none focus:border-primary"
                          >
                            <option value="">Select Organization</option>
                            {organizationOptions.map(
                              (organization: { id: string; name: string }) => (
                                <option
                                  key={organization.id}
                                  value={organization.id}
                                >
                                  {organization.name}
                                </option>
                              ),
                            )}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-500">
                            Role
                          </label>
                          <select
                            value={selectedRole}
                            onChange={(e) =>
                              setSelectedRole(
                                e.target.value as
                                  | "Contributor"
                                  | "Reviewer"
                                  | "",
                              )
                            }
                            className="w-full p-2 border border-gray-100 rounded focus:outline-none focus:border-primary"
                          >
                            <option value="">Select Role</option>
                            <option value="Contributor">Contributor</option>
                            <option value="Reviewer">Reviewer</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-500">
                            Expiry Date (leave blank for no expiration)
                          </label>
                          <input
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-full p-2 border border-gray-100 rounded focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-500">
                            Max Invitations (0 means no limit)
                          </label>
                          <input
                            type="number"
                            value={maxInvitations}
                            onChange={(e) =>
                              setMaxInvitations(Number(e.target.value))
                            }
                            min={0}
                            className="w-full p-2 border border-gray-100 rounded focus:outline-none focus:border-primary"
                          />
                        </div>
                        <Dialog
                          open={showGeneratedLinkAddress}
                          onOpenChange={setShowGenerateLinkAddress}
                        >
                          <Button
                            className="mt-6 bg-primary text-white flex items-center gap-2"
                            onClick={handleGenerateLink}
                            disabled={addLinkMutation.isPending}
                          >
                            <svg
                              width="19"
                              height="20"
                              viewBox="0 0 19 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.8335 10.8333C8.19138 11.3118 8.64796 11.7077 9.17229 11.9941C9.69662 12.2806 10.2764 12.4509 10.8724 12.4936C11.4683 12.5363 12.0665 12.4503 12.6263 12.2415C13.1861 12.0327 13.6944 11.7059 14.1168 11.2833L16.6168 8.78334C17.3758 7.9975 17.7958 6.94499 17.7863 5.85251C17.7768 4.76002 17.3386 3.71497 16.5661 2.94243C15.7935 2.1699 14.7485 1.7317 13.656 1.7222C12.5635 1.71271 11.511 2.13269 10.7252 2.89168L9.29183 4.31668M11.1668 9.16668C10.809 8.68824 10.3524 8.29236 9.82804 8.00589C9.30371 7.71943 8.72391 7.54908 8.12796 7.5064C7.532 7.46372 6.93384 7.54971 6.37405 7.75853C5.81425 7.96735 5.3059 8.29412 4.8835 8.71668L2.3835 11.2167C1.62451 12.0025 1.20453 13.055 1.21402 14.1475C1.22352 15.24 1.66172 16.2851 2.43426 17.0576C3.20679 17.8301 4.25184 18.2683 5.34433 18.2778C6.43681 18.2873 7.48932 17.8673 8.27517 17.1083L9.70017 15.6833"
                                stroke="white"
                                strokeWidth="1.66667"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Generate Link
                          </Button>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Generated Invitation Link
                              </DialogTitle>
                            </DialogHeader>
                            <div className="text-sm text-gray-600">
                              <p>{generatedLinkAddress}</p>
                              <p className="mt-2">
                                Expiration:{" "}
                                {generatedLinkExpiry
                                  ? formatDateMedium(generatedLinkExpiry)
                                  : "No expiration"}
                              </p>
                              <Button
                                onClick={handleCopy}
                                className="mt-6 bg-primary text-white flex items-center gap-2"
                              >
                                {copied ? "Copied!" : "Copy Link"}
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="rounded-md px-3 py-1 text-sm"></div>
                        <div className="border border-gray-100 rounded-md px-3 py-1 flex items-center"></div>
                      </div>
                      <h4 className="text-md font-semibold text-gray-500 mb-2">
                        Generated Links
                      </h4>
                      <div className="rounded-md border border-gray-100 bg-white overflow-hidden relative">
                        {isInvitationLoading && (
                          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        )}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-sm font-bold text-gray-500">
                                Organization
                              </TableHead>
                              <TableHead className="text-sm font-bold text-gray-500">
                                Link
                              </TableHead>
                              <TableHead className="text-sm font-bold text-gray-500">
                                Date Created
                              </TableHead>
                              <TableHead className="text-sm font-bold text-gray-500">
                                Expiration
                              </TableHead>
                              <TableHead className="text-sm font-bold text-gray-500"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invitationLinks.length ? (
                              invitationLinks.map((link) => (
                                <TableRow
                                  key={link.id}
                                  className="border-gray-100"
                                >
                                  <TableCell className="py-5 px-2 text-sm">
                                    {link.organization}
                                  </TableCell>
                                  <TableCell className="py-5 px-2 text-sm">
                                    {link.link}
                                  </TableCell>
                                  <TableCell className="py-5 px-2 text-sm">
                                    {link.dateCreated}
                                  </TableCell>
                                  <TableCell className="py-5 px-2 text-sm">
                                    {link.expiration}
                                  </TableCell>
                                  <TableCell className="py-5 px-2 text-sm">
                                    <button
                                      onClick={() =>
                                        navigator.clipboard
                                          .writeText(link.link)
                                          .then(() =>
                                            toast.success(
                                              "Link copied to clipboard!",
                                            ),
                                          )
                                          .catch(() =>
                                            toast.error("Failed to copy link"),
                                          )
                                      }
                                      className="text-gray-500 hover:text-gray-500"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="h-24 text-center text-gray-600"
                                >
                                  {isInvitationLoading
                                    ? ""
                                    : "No links generated."}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex items-center justify-between py-4">
                        <PaginationControls
                          pagination={{
                            pageCount: invitationTotalPages,
                            page: invitationPage,
                            setPage: setInvitationPage,
                            pageSize: invitationPageSize,
                            setPageSize: setInvitationPageSize,
                            showingText:
                              invitationTotalElements > 0
                                ? `Showing ${invitationStartRecord} to ${invitationEndRecord} out of ${invitationTotalElements} records`
                                : "",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 mt-6">
                <div className="rounded-md px-3 py-1 text-sm"></div>
                <div className="flex justify-between items-center w-full">
                  <div className="border border-gray-100 rounded-md px-3 py-1 flex items-center">
                    <Search className="h-4 w-4 text-gray-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    />
                  </div>
                  {roleSearch === "Contributor" && (
                    <>
                      {showExport && (
                        <>
                          <ExportUserTask
                            type={showExportType}
                            taskData={taskData}
                            onClose={() => setShowExport(false)}
                          />
                        </>
                      )}
                      <div className="flex justify-end items-center mr-10 relative">
                        <Button
                          onClick={() => setShowExportMenu(true)}
                          className="bg-primary text-white flex items-center gap-2"
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 4.5V14.5M12 4.5C11.2998 4.5 9.99153 6.4943 9.5 7M12 4.5C12.7002 4.5 14.0085 6.4943 14.5 7"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            ``{" "}
                            <path
                              d="M20 16.5C20 18.982 19.482 19.5 17 19.5H7C4.518 19.5 4 18.982 4 16.5"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Export List
                        </Button>
                        {showExportMenu && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg z-50 dropdown-menu"
                          >
                            <button
                              onClick={() => {
                                setShowExportType("CSV"), setShowExport(true);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                            >
                              Export as CSV
                            </button>
                            <button
                              onClick={() => {
                                setShowExportType("task"), setShowExport(true);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                            >
                              Import to task
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {roleSearch === "Facilitator" && (
                    <Button
                      onClick={() => handleAutomaticAssign(taskId)}
                      className="bg-primary text-white flex items-center gap-2"
                    >
                      <svg
                        width="34"
                        height="34"
                        viewBox="0 0 34 34"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_2692_18437)">
                          <path
                            d="M11.4097 22.6202L6.58747 18.7622C5.20728 17.6582 5.57368 15.467 7.23885 14.8731L21.2898 9.85526C23.0835 9.21426 24.8157 10.9465 24.1747 12.7402L19.1576 26.7919C18.5629 28.4563 16.3725 28.8235 15.2685 27.4433L11.4097 22.6202ZM11.4097 22.6202L16.9975 17.0324"
                            stroke="white"
                            strokeWidth="1.69336"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_2692_18437">
                            <rect
                              width="24"
                              height="24"
                              fill="white"
                              transform="translate(0.0585938 17) rotate(-45)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                      Auto Distribute Contributors
                    </Button>
                  )}
                </div>
              </div>
              <div className="border-b border-gray-100 mb-4">
                <nav className="flex space-x-4">
                  <button
                    onClick={() => setRoleSearch("Facilitator")}
                    className={`py-2 px-4 text-sm font-medium ${
                      roleSearch === "Facilitator"
                        ? "bg-primary text-white rounded-2xl px-2 py-2"
                        : "text-gray-500 hover:text-gray-500"
                    }`}
                  >
                    Facilitator
                  </button>

                  <button
                    onClick={() => setRoleSearch("Contributor")}
                    className={`py-2 px-4 text-sm font-medium ${
                      roleSearch === "Contributor"
                        ? " bg-primary text-white rounded-2xl px-2 py-2"
                        : "text-gray-500 hover:text-gray-500"
                    }`}
                  >
                    Contributor
                  </button>

                  <button
                    onClick={() => setRoleSearch("Reviewer")}
                    className={`py-2 px-4 text-sm font-medium ${
                      roleSearch === "Reviewer"
                        ? "bg-primary text-white rounded-2xl px-2 py-2"
                        : "text-gray-500 hover:text-gray-500"
                    }`}
                  >
                    Reviewer
                  </button>
                </nav>
              </div>
              <div className="rounded-md border border-gray-100 bg-white overflow-hidden relative">
                {isUserLoading && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}

                <Table>
                  <TableHeader>
                    {userTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="text-sm font-bold text-gray-500 bg-gray-50 px-2 py-5"
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
                              className="py-5 px-2 text-sm"
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
            </>
          )}
        </div>
      )}
      {activeTab === "submissions" && <TaskDataset taskId={taskId} />}
      {activeTab === "Task distribution" && (
        <>
          <div className="border-b border-gray-100 mb-4">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveDistributionTab("Contributors")}
                className={`py-2 px-4 text-sm font-medium ${
                  activeDistributionTab === "Contributors"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-500"
                }`}
              >
                Contributors
              </button>
              <button
                onClick={() => {
                  setActiveDistributionTab("Reviewers");
                }}
                className={`py-2 px-4 text-sm font-medium ${
                  activeDistributionTab === "Reviewers"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-500"
                }`}
              >
                Reviewers
              </button>
            </nav>
          </div>
          {activeDistributionTab === "Contributors" && (
            <>
              <div className="flex px-3 py-3 flex-col space-y-4 border rounded-2xl border-gray-100">
                <div className=" bg-white  p-5">
                  <div className="flex justify-start">
                    <span className="flex flex-row text-lg font-semibold text-gray-500">
                      <span className="flex items-center gap-0">
                        <svg
                          width="34"
                          height="34"
                          viewBox="0 0 34 34"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="inline-block align-middle"
                          style={{ marginRight: 0 }}
                        >
                          <g clipPath="url(#clip0_2013_13894)">
                            <path
                              d="M11.3502 22.5907L6.5279 18.7327C5.14771 17.6287 5.51411 15.4375 7.17928 14.8436L21.2302 9.82572C23.0239 9.18472 24.7561 10.9169 24.1151 12.7106L19.0981 26.7623C18.5034 28.4267 16.3129 28.7939 15.2089 27.4137L11.3502 22.5907ZM11.3502 22.5907L16.938 17.0028"
                              stroke="black"
                              strokeWidth="1.69336"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_2013_13894">
                              <rect width="34" height="34" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                        <span className="inline-block text-gray-600 align-middle ml-0">
                          Contributor task distribution
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex justify-end items-center mr-10 relative">
                  <Button
                    variant="outline"
                    className="bg-white text-primary hover:bg-blue-700 flex items-center gap-2"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    Task Actions
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg z-50 dropdown-menu">
                      <div className="py-1">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                          onClick={() => {
                            handleTaskClose();
                            setIsDropdownOpen(false);
                          }}
                        >
                          {task.is_closed ? "Open Task" : "Close Task"}
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                          onClick={() => {
                            handleTaskDistrubuion();
                            setIsDropdownOpen(false);
                          }}
                        >
                          {task.distribution_started
                            ? "Redistribute Task "
                            : "Start Task Distribution"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <TaskStatistics task_id={taskId} />
            </>
          )}
          {activeDistributionTab === "Reviewers" && (
            <>
              <div className="flex px-3 py-3 flex-col space-y-4 border rounded-2xl border-gray-100">
                <div className=" bg-white  p-5">
                  <div className="flex justify-start">
                    <span className="flex flex-row text-lg font-semibold text-gray-500">
                      <span className="flex items-center gap-0">
                        <svg
                          width="34"
                          height="34"
                          viewBox="0 0 34 34"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="inline-block align-middle"
                          style={{ marginRight: 0 }}
                        >
                          <g clipPath="url(#clip0_2013_13894)">
                            <path
                              d="M11.3502 22.5907L6.5279 18.7327C5.14771 17.6287 5.51411 15.4375 7.17928 14.8436L21.2302 9.82572C23.0239 9.18472 24.7561 10.9169 24.1151 12.7106L19.0981 26.7623C18.5034 28.4267 16.3129 28.7939 15.2089 27.4137L11.3502 22.5907ZM11.3502 22.5907L16.938 17.0028"
                              stroke="black"
                              strokeWidth="1.69336"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_2013_13894">
                              <rect width="34" height="34" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                        <span className="inline-block text-gray-600 align-middle ml-0">
                          Reviewer task distribution
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex justify-end items-center mr-10 relative">
                  <Button
                    variant="outline"
                    className="bg-white text-primary hover:bg-blue-700 flex items-center gap-2"
                    onClick={() =>
                      setIsDropdownOpenReviewer(!isDropdownOpenReviewer)
                    }
                  >
                    Task Actions
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  {isDropdownOpenReviewer && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg z-50 dropdown-menu">
                      <div className="py-1">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
                          onClick={() => {
                            handleTaskReviwerDistrubuion();
                            setIsDropdownOpen(false);
                          }}
                        >
                          Distribute Task
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <TaskStatisticsReviwer task_id={taskId} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TaskDetailPage;
