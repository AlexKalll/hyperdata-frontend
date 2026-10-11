"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTask } from "@/lib/hooks/useProject";
import { TaskInstructions } from "@/app/types/project";
import InstructionView from "@/app/components/projectManager/instructionView";
import { useGetTaskMicroTaskDetail } from "@/lib/hooks/useMicrotask";
import MicroTaskList from "@/app/components/project/microTaskList";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  Table,
  TableBody,
  TableCell,
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
  Copy,
  Plus,
  Users,
  Link2,
  ChevronDown,
} from "lucide-react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  flexRender,
} from "@tanstack/react-table";
import { Task, MicroTask } from "@/app/types/project";
import { formatDateMedium } from "@/app/types/dateUtils";
import { useGetTaskUserDetail } from "@/lib/hooks/useProject";
import { UserTask } from "@/app/types/global";
import TaskDetailsGeneral from "@/app/components/projectManager/taskDetailsGeneral";
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Button>
        {Array.from(
          { length: Math.max(1, pagination.pageCount) },
          (_, i) => i + 1
        ).map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pagination.page === pageNumber ? "outline" : "ghost"}
            className={
              pagination.page === pageNumber ? "border-brand text-brand" : ""
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

const TaskDetailPage: React.FC = () => {
  const params = useParams();
  const taskId = params.id as string;

  const { data: taskData, isLoading: isTaskLoading, error } = useTask(taskId);
  const task = taskData?.data;
  const [microTaskVerificationStatus, setMicroTaskVerificationStatus] =
    useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<
    "Task Details" | "Micro Tasks" | "Users"
  >("Task Details");
  const [microTaskPage, setMicroTaskPage] = useState(1);
  const [microTaskPageSize, setMicroTaskPageSize] = useState(10);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<string>();
  const debouncedTaskSearch = useDebounce(taskSearchQuery, 500);
  const [isInstructionFullScreen, setIsInstructionFullScreen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<any>(null);
  const handleOpenInstruction = (instruction: TaskInstructions) => {
    setSelectedInstruction(instruction);
    setTimeout(() => {
      setIsInstructionFullScreen(true);
    }, 100);
  };
  const { data: microtasksData, isLoading: isMicroTaskLoading } =
    useGetTaskMicroTaskDetail({
      microTaskPage,
      microTaskPageSize,
      searchQuery: debouncedTaskSearch,
      taskId,
      verificationStatus,
    });

  const microtasks: MicroTask[] = microtasksData?.data?.result || [];
  const microTaskTotalElements = microtasksData?.data?.total || 0;
  const microTaskTotalPages = microtasksData?.data?.totalPages || 1;
  const microTaskStartRecord = microtasks.length
    ? (microTaskPage - 1) * microTaskPageSize + 1
    : 0;
  const microTaskEndRecord = Math.min(
    microTaskPage * microTaskPageSize,
    microTaskTotalElements
  );
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const debouncedUserSearch = useDebounce(userSearchQuery, 500);
  const [userVerificationStatus, setUserVerificationStatus] = useState<
    string | undefined
  >(undefined);
  const microTaskColumns: ColumnDef<MicroTask>[] = [
    {
      accessorKey: "code",
      header: "ID",
      enableSorting: true,
    },
    {
      accessorKey: "text",
      header: "Text",
      enableSorting: true,
    },
    {
      accessorKey: "is_test",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="flex items-center space-x-1">
          <span
            className={`h-2 w-2 rounded-full ${
              row.original.is_test ? "bg-purple-500" : "bg-green-500"
            }`}
          ></span>
          <span>{row.original.is_test ? "Inactive" : "Active"}</span>
        </span>
      ),
    },

    {
      accessorKey: "created_date",
      header: "Date Created",
      enableSorting: true,
    },
    {
      accessorKey: "updated_date",
      header: "Date Updated",
      enableSorting: true,
    },
    {
      accessorKey: "actions",
      header: "",
      cell: () => (
        <div className="flex space-x-2">
          <button aria-label="View microtask">
            <svg
              fill="none"
              stroke="currentColor"
              height="20"
              viewBox="0 0 21 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6.66667C2 6.66667 5.73096 2.5 10.3333 2.5C14.9357 2.5 18.6667 6.66667 18.6667 6.66667"
                stroke="#667085"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
              <path
                d="M18.2867 10.8708C18.54 11.226 18.6667 11.4037 18.6667 11.6666C18.6667 11.9295 18.54 12.1072 18.2867 12.4624C17.1483 14.0588 14.241 17.4999 10.3333 17.4999C6.42565 17.4999 3.51842 14.0588 2.38003 12.4624C2.12667 12.1072 2 11.9295 2 11.6666C2 11.4037 2.12667 11.226 2.38003 10.8708C3.51842 9.27442 6.42565 5.83325 10.3333 5.83325C14.241 5.83325 17.1483 9.27442 18.2867 10.8708Z"
                stroke="#667085"
                strokeWidth="1.25"
              />
              <path
                d="M12.8333 11.6667C12.8333 10.286 11.7141 9.16675 10.3333 9.16675C8.95256 9.16675 7.83331 10.286 7.83331 11.6667C7.83331 13.0475 8.95256 14.1667 10.3333 14.1667C11.7141 14.1667 12.8333 13.0475 12.8333 11.6667Z"
                stroke="#667085"
                strokeWidth="1.25"
              />
            </svg>
          </button>
          <button aria-label="More options">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      ),
    },
  ];
  const { data: usersData, isLoading: isUserLoading } = useGetTaskUserDetail({
    userPage,
    userPageSize,
    searchQuery: debouncedUserSearch,
    taskId,
    verificationStatus: userVerificationStatus,
  });

  const users: UserTask[] = usersData?.data?.result || [];
  const userColumns: ColumnDef<UserTask>[] = [
    {
      accessorKey: "fullName",
      header: "Full Name",
      enableSorting: true,
      cell: ({ row }) => (
        <span>
          {row.original.user?.first_name} {row.original.user?.middle_name}{" "}
          {row.original.user?.last_name}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="flex items-center space-x-1">
          <span>{row.original.user.email}</span>
        </span>
      ),
    },
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
  ];
  const [sorting, setSorting] = useState<SortingState>([]);
  const userTotalElements = usersData?.data?.total || 0;
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

  const microTaskTable = useReactTable({
    data: microtasks,
    columns: microTaskColumns,
    state: {
      sorting: [],
      pagination: { pageIndex: microTaskPage - 1, pageSize: microTaskPageSize },
    },

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: microTaskTotalElements,
  });

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
    return <div className="p-6">Task loading</div>;
  }

  return (
    <div className="w-full max-w-full py-4 ">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-800">{task.name}</h2>
        </div>
        <div className="text-sm text-gray-500">
          Created on{" "}
          {task.created_date ? formatDateMedium(task.created_date) : ""} • Last
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 mb-4">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab("Task Details")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "Task Details"
                ? "border-b-2 border-blue-600 text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("Micro Tasks")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "Micro Tasks"
                ? "border-b-2 border-blue-600 text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Micro Tasks
          </button>
          <button
            onClick={() => setActiveTab("Users")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "Users"
                ? "border-b-2 border-blue-600 text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Users
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "Task Details" && (
        <>
          <TaskDetailsGeneral type={false} task={task} />
        </>
      )}

      {activeTab === "Micro Tasks" && (
        <div>
          <MicroTaskList
            taskType={task.taskType.task_type}
            taskId={taskId}
            microTaskPage={microTaskPage}
            setMicroTaskPage={setMicroTaskPage}
            microTaskPageSize={microTaskPageSize}
            setMicroTaskPageSize={setMicroTaskPageSize}
            searchQuery={debouncedTaskSearch}
            verificationStatus={microTaskVerificationStatus}
            setVerificationStatus={setMicroTaskVerificationStatus}
          />
        </div>
      )}

      {activeTab === "Users" && (
        <div>
          <div className="rounded-md border border-gray-100 bg-white overflow-hidden relative">
            {isUserLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                {/* <Loader2 className="w-6 h-6 animate-spin" /> */}
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
                        <TableCell key={cell.id} className="py-5 px-2 text-sm">
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
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailPage;
