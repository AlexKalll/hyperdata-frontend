"use client";
import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/app/components/ui/badge";
import { formatDateMedium } from "@/app/types/dateUtils";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useGetMicroTaskDataSetFacilitatorDetail } from "@/lib/hooks/useMicrotask";
import { ReviewerDatset } from "@/app/types/project";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2,
  Play,
  Pause,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialogLeft";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import WaveSurfer from "wavesurfer.js";
import { UserData } from "@/app/types/global";

interface TaskDatasetProps {
  task_id: string;
  contributor_id: string;
  user?: UserData;
  taskType?: string;
  onCancel: () => void;
}

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
          <ChevronRightIcon className="md:w-4 md:h-4 w-2 h-2" />
        </Button>
      </div>
    </div>
  );
};

const TaskDataset: React.FC<TaskDatasetProps> = ({
  task_id,
  contributor_id,
  user,
  taskType,
  onCancel,
}) => {
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<string>();
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    data: TaskDatasetsData,
    isLoading: isTaskDatasetLoading,
    error: TaskDatasetError,
  } = useGetMicroTaskDataSetFacilitatorDetail({
    page,
    pageSize,
    searchQuery,
    verificationStatus,
    task_id: task_id,
    contributor_id: contributor_id,
  });

  const TaskDatasets: ReviewerDatset[] = Array.isArray(
    TaskDatasetsData?.data?.result
  )
    ? (TaskDatasetsData?.data.result as ReviewerDatset[])
    : [];
  const TaskDatasetTotalElements = TaskDatasetsData?.data?.total || 0;
  const TaskDatasetTotalPages = TaskDatasetsData?.data?.totalPages || 1;
  const TaskDatasetStartRecord = TaskDatasets.length
    ? (page - 1) * pageSize + 1
    : 0;
  const TaskDatasetEndRecord = Math.min(
    page * pageSize,
    TaskDatasetTotalElements
  );
 
  const TaskDatasetColumns: ColumnDef<ReviewerDatset>[] = [
    {
      accessorKey: "code",
      header: "ID",
      enableSorting: true,
      size: 100,
      cell: ({ row }) => (
        <div className="w-[100px] truncate">{row.original.code}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      enableSorting: true,
      size: 80,
      cell: ({ row }) => (
        <div className="w-[80px] truncate">{row.original.type}</div>
      ),
    },
    {
      accessorKey: "is_test",
      header: "Test",
      enableSorting: true,
      size: 60,
      cell: ({ row }) => (
        <div className="w-[60px] text-center">
          {row.original.is_test ? "true" : "false"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      size: 120,
      cell: ({ row }) => (
        <div className="w-[190px] flex flex-row">
          <span
            className={`px-2 py-1 rounded-2xl font-semibold text-xs ${
              row.original.status === "Pending"
                ? "bg-orange-100 text-orange-400"
                : row.original.status === "Rejected"
                  ? "text-white bg-[#D03710]"
                  :  row.original.status === "Flagged"
                  ? "bg-[#FFF6F3] text-[#B32F0D]"
                  : row.original.status === "Accepted" ||
                      row.original.status === "Approved"
                    ? "bg-green-100 text-green-600"
                    : ""
            }`}
          >
            <>{row.original.status}</>
          </span>
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
    {
      accessorKey: "micro_task",
      header: "Micro Task",
      enableSorting: false,
      size: 250,
      cell: function FacilitatorMicroTaskCell({ row }) {
        const waveformRef = useRef<HTMLDivElement>(null);
        const wavesurferRef = useRef<WaveSurfer | null>(null);
        const [isPlaying, setIsPlaying] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [isReady, setIsReady] = useState(false);
        const fullAudioUrl = row.original.microTask?.file_path;

        useEffect(() => {
          if (!fullAudioUrl || row.original.microTask?.type !== "audio") return;

          let isMounted = true;

          const initializeWaveSurfer = async () => {
            try {
              const ws = WaveSurfer.create({
                container: waveformRef.current!,
                waveColor: "#73a4d1",
                progressColor: "#095FAF",
                cursorColor: "#383351",
                barWidth: 1,
                barRadius: 2,
                cursorWidth: 0.01,
                height: 30,
                barGap: 2,
                url: fullAudioUrl,
                // plugins: [TimelinePlugin.create(), RegionsPlugin.create()],
                renderFunction: (peaks, ctx) => {
                  const height = ctx.canvas.height;
                  const width = ctx.canvas.width;
                  const halfHeight = height / 2;
                  const channel = peaks[0]; // Use first channel for mono or left channel
                  const pixelsPerSample = width / channel.length;

                  ctx.beginPath();
                  ctx.moveTo(0, halfHeight);

                  for (let i = 0; i < channel.length; i++) {
                    const x = i * pixelsPerSample;
                    const y = halfHeight - channel[i] * halfHeight; // Scale peak to canvas height
                    ctx.lineTo(x, y);
                  }

                  ctx.strokeStyle = "#73a4d1";
                  ctx.lineWidth = 1;
                  ctx.stroke();
                },
              });

              ws.on("ready", () => {
                if (isMounted) {
                  setIsReady(true);
                }
              });

              ws.on("play", () => isMounted && setIsPlaying(true));
              ws.on("pause", () => isMounted && setIsPlaying(false));
              ws.on("finish", () => isMounted && setIsPlaying(false));
              ws.on("error", (err) => {
                console.error("WaveSurfer error:", err);
                isMounted && setError("Failed to load audio");
              });

              wavesurferRef.current = ws;
            } catch (err) {
              console.error("WaveSurfer initialization error:", err);
              isMounted && setError("Failed to initialize player");
            }
          };

          initializeWaveSurfer();

          return () => {
            isMounted = false;
            wavesurferRef.current?.destroy();
            wavesurferRef.current = null;
          };
        }, [fullAudioUrl]);

        const handlePlayPause = () => {
          if (!wavesurferRef.current) return;
          wavesurferRef.current.playPause();
        };

        if (row.original.microTask?.type === "audio" && fullAudioUrl) {
          return (
            <div className="w-[250px] max-w-[250px] overflow-hidden">
              <div className="flex items-center gap-1">
                <div className="flex-1 min-w-0 max-w-[200px]">
                  <div
                    ref={waveformRef}
                    className="w-full h-[30px] max-w-[200px]"
                  />
                  {error && (
                    <div className="text-red-500 text-xs mt-1 truncate">
                      {error}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  disabled={!isReady}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="w-[250px] max-w-[250px] truncate overflow-hidden">
              {row.original.microTask?.text || "No text"}
            </div>
          );
        }
      },
    },
    {
      accessorKey: "actions",
      header: "Data",
      size: 250,
      cell: function FacilitatorDataCell({ row }) {
        const waveformRef = useRef<HTMLDivElement>(null);
        const wavesurferRef = useRef<WaveSurfer | null>(null);
        const [isPlaying, setIsPlaying] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const [isReady, setIsReady] = useState(false);
        const fullAudioUrl = row.original.file_path;

        useEffect(() => {
          if (!fullAudioUrl || row.original.type !== "audio") return;

          let isMounted = true;

          const initializeWaveSurfer = async () => {
            try {
              const ws = WaveSurfer.create({
                container: waveformRef.current!,
                waveColor: "#73a4d1",
                progressColor: "#095FAF",
                cursorColor: "#383351",
                barWidth: 1,
                barRadius: 2,
                cursorWidth: 0.01,
                height: 30,
                barGap: 2,
                url: fullAudioUrl,
                // plugins: [TimelinePlugin.create(), RegionsPlugin.create()],
                renderFunction: (peaks, ctx) => {
                  const height = ctx.canvas.height;
                  const width = ctx.canvas.width;
                  const halfHeight = height / 2;
                  const channel = peaks[0]; // Use first channel for mono or left channel
                  const pixelsPerSample = width / channel.length;

                  ctx.beginPath();
                  ctx.moveTo(0, halfHeight);

                  for (let i = 0; i < channel.length; i++) {
                    const x = i * pixelsPerSample;
                    const y = halfHeight - channel[i] * halfHeight; // Scale peak to canvas height
                    ctx.lineTo(x, y);
                  }

                  ctx.strokeStyle = "#73a4d1";
                  ctx.lineWidth = 1;
                  ctx.stroke();
                },
              });

              ws.on("ready", () => {
                if (isMounted) {
                  setIsReady(true);
                }
              });

              ws.on("play", () => isMounted && setIsPlaying(true));
              ws.on("pause", () => isMounted && setIsPlaying(false));
              ws.on("finish", () => isMounted && setIsPlaying(false));
              ws.on("error", (err) => {
                console.error("WaveSurfer error:", err);
                isMounted && setError("Failed to load audio");
              });

              wavesurferRef.current = ws;
            } catch (err) {
              console.error("WaveSurfer initialization error:", err);
              isMounted && setError("Failed to initialize player");
            }
          };

          initializeWaveSurfer();

          return () => {
            isMounted = false;
            wavesurferRef.current?.destroy();
            wavesurferRef.current = null;
          };
        }, [fullAudioUrl]);

        const handlePlayPause = () => {
          if (!wavesurferRef.current) return;
          wavesurferRef.current.playPause();
        };

        if (row.original.type !== "audio" || !fullAudioUrl) {
          return (
            <div className="w-[250px] max-w-[250px] text-left text-gray-600 truncate overflow-hidden">
              {row.original.text_data_set}
            </div>
          );
        }

        return (
          <div className="w-[250px] max-w-[250px] overflow-hidden">
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0 max-w-[200px]">
                <div
                  ref={waveformRef}
                  className="w-full h-[30px] max-w-[200px]"
                />
                {error && (
                  <div className="text-red-500 text-xs mt-1 truncate">
                    {error}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                disabled={!isReady}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "",
      header: "Submission",
      enableSorting: true,
      size: 100,
      cell: function FacilitatorSubmissionCell({ row }) {
          const rejectionReasons = row.original.rejectionReasons || [];
        const flagReasons = row.original.flagReason || [];
        return (
          <div className="w-[100px]">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  aria-label="More options"
                  className="px-3 py-1 text-sm rounded-2xl bg-primary text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  View
                </button>
              </DialogTrigger>
              <DialogContent className="w-full">
                <DialogTitle></DialogTitle>
                <div>
                  <span className="font-semibold text-gray-800">
                    Submission Information
                  </span>
                </div>
                <div className="flex justify-end">
                  <span
                    className={`min-w-[50px] px-2 py-2 rounded-2xl font-semibold ${
                      row.original.status === "Pending"
                        ? "bg-orange-100 text-orange-400"
                        : row.original.status === "Rejected"
                          ? "text-white bg-[#D03710]"
                          : row.original.status === "Accepted" ||
                              row.original.status === "Approved"
                            ? "bg-green-100 text-green-600"
                            : ""
                    }`}
                  >
                    {row.original.status}

                  </span>
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
                <div className="h-30m w-full mb-10 mt-10 rounded-2xl border px-5 py-5 justify-center border-gray-300">
                  <span className="font-semibold text-gray-800">
                    Micro task Information
                  </span>
                  <div className="flex flex-row py-3">
                    <span className="text-purple-600 bg-purple-100 rounded-full px-2.5 py-0.5  inline-block w-fit">
                      {taskType || "N/A"}
                    </span>
                    <span className="font-semibold text-gray-500 px-2.5 py-0.5 mr-4">
                      {row.original.microTask.created_date
                        ? formatDateMedium(row.original.microTask.created_date)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-row">
                    <span className="font-semibold text-gray-400  mr-4">
                      Submitted by .
                    </span>
                    <span className="font-semibold text-gray-600 ">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <div className="border border-gray-300 rounded-2xl p-5">
                  <span className="font-semibold text-gray-600 ">
                    Review Status
                  </span>

                  <div
                    className={` h-auto w-full mb-10 mt-10  justify-center ${row.original.status === "Rejected" ? "" : row.original.status === "Flagged" ? "border-yellow-300" : "border-green-300"} `}
                  >
                    {row.original.status === "Approved" && (
                      <div className="flex row rounded-2xl border px-5 py-5 border-primary  text-sm ">
                        <span className="font-semibold text-primary ">
                          {row.original.annotation
                            ? row.original.annotation
                            : ""}
                        </span>
                      </div>
                    )}
                   {row.original.status === "Rejected" &&
                      rejectionReasons.length > 0 && (
                        <div className="space-y-5">
                          <div>
                            <p className="font-semibold text-[#D03710] mb-2">
                              Rejection Reasons:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              {rejectionReasons.map(
                                (item: any, idx: number) => (
                                  <li key={idx} className="text-[#D03710]">
                                    {item.reason || "Unnamed reason"}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>

                          {rejectionReasons.some(
                            (item: any) => item.comment
                          ) && (
                            <div>
                              <p className="font-semibold text-[#D03710] mb-2">
                                Rejection Comments:
                              </p>
                              <ul className="list-disc list-inside space-y-1 ml-2">
                                {rejectionReasons
                                  .filter((item: any) => item.comment)
                                  .map((item: any, idx: number) => (
                                    <li key={idx} className="text-[#D03710]">
                                      {item.comment}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    {/* {row.original.status === "Flagged" && (
                      <div className=" rounded-2xl border px-5 py-5 border-red-500  text-sm ">
                        <div className="flex flex-row">
                          <span className="font-semibold text-red-500 ">
                            Flag reason:{" "}
                            {row.original.flagReason?.length > 0
                              ? row.original.flagReason
                                  .map((flag) => flag.flagType?.name)
                                  .join(", ")
                              : ""}
                          </span>
                        </div>
                        <div className="flex flex-row">
                          <span className="font-semibold text-red-500 ">
                            Flag coment:{" "}
                            {row.original.flagReason?.length > 0
                              ? row.original.flagReason
                                  .map((flag) => flag.comment)
                                  .join(", ")
                              : ""}
                          </span>
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];

  const TaskDatasetTable = useReactTable({
    data: TaskDatasets,
    columns: TaskDatasetColumns,
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize: pageSize,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: TaskDatasetTotalElements,
  });

  if (TaskDatasetError) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Error loading TaskDatasets: {(TaskDatasetError as Error).message}
        </p>
      </div>
    );
  }

  return (
    <>
      {isTaskDatasetLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="w-full">
          <Button variant={"ghost"} className="mb-4" >
            <span onClick={onCancel}>← Users</span>
          </Button>
          <div className="">
            <div className="mb-7">
              <h2 className="text-xl font-semibold flex flex-row h-13">
                {user?.first_name} {user?.last_name}
                <Badge
                  className="ml-5 p-2 h-5"
                  variant={user?.is_active ? "active" : "deactivated"}
                >
                  <span
                    className={`w-2 mr-2 h-2 rounded-full ${
                      user?.is_active ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {user?.is_active ? "Active" : "Deactivated"}
                </Badge>
              </h2>
              <div className="flex items-center gap-2 flex-row ">
                <span
                  className={`col-span-3 text-blue-500 bg-blue-200 rounded-2xl px-2 py-1`}
                >
                  Contributor
                </span>
                <span className="text-gray-600">{user?.phone_number}</span>
                <span className="text-gray-600">{user?.email}</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full table-fixed min-w-[960px]">
                <TableHeader>
                  {TaskDatasetTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header, index) => {
                        // Define specific widths for each column
                        const columnWidths = [
                          "w-[100px]", // ID
                          "w-[80px]", // Type
                          "w-[60px]", // Test
                          "w-[120px]", // Status
                          "w-[250px]", // Micro Task
                          "w-[250px]", // Data
                          "w-[100px]", // Submission
                        ];

                        return (
                          <TableHead
                            key={header.id}
                            className={`text-sm font-bold text-gray-700 px-5 py-5 bg-gray-100 text-left ${columnWidths[index] || "w-auto"}`}
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
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {TaskDatasetTable.getRowModel().rows?.length ? (
                    TaskDatasetTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="border-gray-100">
                        {row.getVisibleCells().map((cell, index) => {
                          // Apply same widths to table cells
                          const columnWidths = [
                            "w-[100px]", // ID
                            "w-[80px]", // Type
                            "w-[60px]", // Test
                            "w-[120px]", // Status
                            "w-[250px]", // Micro Task
                            "w-[250px]", // Data
                            "w-[100px]", // Submission
                          ];

                          return (
                            <TableCell
                              key={cell.id}
                              className={`px-5 py-5 bg-white text-left ${columnWidths[index] || "w-auto"}`}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={TaskDatasetColumns.length}
                        className="h-24 text-center"
                      >
                        {isTaskDatasetLoading ? (
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
          </div>
          <div className="flex items-center justify-between py-4">
            <PaginationControls
              pagination={{
                pageCount: TaskDatasetTotalPages,
                page: page,
                setPage: setPage,
                pageSize: pageSize,
                setPageSize: setPageSize,
                showingText:
                  TaskDatasetTotalElements > 0
                    ? `Showing ${TaskDatasetStartRecord} to ${TaskDatasetEndRecord} out of ${TaskDatasetTotalElements} records`
                    : "",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TaskDataset;
