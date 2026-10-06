"use client";
import React, { useState, useEffect, useRef } from "react";
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
import {
  useGetTaskTaskDatasetDetail,
  useGetTaskTaskDatasetDetailFilter,
} from "@/lib/hooks/useMicrotask";
import { ReviewerDatset } from "@/app/types/project";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Search,
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2,
  Copy,
  Eye,
  Plus,
  Users,
  Link2,
  ChevronDown,
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
import { formatDateMedium } from "@/app/types/dateUtils";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import MinimapPlugin from "wavesurfer.js/dist/plugins/minimap";
import { FilterComponent } from "@/components/ui/filterComponent";

interface TaskDatasetProps {
  taskId: string;
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

const TaskDataset: React.FC<TaskDatasetProps> = ({ taskId }) => {
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<string>();
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<{ [key: string]: string | boolean }>(
    {}
  );
  const filterableColumns = [{ accessorKey: "status", header: "Status" }];
  const handleFilterChange = (
    newFilters: { [key: string]: string | boolean },
    endpoint: string
  ) => {
    setFilters(newFilters);
    setPage(1);
  };
  const {
    data: TaskDatasetsData,
    isLoading: isTaskDatasetLoading,
    error: TaskDatasetError,
  } = useGetTaskTaskDatasetDetailFilter({
    page,
    pageSize,
    searchQuery,
    verificationStatus,
    task_id: taskId,
    filters: filters,
  });

  const TaskDatasets: ReviewerDatset[] = Array.isArray(
    TaskDatasetsData?.data?.result
  )
    ? TaskDatasetsData.data.result
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
      cell: ({ row }) => (
        <div className="min-w-[80px] max-w-[120px] truncate">
          {row.original.code}
        </div>
      ),
    },

    {
      accessorKey: "is_test",
      header: "Test",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="min-w-[50px]">
          {row.original.is_test ? "true" : "false"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-row">
          <span
            className={`w-fit p-1 px-2 py-2  rounded-2xl  font-semibold ${
              row.original.status === "Pending"
                ? "bg-orange-100 text-orange-400"
                : row.original.status === "Rejected"
                  ? "text-white bg-[#D03710]":
                  row.original.status === "Flagged"
                  ? "bg-[#FFF6F3] text-[#B32F0D]"
                  : row.original.status === "Approved"
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
      ),
    },
    {
      accessorKey: "micro_task",
      header: "Micro Task",
      enableSorting: false,
      cell: function TaskDatasetMicroTaskCell({ row }) {
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

                renderFunction: (peaks, ctx) => {
                  const height = ctx.canvas.height;
                  const width = ctx.canvas.width;
                  const halfHeight = height / 2;
                  const channel = peaks[0];
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
            <div className="flex items-center gap-2 w-full max-w-[280px] mt-3 mb-3">
              <div className="flex-1 min-w-0">
                <div ref={waveformRef} className="w-full h-[40px]" />
                {error && (
                  <div className="text-red-500 text-xs mt-1">{error}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                disabled={!isReady}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        } else {
          return (
            <div className="w-full max-w-[280px] truncate">
              {row.original.microTask?.text || "No text"}
            </div>
          );
        }
      },
    },
    {
      accessorKey: "actions",
      header: "Data",
      enableSorting: false,
      cell: function TaskDatasetDataCell({ row }) {
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
            <div className="w-full max-w-[280px] truncate text-gray-600">
              {row.original.text_data_set}
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2 w-full max-w-[280px] mt-3 mb-3">
            {row.original.type === "audio" ? (
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 min-w-0">
                  <div ref={waveformRef} className="w-full h-[40px]" />
                  {error && (
                    <div className="text-red-500 text-xs mt-1">{error}</div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  disabled={!isReady}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="w-full max-w-[280px] truncate text-gray-800">
                {row.original.text_data_set}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "",
      header: "Action",
      enableSorting: false,
      cell: function TaskDatasetActionCell({ row }) {
        const rejectionReasons = row.original.rejectionReasons || [];
        const flagReasons = row.original.flagReason || [];

        return (
          <div className="flex justify-start items-center">
            <Dialog>
              <DialogTrigger asChild>
                <button className="px-3 py-1 text-sm rounded-2xl bg-primary text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  View
                </button>
              </DialogTrigger>

              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    Submission Details
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                  {/* Status Badge */}
                  <div className="flex justify-end">
                    <span
                      className={`px-3 py-2 rounded-2xl font-semibold ${
                        row.original.status === "Pending"
                          ? "bg-orange-100 text-orange-400"
                          : row.original.status === "Rejected"
                            ? "text-white bg-[#D03710]"
                            : row.original.status === "Approved"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.original.status || "Unknown"}
                    </span>
                  </div>

                  {/* Micro Task Info */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-300 p-5">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Micro Task Information
                    </h3>
                    <p className="text-sm text-gray-600">
                      Created:{" "}
                      {row.original.microTask.created_date
                        ? formatDateMedium(row.original.microTask.created_date)
                        : "N/A"}
                    </p>
                  </div>

                  {/* Review Status - Clean list layout */}
                  <div className="border border-gray-300 rounded-2xl p-6 bg-white">
                    <h3 className="font-semibold text-gray-800 text-lg mb-5">
                      Review Status
                    </h3>

                    {/* Approved */}
                    {row.original.status === "Approved" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-primary font-medium">
                          {row.original.annotation || "No annotation provided"}
                        </p>
                      </div>
                    )}

                    {/* Rejected */}
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

                    {/* Flagged */}
                    {row.original.status === "Flagged" &&
                      flagReasons.length > 0 && (
                        <div className="space-y-5">
                          <div>
                            <p className="font-semibold text-yellow-600 mb-2">
                              Flag Reasons:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              {flagReasons.map((item: any, idx: number) => (
                                <li key={idx} className="text-yellow-600">
                                  {item.flagType?.name || "Unnamed flag"}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {flagReasons.some((item: any) => item.comment) && (
                            <div>
                              <p className="font-semibold text-yellow-600 mb-2">
                                Flag Comments:
                              </p>
                              <ul className="list-disc list-inside space-y-1 ml-2">
                                {flagReasons
                                  .filter((item: any) => item.comment)
                                  .map((item: any, idx: number) => (
                                    <li key={idx} className="text-yellow-600">
                                      {item.comment}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Empty states */}
                    {row.original.status === "Rejected" &&
                      rejectionReasons.length === 0 && (
                        <p className="text-gray-500 italic">
                          No rejection details provided
                        </p>
                      )}

                    {row.original.status === "Flagged" &&
                      flagReasons.length === 0 && (
                        <p className="text-gray-500 italic">
                          No flag details provided
                        </p>
                      )}

                    {["Pending", "Submitted"].includes(
                      row.original.status || ""
                    ) && (
                      <p className="text-gray-500 italic">Awaiting review...</p>
                    )}
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
          <div className="flex justify-end items-center gap-4 mb-4">
            <FilterComponent
              columns={filterableColumns}
              onFilterChangeAction={handleFilterChange}
              initialFilters={filters}
              endpoint={`microtask/task-dataset/${taskId}/detail/`}
            />
          </div>
          <div className="rounded-md border border-gray-100 bg-white overflow-x-auto">
            <Table className="w-full overflow-x-auto px-2">
              <TableHeader>
                {TaskDatasetTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      // Only fix width for the Data column (actions)
                      let columnWidth = "";
                      const columnId = header.column.id;

                      if (columnId === "actions") columnWidth = "w-[300px]"; // Only Data column fixed

                      return (
                        <TableHead
                          key={header.id}
                          className={`text-sm font-bold text-gray-500 bg-gray-50 px-4 py-5 ${columnWidth} ${
                            header.column.id === "" ? "text-left" : ""
                          }`}
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
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {TaskDatasetTable.getRowModel().rows?.length ? (
                  TaskDatasetTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="border-gray-100">
                      {row.getVisibleCells().map((cell) => {
                        // Only fix width for the Data column (actions)
                        let columnWidth = "";
                        const columnId = cell.column.id;

                        if (columnId === "actions") columnWidth = "w-[300px]"; // Only Data column fixed

                        return (
                          <TableCell
                            key={cell.id}
                            className={`py-5 px-4 text-sm ${columnWidth} ${
                              cell.column.id === "" ? "text-left align-middle" : ""
                            }`}
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
