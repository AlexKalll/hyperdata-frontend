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
import { useGetTaskMicroTaskDetail } from "@/lib/hooks/useMicrotask";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialogBig";
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
import { MicroTask } from "@/app/types/project";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import type { SortingState } from "@tanstack/react-table";

interface MicroTaskListProps {
  taskType: string;
  taskId: string;
  microTaskPage: number;
  setMicroTaskPage: (page: number) => void;
  microTaskPageSize: number;
  setMicroTaskPageSize: (pageSize: number) => void;
  searchQuery: string;
  verificationStatus?: string;
  setVerificationStatus: (status: string | undefined) => void;
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
              pagination.page === pageNumber
                ? "bg-primary text-black font-bold border-primary"
                : ""
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

const MicroTaskList: React.FC<MicroTaskListProps> = ({
  taskId,
  taskType,
  microTaskPage,
  setMicroTaskPage,
  microTaskPageSize,
  setMicroTaskPageSize,
  searchQuery,
  verificationStatus,
  setVerificationStatus,
}) => {

  const [sorting, setSorting] = useState<SortingState>([]);
  const {
    data: microtasksData,
    isLoading: isMicroTaskLoading,
    error: microTaskError,
  } = useGetTaskMicroTaskDetail({
    microTaskPage,
    microTaskPageSize,
    searchQuery,
    taskId,
    verificationStatus,
  });

  const microtasks: MicroTask[] = Array.isArray(microtasksData?.data?.result)
    ? microtasksData.data.result
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

  // State for detail modal
  const [selectedMicroTask, setSelectedMicroTask] = useState<MicroTask | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Modal handlers
  const handleViewDetails = (microTask: MicroTask) => {
    setSelectedMicroTask(microTask);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedMicroTask(null);
  };

  // Define all possible columns
  const allColumns: ColumnDef<MicroTask>[] = [
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
      accessorKey: "text",
      header: "Text",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="min-w-[150px] max-w-[300px] truncate">
          {row.original.text || " "}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="min-w-[80px]">{row.original.type}</div>
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
      accessorKey: "audio",
      header: () => <div className="text-center">Audio</div>,
      enableSorting: false,
      cell: function ProjectAudioCell({ row }) {
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

        if (row.original.type === "audio" && fullAudioUrl) {
          return (
            <div className="flex items-center gap-2 min-w-[200px] mt-3 mb-3">
              <div className="flex-1">
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
                className="h-8 w-8 p-0"
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
            <div className="min-w-[100px] text-center text-gray-400">
              No audio
            </div>
          );
        }
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <button
          onClick={() => handleViewDetails(row.original)}
          className="text-primary hover:text-grey-800 transition-colors p-1 rounded-full hover:bg-blue-50"
          title="View Details"
        >
          <Eye color="gray" className="h-4 w-4" />
        </button>
      ),
    },
  ];

  // Filter columns based on taskType
  const microTaskColumns = allColumns.filter((column) => {
    const key =
      "accessorKey" in column && typeof column.accessorKey === "string"
        ? column.accessorKey
        : column.id;
    if (taskType === "audio-text" && key === "text") {
      return false;
    }
    if (
      (taskType === "text-audio" || taskType === "text-text") &&
      key === "audio"
    ) {
      return false;
    }
    return true;
  });

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
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
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
      {microtasks.length === 0 ? (
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
      ) : isMicroTaskLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div>
          <div className="rounded-md border border-gray-100 bg-white overflow-hidden relative">
            <Table>
              <TableHeader>
                {microTaskTable.getHeaderGroups().map((headerGroup) => (
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
                {microTaskTable.getRowModel().rows?.length ? (
                  microTaskTable.getRowModel().rows.map((row) => (
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

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="  sm:max-w-[600px] h-[100vh] overflow-y-scroll bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black">Micro Task Details</DialogTitle>
          </DialogHeader>
          {selectedMicroTask && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="border mt-4  border-gray-100 px-4 py-4   rounded-2xl  grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    ID
                  </label>
                  <p className="text-sm text-black bg-white p-2 rounded">
                    {selectedMicroTask.code}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Type
                  </label>
                  <p className="text-sm text-black bg-whitep-2 p-2 rounded">
                    {selectedMicroTask.type}
                  </p>
                </div>
                  <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Test Task
                  </label>
                  <p className="text-sm text-black bg-whitep-2 p-2 rounded">
                    {selectedMicroTask.is_test ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {/* Task Content */}
              <div className=" border mt-4  border-gray-100 px-4 py-4   rounded-2xl   ">
                <label className="block text-sm font-medium text-black mb-2">
                  Task Content
                </label>
                <div className="bg-whitep-4 mb-4  p-2 ">
                  <p className="text-sm break-words  text-black whitespace-pre-wrap">
                    {selectedMicroTask.text || ""}
                  </p>
                </div>

                {/* Audio File */}
                {selectedMicroTask.type === "audio" &&
                  selectedMicroTask.file_path && (
                    <div className="p-2">
                      <label className="block text-sm font-medium text-black mb-2">
                        Audio File
                      </label>
                      <audio controls className="w-full">
                        <source
                          src={selectedMicroTask.file_path}
                          type="audio/mpeg"
                        />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
              </div>
              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
       
              </div>

              {/* Instruction */}
              {selectedMicroTask.instruction && (
                <div className=" px-4 py-4   border-gray-100  rounded-lg border ">
                  <label className="block text-sm font-medium text-gray-700 mb-2 ">
                    Instruction
                  </label>
                  <div className="p-2 ">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedMicroTask.instruction}
                    </p>
                  </div>
                </div>
              )}

              {/* Close Button */}
              {/* <div className="flex justify-end pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-white rounded-md hover:bg-blue-700 transition-colors"
                  style={{ backgroundColor: "#095FAF" }}
                >
                  Close
                </button>
              </div> */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MicroTaskList;
