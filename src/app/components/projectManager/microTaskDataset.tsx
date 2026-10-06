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
import { useGetMicroTaskDataSetDetail } from "@/lib/hooks/useMicrotask";
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
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import WaveSurfer from "wavesurfer.js";

interface TaskDatasetProps {
  microTaskId: string;
}

interface PaginationProps {
  pageCount: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  showingText: string;
}

/* ────────────────────── Pagination ────────────────────── */
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

/* ────────────────────── Main Component ────────────────────── */
const TaskDataset: React.FC<TaskDatasetProps> = ({ microTaskId }) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<string>();
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    data: TaskDatasetsData,
    isLoading: isTaskDatasetLoading,
    error: TaskDatasetError,
  } = useGetMicroTaskDataSetDetail({
    page,
    pageSize,
    searchQuery,
    verificationStatus,
    micro_task_id: microTaskId,
  });

  const TaskDatasets: ReviewerDatset[] = Array.isArray(
    TaskDatasetsData?.data?.result
  )
    ? TaskDatasetsData.data.result
    : [];

  const total = TaskDatasetsData?.data?.total || 0;
  const totalPages = TaskDatasetsData?.data?.totalPages || 1;
  const startRecord = TaskDatasets.length ? (page - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(page * pageSize, total);

  /* ────────────────────── Columns ────────────────────── */
  const columns: ColumnDef<ReviewerDatset>[] = [
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
      cell: function ProjectManagerDatasetStatusCell({ row }) {
        const status = row.original.status?.toLowerCase();
        const bg =
          status === "approved"
            ? "bg-[#F4FDF8]"
            : status === "rejected"
              ? "bg-red-200"
              : status === "pending"
                ? "bg-[#FFF9F3]"
                : status === "flagged"
                  ? "bg-purple-400"
                  : "bg-purple-400";

        const dot =
          status === "approved"
            ? "bg-green-500"
            : status === "rejected"
              ? "bg-red-500"
              : status === "pending"
                ? "bg-orange-500"
                : status === "flagged"
                  ? "bg-blue-500"
                  : "bg-purple-500";

        return (
          <>
            <div
              className={`flex items-center max-w-[85px] rounded-2xl px-1 py-1 ${bg}`}
            >
              <span className={`h-2 w-2 rounded-full ${dot}`}></span>
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
          </>
        );
      },
    },

    /* ───── Micro Task (audio / text) ───── */
    {
      accessorKey: "micro_task",
      header: "Micro Task",
      enableSorting: false,
      cell: function ProjectManagerDatasetMicroTaskCell({ row }) {
        const mt = row.original.microTask;
        const isAudio = mt?.type === "audio";
        const url = mt?.file_path;

        // ── WaveSurfer logic (only for audio) ──
        const waveformRef = useRef<HTMLDivElement>(null);
        const wsRef = useRef<WaveSurfer | null>(null);
        const [playing, setPlaying] = useState(false);
        const [ready, setReady] = useState(false);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
          if (!isAudio || !url) return;

          let mounted = true;
          const init = async () => {
            try {
              const ws = WaveSurfer.create({
                container: waveformRef.current!,
                waveColor: "#73a4d1",
                progressColor: "#095FAF",
                height: 30,
                barWidth: 1,
                barGap: 2,
                url,
              });

              ws.on("ready", () => mounted && setReady(true));
              ws.on("play", () => mounted && setPlaying(true));
              ws.on("pause", () => mounted && setPlaying(false));
              ws.on("finish", () => mounted && setPlaying(false));
              ws.on("error", (e) => {
                console.error(e);
                mounted && setError("Failed to load audio");
              });

              wsRef.current = ws;
            } catch (e) {
              console.error(e);
              mounted && setError("Init error");
            }
          };
          init();

          return () => {
            mounted = false;
            wsRef.current?.destroy();
          };
        }, [isAudio, url]);

        const toggle = () => wsRef.current?.playPause();

        if (isAudio && url) {
          return (
            <div className="flex items-center gap-2 min-w-[220px]">
              <div className="flex-1">
                <div ref={waveformRef} className="h-[40px] w-full" />
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggle}
                disabled={!ready}
                className="h-8 w-8 p-0"
              >
                {playing ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        }

        return (
          <div className="min-w-[150px] max-w-[300px] truncate">
            {mt?.text || "No text"}
          </div>
        );
      },
    },

    /* ───── Data column (fixed width + no extra padding) ───── */
    {
      accessorKey: "actions",
      header: "Data",

      enableSorting: false,
      cell: function ProjectManagerDatasetDataCell({ row }) {
        const url = row.original.file_path;
        const isAudio = row.original.type === "audio";

        // ── WaveSurfer (audio) ──
        const waveformRef = useRef<HTMLDivElement>(null);
        const wsRef = useRef<WaveSurfer | null>(null);
        const [playing, setPlaying] = useState(false);
        const [ready, setReady] = useState(false);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
          if (!isAudio || !url) return;

          let mounted = true;
          const init = async () => {
            try {
              const ws = WaveSurfer.create({
                container: waveformRef.current!,
                waveColor: "#73a4d1",
                progressColor: "#095FAF",
                height: 30,
                barWidth: 1,
                barGap: 2,
                url,
              });

              ws.on("ready", () => mounted && setReady(true));
              ws.on("play", () => mounted && setPlaying(true));
              ws.on("pause", () => mounted && setPlaying(false));
              ws.on("finish", () => mounted && setPlaying(false));
              ws.on("error", (e) => {
                console.error(e);
                mounted && setError("Failed to load audio");
              });

              wsRef.current = ws;
            } catch (e) {
              console.error(e);
              mounted && setError("Init error");
            }
          };
          init();

          return () => {
            mounted = false;
            wsRef.current?.destroy();
          };
        }, [isAudio, url]);

        const toggle = () => wsRef.current?.playPause();

        // ── Render ──
        if (isAudio && url) {
          return (
            <div className="flex items-center gap-2 w-full max-w-[280px] mt-3 mb-3">
              <div className="flex items-center gap-2 w-full">
                <div ref={waveformRef} className="h-[40px] w-full" />
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggle}
                disabled={!ready}
                className="h-8 w-8 p-0"
              >
                {playing ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        }

        // Text fallback
        return (
          <div className="w-full max-w-[280px] truncate text-gray-600">
            {row.original.text_data_set ?? "-"}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: TaskDatasets,
    columns,
    state: { sorting, pagination: { pageIndex: page - 1, pageSize } },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    rowCount: total,
  });

  if (TaskDatasetError) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Error loading data: {(TaskDatasetError as Error).message}
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
          <div className="rounded-md border border-gray-100 bg-white overflow-x-auto">
            <Table className="w-full table-auto">
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-sm font-bold text-gray-500 bg-gray-50 px-2 py-2"
                        style={{
                          width: header.getSize(),
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={
                              header.column.getCanSort()
                                ? "flex items-center space-x-1 cursor-pointer select-none"
                                : ""
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="border-gray-100">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-5 px-2 text-sm"
                          // style={{
                          //   width: cell.column.getSize(),
                          // }}
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
                      colSpan={columns.length}
                      className="h-96 text-center"
                    >
                      <div className="relative flex flex-col items-center justify-center py-12">
                        <img
                          src="/empty.svg"
                          alt="No data found"
                          className="w-64 h-64 opacity-50"
                        />
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
                pageCount: totalPages,
                page,
                setPage,
                pageSize,
                setPageSize,
                showingText:
                  total > 0
                    ? `Showing ${startRecord} to ${endRecord} of ${total} records`
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
