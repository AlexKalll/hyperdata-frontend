"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { renderPaginationButtons } from "@/components/ui/paginationHelper";
import { useBasedata, useBasedataAnnotation } from "@/lib/hooks/useBasedata";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialogLeft";
import {
  useGetTaskMicroTaskResponseForReviewers,
  useRejectionMicrotask,
  useApprove,
  useFlagMicrotask,
  useReject,
} from "@/lib/hooks/useReviewer";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2,
  Eye,
} from "lucide-react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  Row,
} from "@tanstack/react-table";
import { ReviewerDatset } from "@/app/types/project";
import { SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { formatDateMedium } from "@/app/types/dateUtils";

interface MicroTaskListProps {
  title: string;
  taskType: string;
  createdDate: string;
  taskStatus: boolean;
  taskId: string;
  microTaskPage: number;
  setMicroTaskPage: (page: number) => void;
  microTaskPageSize: number;
  setMicroTaskPageSize: (pageSize: number) => void;
  searchQuery: string;
  verificationStatus?: string;
  status_data: string;
  setVerificationStatus: (status: string | undefined) => void;
  onInnerDialogOpenChange?: (open: boolean) => void;
}

interface dynamicResponse {
  id: string;
  name: string;
  code: string;
  continent: string;
  created_by: string;
  updated_by: string;
  created_date: string;
  updated_date: string;
}

interface dynamicResponsedata {
  message: string;
  code: number;
  data: dynamicResponse[];
}

interface PaginationProps {
  pageCount: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  showingText: string;
}

interface RejectPayload {
  reason: string;
  comment: string;
  rejection_type_id: string;
}

interface ApprovePayload {
  microTaskId: string;
  annotation_id: string;
}

interface FlagPayload {
  microTaskId: string;
  flag_type_id: string;
  comment: string;
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
          className="border border-gray-100 rounded-md md:text-sm text-xs px-2 py-1 bg-white"
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
          buttonClassName: { active: "border-brand text-brand", inactive: "" }
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

const MicroTaskList: React.FC<MicroTaskListProps> = ({
  title,
  taskType,
  taskId,
  taskStatus,
  searchQuery,
  verificationStatus,
  status_data,
  createdDate,
  setVerificationStatus,
  onInnerDialogOpenChange,
}) => {
  const { data: session } = useSession();
  const { data: dynamicResponsedataAnnotation, isLoading: annotationLoading } =
    useQuery<dynamicResponsedata>({
      queryKey: ["annotation"],
      queryFn: async () => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const response = await axios.get<dynamicResponsedata>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/annotation`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
        return response.data;
      },
      enabled: !!session?.access_token,
    });
  const { data: dynamicResponsedataFlag, isLoading: flagLoading } =
    useQuery<dynamicResponsedata>({
      queryKey: ["flag-type"],
      queryFn: async () => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const response = await axios.get<dynamicResponsedata>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/flag-type/`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
        return response.data;
      },
      enabled: !!session?.access_token,
    });
  const [microTaskPage, setMicroTaskPage] = useState(1);
  const [microTaskPageSize, setMicroTaskPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedRejectionReasonIds, setSelectedRejectionReasonIds] = useState<
    string[]
  >([]);
  const [isRejectFlag, setIsRejectFlag] = useState(false);
  const [rejectionComment, setRejectionComment] = useState<string>("");
  const [rejectionSearch, setRejectionSearch] = useState<string>("");
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string>("");
  const [selectedAnnotationName, setSelectedAnnotationName] =
    useState<string>("");
  const [selectedFlagTypeId, setSelectedFlagTypeId] = useState<string>("");
  const [flagComment, setFlagComment] = useState<string>("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isFlagDialogOpen, setIsFlagDialogOpen] = useState(false);
  const [selectedMicroTaskId, setSelectedMicroTaskId] = useState<string | null>(
    null
  );
  const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMicroTask, setSelectedMicroTask] =
    useState<ReviewerDatset | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Reset page when status_data changes
  useEffect(() => {
    setMicroTaskPage(1);
  }, [status_data, setMicroTaskPage]);

  // Modal handlers
  const handleViewDetails = (microTask: ReviewerDatset) => {
    setSelectedMicroTask(microTask);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedMicroTask(null);
  };
  // Transform status_data to the correct format for the API
  const statusFilter = React.useMemo(() => {
    const normalizedStatus = status_data.toLowerCase();
    return normalizedStatus === "all" ? "" : status_data;
  }, [status_data]);

  const {
    data: microtasksData,
    isLoading: isMicroTaskLoading,
    error: microTaskError,
    isRefetching,
  } = useGetTaskMicroTaskResponseForReviewers({
    microTaskPage,
    microTaskPageSize,
    searchQuery,
    taskId,
    status: statusFilter,
    verificationStatus,
  });

  const { data: rejectionReasonsData } = useReject();

  const microtasks: ReviewerDatset[] = Array.isArray(
    microtasksData?.data?.result
  )
    ? microtasksData.data.result
    : [];
  const rejectionReasons =
    rejectionReasonsData && Array.isArray(rejectionReasonsData.data)
      ? rejectionReasonsData.data
      : [];
  const annotations =
    dynamicResponsedataAnnotation &&
    Array.isArray(dynamicResponsedataAnnotation.data)
      ? dynamicResponsedataAnnotation.data
      : [];
  const flagTypes =
    dynamicResponsedataFlag && Array.isArray(dynamicResponsedataFlag.data)
      ? dynamicResponsedataFlag.data
      : [];

  const microTaskTotalElements = microtasksData?.data?.total || 0;
  const microTaskTotalPages = microtasksData?.data?.totalPages || 1;
  const microTaskStartRecord = microtasks.length
    ? (microTaskPage - 1) * microTaskPageSize + 1
    : 0;
  const microTaskEndRecord = Math.min(
    microTaskPage * microTaskPageSize,
    microTaskTotalElements
  );
  const queryClient = useQueryClient();

  const RejectMicrotask = useRejectionMicrotask();
  const rejectMutation = async (microTaskId: string) => {
    try {
      const selectedReasons = rejectionReasons.filter(
        (reason: { id: string; name: string }) =>
          selectedRejectionReasonIds.includes(reason.id)
      );
      await RejectMicrotask.mutateAsync({
        microTaskId,
        rejection_type_ids: selectedRejectionReasonIds,
        comment: rejectionComment || "",
        flag: isRejectFlag,
      });
      toast.success("Microtask rejected successfully.");
      queryClient.invalidateQueries({
        queryKey: ["microtasks", taskId, microTaskPage, microTaskPageSize],
      });
      setIsRejectDialogOpen(false);
      setSelectedRejectionReasonIds([]);
      setRejectionComment("");
      handlePostMutation();
      setIsRejectFlag(false);
    } catch (error) {
      toast.error("Error rejecting microtask", {
        description: (error as any)?.message || "An unexpected error occurred",
      });
    }
  };

  const appproveMicrotask = useApprove();
  const approveMutation = async (microTaskId: string) => {
    try {
      await appproveMicrotask.mutateAsync({
        microTaskId,
        annotation_id: selectedAnnotationId,
        annotation: selectedAnnotationName,
      });
      toast.success("Microtask approved successfully.");
      queryClient.invalidateQueries({
        queryKey: ["microtasks", taskId, microTaskPage, microTaskPageSize],
      });
      setIsApproveDialogOpen(false);
      setSelectedAnnotationId("");
      handlePostMutation();
      setIsRejectFlag(false);
    } catch (error) {
      toast.error("Error approving microtask", {
        description: (error as any)?.message || "An unexpected error occurred",
      });
    }
  };

  const flagMicrotask = useFlagMicrotask();
  const flagMutation = async (microTaskId: string) => {
    try {
      const selectedFlagType = flagTypes.find(
        (flag: { id: string; name: string }) => flag.id === selectedFlagTypeId
      );
      await flagMicrotask.mutateAsync({
        microTaskId,
        flag_type_id: selectedFlagTypeId,
        comment: flagComment || "",
      });
      toast.success("Microtask flagged successfully.");
      queryClient.invalidateQueries({
        queryKey: ["microtasks", taskId, microTaskPage, microTaskPageSize],
      });
      setIsFlagDialogOpen(false);
      setSelectedFlagTypeId("");
      setFlagComment("");
      handlePostMutation();
    } catch (error) {
      toast.error("Error flagging microtask", {
        description: (error as any)?.message || "An unexpected error occurred",
      });
    }
  };

  const handlePostMutation = () => {
    if (currentRowIndex !== null && currentRowIndex < microtasks.length - 1) {
      const nextIndex = currentRowIndex + 1;
      setCurrentRowIndex(nextIndex);
      setSelectedMicroTaskId(microtasks[nextIndex].id);
    } else if (
      currentRowIndex === microtasks.length - 1 &&
      microTaskPage < microTaskTotalPages
    ) {
      setMicroTaskPage(microTaskPage + 1);
      setCurrentRowIndex(0);
      setSelectedMicroTaskId(null);
    } else {
      setIsDialogOpen(false);
      setCurrentRowIndex(null);
      setSelectedMicroTaskId(null);
      onInnerDialogOpenChange?.(false);
    }
  };

  const handleAccept = (microTaskId: string) => {
    setSelectedMicroTaskId(microTaskId);
    setIsApproveDialogOpen(true);
  };

  const handleReject = (microTaskId: string) => {
    setSelectedMicroTaskId(microTaskId);
    setIsRejectDialogOpen(true);
  };

  const handleFlag = (microTaskId: string) => {
    setSelectedMicroTaskId(microTaskId);
    setIsFlagDialogOpen(true);
  };

  const submitRejection = () => {
    if (selectedMicroTaskId && selectedRejectionReasonIds.length > 0) {
      return rejectMutation(selectedMicroTaskId);
    } else {
      toast.error("Please select at least one rejection reason.");
    }
  };

  const submitApproval = () => {
    if (selectedMicroTaskId && selectedAnnotationId) {
      return approveMutation(selectedMicroTaskId);
    } else {
      toast.error("Please select an annotation.");
    }
  };

  const submitFlag = () => {
    if (selectedMicroTaskId && selectedFlagTypeId) {
      return flagMutation(selectedMicroTaskId);
    } else {
      toast.error("Please select a flag type.");
    }
  };

  const handleNextMicroTask = () => {
    if (currentRowIndex !== null && currentRowIndex < microtasks.length - 1) {
      const nextIndex = currentRowIndex + 1;
      setCurrentRowIndex(nextIndex);
      setSelectedMicroTaskId(microtasks[nextIndex].id);
    } else if (
      currentRowIndex === microtasks.length - 1 &&
      microTaskPage < microTaskTotalPages
    ) {
      setMicroTaskPage(microTaskPage + 1);
      setCurrentRowIndex(0);
      setSelectedMicroTaskId(null);
    } else {
      setIsDialogOpen(false);
      setCurrentRowIndex(null);
      setSelectedMicroTaskId(null);
      setIsRejectFlag(false);
      onInnerDialogOpenChange?.(false);
    }
  };

  const handlePreviousMicroTask = () => {
    if (currentRowIndex !== null && currentRowIndex > 0) {
      const prevIndex = currentRowIndex - 1;
      setCurrentRowIndex(prevIndex);
      setSelectedMicroTaskId(microtasks[prevIndex].id);
    } else if (currentRowIndex === 0 && microTaskPage > 1) {
      setMicroTaskPage(microTaskPage - 1);
      setCurrentRowIndex(null); // Will be set to last index of previous page in useEffect
      setSelectedMicroTaskId(null);
    } else {
      setIsDialogOpen(false);
      setCurrentRowIndex(null);
      setSelectedMicroTaskId(null);
      onInnerDialogOpenChange?.(false);
       setIsRejectFlag(false);
    }
  };

  // Sync currentRowIndex and selectedMicroTaskId after page change
  useEffect(() => {
    if (
      microtasks.length > 0 &&
      currentRowIndex !== null &&
      isDialogOpen &&
      !isRefetching
    ) {
      if (currentRowIndex >= microtasks.length) {
        setCurrentRowIndex(microtasks.length - 1);
        setSelectedMicroTaskId(microtasks[microtasks.length - 1].id);
      } else {
        setSelectedMicroTaskId(microtasks[currentRowIndex]?.id || null);
      }
    } else if (microtasks.length === 0 && isDialogOpen && !isRefetching) {
      setIsDialogOpen(false);
      setCurrentRowIndex(null);
      setSelectedMicroTaskId(null);
      onInnerDialogOpenChange?.(false);
    }
  }, [microtasks, currentRowIndex, isDialogOpen, isRefetching]);

  const microTaskColumns: ColumnDef<ReviewerDatset>[] = [
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "microTask.code",
      header: "MicroTask Code",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex flex-row">
          <div
            className={`flex items-center max-w-[90px] rounded-2xl px-1 py-1 ${
              row.original.status?.toLowerCase() === "approved"
                ? "bg-[#F4FDF8]"
                : row.original.status?.toLowerCase() === "rejected"
                  ? "bg-[rgba(254,41,41,0.06)] text-[#FF0000]"
                  : row.original.status?.toLowerCase() === "pending"
                    ? "bg-[#FFF9F3]"
                    : row.original.status?.toLowerCase() === "flagged"
                      ? "bg-[#FFF6F3] text-[#B32F0D]"
                      : "bg-purple-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                row.original.status?.toLowerCase() === "approved"
                  ? "bg-green-500"
                  : row.original.status?.toLowerCase() === "rejected"
                    ? "bg-red-500"
                    : row.original.status?.toLowerCase() === "pending"
                      ? "bg-orange-500"
                      : row.original.status?.toLowerCase() === "flagged"
                        ? "bg-[#B32F0D]"
                        : "bg-purple-100"
              }`}
            ></span>
            <span className="truncate ml-2">{row.original.status}</span>
          </div>
          {row.original.is_flagged && (
            <div
              className={`flex items-center max-w-[90px] ml-2 rounded-2xl px-1 py-1 bg-[#FFF6F3] text-[#B32F0D]`}
            >
              <span className={`h-2 w-2 rounded-full `}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.9395 1.5H5.1415C3.66 1.5 2.92 1.5 2.46 1.9395C2 2.3785 2 3.086 2 4.5L2.053 7.5H7.94C9.0515 7.5 9.607 7.5 9.843 7.2125C9.908 7.1335 9.956 7.0425 9.983 6.9445C10.0825 6.592 9.749 6.1675 9.082 5.318C8.8045 4.965 8.666 4.788 8.641 4.588C8.63364 4.52973 8.63364 4.47077 8.641 4.4125C8.666 4.2115 8.8045 4.035 9.082 3.682C9.749 2.8325 10.082 2.408 9.9835 2.0555C9.95542 1.95737 9.90762 1.86601 9.843 1.787C9.6065 1.5 9.051 1.5 7.9395 1.5Z"
                    fill="#B32F0D"
                    stroke="#B32F0D"
                    strokeWidth="0.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 10.5V4"
                    stroke="#B32F0D"
                    strokeWidth="0.75"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="truncate ml-2">Flagged</span>
            </div>
          )}
        </div>
      ),
    },
    ...(status_data.toLowerCase() === "pending"
      ? [
          {
            accessorKey: "",
            header: "Action",
            cell: ({ row }: { row: Row<ReviewerDatset> }) => (
              <Button
                className="bg-primary text-white hover:bg-blue-700 flex items-center gap-2"
                onClick={() => {
                  setCurrentRowIndex(row.index);
                  setSelectedMicroTaskId(row.original.id);
                  setIsDialogOpen(true);
                  onInnerDialogOpenChange?.(true);
                  window.scrollTo(0, 0);
                }}
              >
                Open Task
              </Button>
            ),
          },
        ]
      : []),
    {
      accessorKey: "details",
      header: "Details",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          onClick={() => handleViewDetails(row.original)}
          className="text-gray-500 hover:text-grey-800 transition-colors p-1 rounded-full hover:bg-blue-50"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const microTaskTable = useReactTable({
    data: microtasks,
    columns: microTaskColumns,
    state: {
      sorting,
      pagination: { pageIndex: microTaskPage - 1, pageSize: microTaskPageSize },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    rowCount: microTaskTotalElements,
  });

  if (microTaskError) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Error loading microtasks: {(microTaskError as Error).message}
        </p>
      </div>
    );
  }

  return (
    <>
      {isDialogOpen || currentRowIndex !== null ? (
        <>
          {isDialogOpen && (
            <>
              <div className="">
                {/* Top Bar */}
                <div className="sticky top-0 z-10 p-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                  <button
                    className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setCurrentRowIndex(null);
                      setSelectedMicroTaskId(null);
                      onInnerDialogOpenChange?.(false);
                      setMicroTaskPage(1);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Micro tasks
                  </button>
                  <div className="font-semibold"></div>
                  <div className="w-10" />
                </div>
                <div className="p-5 mt-6 ">
                  <div className="flex items-start mb-2">
                    <span className="font-semibold text-2xl ml-2 text-gray-700">
                      {title}
                    </span>
                    <div
                      className={`flex items-center space-x-1 px-2 py-2 rounded-2xl ${
                        taskStatus ? "bg-red-500" : "bg-[#ECFDF3]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          taskStatus ? "bg-red-500" : "bg-[#037847]"
                        }`}
                      ></span>
                      <span
                        className={`text-xs text-gray-600 ${
                          taskStatus ? "text-red-500" : "text-[#037847]"
                        }`}
                      >
                        {taskStatus ? "Inactive" : "Active"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row items-start">
                    <span className="text-gray-500 px-2 py-1">
                      Type:{" "}
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        {taskType}
                      </span>
                      <span className="px-2 py-1 text-gray-500 rounded">
                        &middot;{" "}
                        {createdDate ? formatDateMedium(createdDate) : ""}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="max-w-[1000px] mx-auto">
                  <div className="px-4">
                    <div className="flex mr-6 justify-end space-x-2 mt-3">
                      {/* <Button
                        className="text-gray-500 rounded-2xl border-gray-400 bg-[#FCFCFD] px-2 hover:bg-yellow-50"
                        onClick={() =>
                          currentRowIndex !== null &&
                          handleFlag(microtasks[currentRowIndex].id)
                        }
                        disabled={currentRowIndex === null}
                      >
                        <svg
                          width="16"
                          height="17"
                          viewBox="0 0 16 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.6071 2.74658H7.02996C5.13665 2.74658 4.19001 2.74658 3.60184 3.30829C3.01367 3.87 3.01367 4.77405 3.01367 6.58215L3.08156 10.4177H10.6071C12.0283 10.4177 12.7388 10.4177 13.0403 10.0505C13.1237 9.94889 13.1848 9.83222 13.2199 9.7075C13.3466 9.25682 12.9203 8.71396 12.0676 7.62824C11.7129 7.17657 11.5356 6.95074 11.504 6.69409C11.4948 6.61972 11.4948 6.54458 11.504 6.47022C11.5356 6.21356 11.7129 5.98773 12.0676 5.53609C12.9203 4.45035 13.3466 3.90748 13.2199 3.45679C13.1848 3.33209 13.1237 3.21543 13.0403 3.11382C12.7388 2.74658 12.0283 2.74658 10.6071 2.74658Z"
                            stroke="#667085"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3.01367 14.2533V5.94287"
                            stroke="#667085"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        Flag
                      </Button> */}
                      <Button
                        className="text-white rounded-2xl bg-red-600 hover:bg-red-700"
                        onClick={() =>
                          currentRowIndex !== null &&
                          handleReject(microtasks[currentRowIndex].id)
                        }
                        disabled={currentRowIndex === null}
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 11 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.0063 0.981445L1.05664 9.93111M1.05664 0.981445L10.0063 9.93111"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Reject
                      </Button>
                      <Button
                        className="text-white rounded-2xl bg-[#54CB36] hover:bg-lime-600"
                        onClick={() =>
                          currentRowIndex !== null &&
                          handleAccept(microtasks[currentRowIndex].id)
                        }
                        disabled={currentRowIndex === null}
                      >
                        <svg
                          width="13"
                          height="11"
                          viewBox="0 0 13 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1.72266 6.91762L4.2797 9.47467L11.9508 1.43823"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Approve
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 w-full flex justify-center">
                    <div className="w-5/6 rounded-2xl border-gray-200 py-5 px-4">
                      {currentRowIndex !== null &&
                      microtasks[currentRowIndex] &&
                      !isRefetching ? (
                        <>
                          <div className="mb-4 border border-gray-100 rounded-lg px-6 py-3">
                            <div className="flex flex-row items-start mb-4 mt-4">
                              <span className="text-gray-500 px-2 py-1">
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                                  {taskType}
                                </span>
                                <span className="px-2 py-1 text-gray-500 rounded">
                                  &middot;{" "}
                                  {createdDate
                                    ? formatDateMedium(
                                        microtasks[currentRowIndex].microTask
                                          .created_date
                                      )
                                    : ""}
                                </span>
                              </span>
                            </div>
                            <div className="mr-4 flex space-x-1 m-10">
                              {currentRowIndex !== null &&
                              microTaskTotalElements > 0 &&
                              !isRefetching
                                ? Array.from({
                                    length: microTaskTotalElements,
                                  }).map((_, index) => {
                                    const isCompleted =
                                      index < currentRowIndex + 1;
                                    return (
                                      <div
                                        key={index}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                          isCompleted
                                            ? "bg-primary"
                                            : "bg-gray-200"
                                        }`}
                                        style={{
                                          width: `${100 / Number(microTaskTotalElements)}%`,
                                        }}
                                      />
                                    );
                                  })
                                : null}
                            </div>
                            <p className="text-xl text-primary px-4 font-medium">
                              Question
                            </p>
                            <div className="mb-4 px-4 py-4 bg-[#FCFCFD]">
                              {microtasks[currentRowIndex].microTask.type ===
                              "text" ? (
                                <>
                                  <p className="text-lg text-gray-500 font-medium break-words whitespace-normal leading-relaxed">
                                    {microtasks[currentRowIndex].microTask
                                      .text || "No text available"}
                                  </p>
                                </>
                              ) : (
                                <>
                                  {microtasks[currentRowIndex].microTask
                                    .type === "audio" && (
                                    <audio
                                      key={`question-audio-${microtasks[currentRowIndex]?.id}`}
                                      controls
                                      className="w-full custom-audio-player"
                                    >
                                      <source
                                        src={
                                          microtasks[currentRowIndex].microTask
                                            .file_path!
                                        }
                                        type="audio/mpeg"
                                      />
                                      Your browser does not support the audio
                                      element.
                                    </audio>
                                  )}
                                </>
                              )}
                            </div>
                            <p className="text-xl text-primary px-4 font-medium">
                              Answer
                            </p>
                            <div className="px-4 py-4 bg-[#FCFCFD]">
                              {microtasks[currentRowIndex].type === "audio" &&
                              microtasks[currentRowIndex].file_path ? (
                                <div className="space-y-2">
                                  <audio
                                    key={`answer-audio-${microtasks[currentRowIndex]?.id}`}
                                    controls
                                    className="w-full custom-audio-player"
                                  >
                                    <source
                                      src={
                                        microtasks[currentRowIndex].file_path!
                                      }
                                      type="audio/mpeg"
                                    />
                                    Your browser does not support the audio
                                    element.
                                  </audio>
                                </div>
                              ) : (
                                <>
                                  <div className="space-y-2">
                                    {microtasks[currentRowIndex].microTask
                                      .type === "text" && (
                                      <p className="text-lg text-gray-500 font-medium break-words whitespace-normal leading-relaxed"></p>
                                    )}
                                    <p className="text-lg text-gray-500 font-medium break-words whitespace-normal leading-relaxed">
                                      <span className="font-semibold">
                                        Answer:
                                      </span>{" "}
                                      {microtasks[currentRowIndex]
                                        .text_data_set || "No text available"}
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-center text-gray-500"></p>
                      )}
                    </div>
                  </div>
                  <div className="max-w-[1000px] mx-auto px-6 py-4">
                    <div className="flex justify-end space-x-2">
                      <div className="flex justify-between w-full">
                        <Button
                          onClick={handlePreviousMicroTask}
                          disabled={
                            (currentRowIndex === 0 && microTaskPage === 1) ||
                            currentRowIndex === null ||
                            isRefetching
                          }
                          className="bg-white text-gray-700 border border-gray-400 rounded-1xl hover:bg-gray-200 flex items-center gap-2"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={handleNextMicroTask}
                          disabled={
                            (currentRowIndex === microtasks.length - 1 &&
                              microTaskPage >= microTaskTotalPages) ||
                            currentRowIndex === null ||
                            isRefetching
                          }
                          className="bg-primary text-white hover:bg-blue-700 flex items-center gap-2"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Dialog
                open={isRejectDialogOpen}
                onOpenChange={setIsRejectDialogOpen}
              >
                <DialogContent className="min-h-[100vh] sm:min-h-[90vh] h-full overflow-hidden flex flex-col">
                  <DialogHeader className="shrink-0">
                    <DialogTitle>Reject MicroTask</DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 min-h-0 overflow-y-auto px-4">
                    <div className="py-4">
                      <div className="mb-6">
                        <label
                          htmlFor="rejectionReason"
                          className="text-sm font-semibold block mb-2"
                        >
                          Rejection Reasons
                        </label>
                        <div className="mt-2">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                            <input
                              type="text"
                              value={rejectionSearch}
                              placeholder="Search reasons..."
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              onChange={(e) =>
                                setRejectionSearch(e.target.value)
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none"
                                onClick={() =>
                                  setSelectedRejectionReasonIds(
                                    rejectionReasons.map(
                                      (r: { id: string }) => r.id
                                    )
                                  )
                                }
                              >
                                Select All
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-none"
                                onClick={() =>
                                  setSelectedRejectionReasonIds([])
                                }
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                          {selectedRejectionReasonIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              {selectedRejectionReasonIds
                                .map((id) =>
                                  rejectionReasons.find(
                                    (r: { id: string }) => r.id === id
                                  )
                                )
                                .filter(Boolean)
                                .map((reason: any) => (
                                  <span
                                    key={reason.id}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-primary text-sm rounded-full border border-blue-300"
                                  >
                                    {reason.name}
                                    <button
                                      type="button"
                                      className="ml-1 text-primary hover:text-blue-800 focus:outline-none"
                                      onClick={() =>
                                        setSelectedRejectionReasonIds((prev) =>
                                          prev.filter((id) => id !== reason.id)
                                        )
                                      }
                                      aria-label={`Remove ${reason.name}`}
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </button>
                                  </span>
                                ))}
                            </div>
                          )}
                          <div className="max-h-48 sm:max-h-56 overflow-y-auto border border-gray-300 rounded-lg bg-white">
                            {rejectionReasons.length > 0 ? (
                              rejectionReasons
                                .filter((reason: { name: string }) =>
                                  reason.name
                                    .toLowerCase()
                                    .includes(rejectionSearch.toLowerCase())
                                )
                                .map((reason: { id: string; name: string }) => {
                                  const isSelected =
                                    selectedRejectionReasonIds.includes(
                                      reason.id
                                    );
                                  return (
                                    <label
                                      key={reason.id}
                                      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                        isSelected
                                          ? "bg-blue-50 border-blue-200"
                                          : ""
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedRejectionReasonIds(
                                              (prev) => [...prev, reason.id]
                                            );
                                          } else {
                                            setSelectedRejectionReasonIds(
                                              (prev) =>
                                                prev.filter(
                                                  (id) => id !== reason.id
                                                )
                                            );
                                          }
                                        }}
                                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                                      />
                                      <span
                                        className={`flex-1 text-sm ${isSelected ? "text-primary font-medium" : "text-gray-700"}`}
                                      >
                                        {reason.name}
                                      </span>
                                      {isSelected && (
                                        <svg
                                          className="w-4 h-4 text-primary"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                    </label>
                                  );
                                })
                            ) : (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                No rejection reasons available
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            {selectedRejectionReasonIds.length > 0
                              ? `${selectedRejectionReasonIds.length} reason${selectedRejectionReasonIds.length > 1 ? "s" : ""} selected`
                              : "No reasons selected"}
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label
                          htmlFor="rejectionComment"
                          className="text-sm font-semibold block mb-2"
                        >
                          Comment (Optional)
                        </label>
                        <textarea
                          id="rejectionComment"
                          value={rejectionComment}
                          onChange={(e) => setRejectionComment(e.target.value)}
                          className="w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          rows={4}
                          placeholder="Enter any additional comments"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="text-sm font-semibold block mb-2">
                          {" "}
                        </label>
                        <div
                          role="radiogroup"
                          aria-label="Reject mode"
                          className="inline-flex bg-gray-100 p-1 rounded-md border border-gray-200"
                        >
                          <label
                            className={`cursor-pointer px-3 py-1 text-sm rounded-md flex items-center gap-2 transition-colors ${
                              isRejectFlag
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-600"
                            }`}
                          >
                            <input
                              type="radio"
                              name="rejectMode"
                              className="sr-only"
                              checked={isRejectFlag === true}
                              onChange={() => setIsRejectFlag(true)}
                              aria-checked={isRejectFlag === true}
                            />
                            <svg
                              className={`w-4 h-4 transition-opacity ${isRejectFlag ? "opacity-100 text-primary" : "opacity-30 text-gray-400"}`}
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M9 12l2 2 4-4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Flag</span>
                          </label>

                          <label
                            className={`cursor-pointer px-3 py-1 text-sm rounded-md flex items-center gap-2 transition-colors ${
                              !isRejectFlag
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-600"
                            }`}
                          >
                            <input
                              type="radio"
                              name="rejectMode"
                              className="sr-only"
                              checked={isRejectFlag === false}
                              onChange={() => setIsRejectFlag(false)}
                              aria-checked={isRejectFlag === false}
                            />
                            <svg
                              className={`w-4 h-4 transition-opacity ${!isRejectFlag ? "opacity-100 text-primary" : "opacity-30 text-gray-400"}`}
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M6 6l12 12M18 6L6 18"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span></span>
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Select "Flag" to mark the item as flagged
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 p-4 w-full border-t border-gray-200 bg-white mt-auto">
                    <div className="flex flex-col sm:flex-row justify-end gap-2">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto order-2 sm:order-1"
                        onClick={() => {
                          setIsRejectDialogOpen(false);
                          setSelectedRejectionReasonIds([]);
                          setRejectionComment("");
                          setRejectionSearch("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full sm:w-auto order-1 sm:order-2"
                        onClick={submitRejection}
                        disabled={
                          selectedRejectionReasonIds.length === 0 ||
                          RejectMicrotask.isPending
                        }
                      >
                        {RejectMicrotask.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Rejection"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isApproveDialogOpen}
                onOpenChange={setIsApproveDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Approve MicroTask</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <div className="mb-4">
                      <label
                        htmlFor="annotation"
                        className="text-sm font-semibold"
                      >
                        Annotation
                      </label>
                      <select
                        id="annotation"
                        value={selectedAnnotationId}
                        onChange={(e) => {
                          setSelectedAnnotationId(e.target.value);
                          const selectedAnnotation = annotations.find(
                            (annotation) => annotation.id === e.target.value
                          );
                          setSelectedAnnotationName(
                            selectedAnnotation?.name || ""
                          );
                        }}
                        className="w-full border rounded-md p-2 mt-1"
                      >
                        <option value="">Select an annotation</option>
                        {annotations.map(
                          (annotation: { id: string; name: string }) => (
                            <option key={annotation.id} value={annotation.id}>
                              {annotation.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div className="fixed bottom-0 right-0 p-4 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsApproveDialogOpen(false);
                          setSelectedAnnotationId("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-lime-500 text-white hover:bg-lime-600"
                        onClick={submitApproval}
                        disabled={
                          !selectedAnnotationId || appproveMicrotask.isPending
                        }
                      >
                        {appproveMicrotask.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Approval"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isFlagDialogOpen}
                onOpenChange={setIsFlagDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Flag MicroTask</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <div className="mb-4">
                      <label
                        htmlFor="flagType"
                        className="text-sm font-semibold"
                      >
                        Flag Type
                      </label>
                      <select
                        id="flagType"
                        value={selectedFlagTypeId}
                        onChange={(e) => setSelectedFlagTypeId(e.target.value)}
                        className="w-full border rounded-md p-2 mt-1"
                      >
                        <option value="">Select a flag type</option>
                        {flagTypes.map((flag: { id: string; name: string }) => (
                          <option key={flag.id} value={flag.id}>
                            {flag.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="flagComment"
                        className="text-sm font-semibold"
                      >
                        Comment (Optional)
                      </label>
                      <textarea
                        id="flagComment"
                        value={flagComment}
                        onChange={(e) => setFlagComment(e.target.value)}
                        className="w-full border rounded-md p-2 mt-1"
                        rows={4}
                        placeholder="Enter any additional comments"
                      />
                    </div>
                    <div className="fixed bottom-0 right-0 p-4 flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsFlagDialogOpen(false);
                          setSelectedFlagTypeId("");
                          setFlagComment("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-yellow-500 text-white hover:bg-yellow-600"
                        onClick={submitFlag}
                        disabled={
                          !selectedFlagTypeId || flagMicrotask.isPending
                        }
                      >
                        {flagMicrotask.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Flag"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </>
      ) : (
        <>
          {isMicroTaskLoading && !isRefetching ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : microtasks.length === 0 ? (
            <p className="text-center text-gray-500"></p>
          ) : (
            <div>
              <div className="bg-white overflow-hidden relative">
                <Table>
                  <TableHeader>
                    {microTaskTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="text-sm h-12 font-bold text-gray-500 bg-gray-100 px-2 py-5"
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
                    {microTaskTable.getRowModel().rows?.length ? (
                      microTaskTable.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="border-gray-100">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className="py-5 px-5 text-sm"
                            >
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
                          colSpan={microTaskColumns.length}
                          className="h-96 text-center"
                        >
                          <div className="relative flex flex-col items-center justify-center py-12">
                            <img
                              src="/empty.svg"
                              alt="No micro tasks found"
                              className="w-64 h-64 opacity-50"
                            />

                            {/* Loading overlay for empty state */}
                            {isMicroTaskLoading && (
                              <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center">
                                <Loader2 className="w-6 h-6 animate-spin" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between py-4">
                <PaginationControls
                  pagination={{
                    pageCount: microTaskTotalPages,
                    page: microTaskPage,
                    setPage: setMicroTaskPage,
                    pageSize: microTaskPageSize,
                    setPageSize: setMicroTaskPageSize,
                    showingText:
                      microTaskTotalElements > 0
                        ? `Showing ${microTaskStartRecord} to ${microTaskEndRecord} out of ${microTaskTotalElements} records`
                        : "",
                  }}
                />
              </div>
            </div>
          )}
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="max-w-full w-full h-[100vh] bg-white text-black overflow-y-scroll">
              <DialogHeader>
                <DialogTitle className="text-black">
                  Micro Task Details
                </DialogTitle>
              </DialogHeader>
              {selectedMicroTask && (
                <div className="space-y-6">
                  <div className="border mt-4 border-gray-100 px-4 py-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Code
                      </label>
                      <p className="text-sm text-black bg-white p-2 rounded">
                        {selectedMicroTask.code}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Status
                      </label>
                      <p className="text-sm text-black bg-white p-2 rounded">
                        {selectedMicroTask.status} {"  "} {selectedMicroTask.is_flagged ? ",Flagged" : ""}
                      </p>
                    </div>
                  </div>
                  {selectedMicroTask.microTask && (
                    <div className="space-y-4 border mt-4 border-gray-100 px-4 py-4 rounded-2xl">
                      <h3 className="text-lg font-medium text-black">
                        MicroTask Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            MicroTask Code
                          </label>
                          <p className="text-sm text-black bg-white p-2 rounded">
                            {selectedMicroTask.microTask.code}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-1">
                            Type
                          </label>
                          <p className="text-sm text-black bg-white p-2">
                            {selectedMicroTask.microTask.type}
                          </p>
                        </div>
                      </div>
                      {selectedMicroTask.microTask.text && (
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            MicroTask Text
                          </label>
                          <div className="bg-white p-2">
                            <p className="text-sm text-black whitespace-pre-wrap">
                              {selectedMicroTask.microTask.text}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedMicroTask.microTask.type === "audio" &&
                        selectedMicroTask.microTask.file_path && (
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Audio File
                            </label>
                            <audio
                              key={`modal-question-audio-${selectedMicroTask?.id}`}
                              controls
                              className="w-full"
                            >
                              <source
                                src={selectedMicroTask.microTask.file_path}
                                type="audio/mpeg"
                              />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                    </div>
                  )}
                  <div className="space-y-4 border border-gray-100 px-2 py-2 rounded-2xl">
                    <div className="space-y-4">
                      <h3 className="text-lg rounded-2xl font-medium text-black">
                        Response Data
                      </h3>
                      {selectedMicroTask.text_data_set && (
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Text Response
                          </label>
                          <div className="bg-white p-2">
                            <p className="text-sm text-black whitespace-pre-wrap">
                              {selectedMicroTask.text_data_set}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedMicroTask.type === "audio" &&
                        selectedMicroTask.file_path && (
                          <div>
                            <label className="block text-sm font-medium text-black mb-2">
                              Audio Response
                            </label>
                            <audio
                              key={`modal-answer-audio-${selectedMicroTask?.id}`}
                              controls
                              className="w-full"
                            >
                              <source
                                src={selectedMicroTask.file_path}
                                type="audio/mpeg"
                              />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Response Type
                        </label>
                        <p className="text-sm text-black bg-white p-2 rounded">
                          {selectedMicroTask.type}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleCloseDetailModal}
                      className="px-4 py-2 text-white rounded-md hover:bg-blue-700 transition-colors"
                      style={{ backgroundColor: "#095FAF" }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
};

export default MicroTaskList;
