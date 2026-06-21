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
import {
  useGetTaskMicroTaskDetail,
  useGetTaskMicroTaskDetailFilter,
} from "@/lib/hooks/useMicrotask";
import { DeleteTask } from "./deleteMicrotask";
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
  MoreHorizontal,
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
import TaskDataset from "./microTaskDataset";
import { FilterComponent } from "@/components/ui/filterComponent";
import AddMicroTaskDialog from "./addMicroTaskDialog";

interface MicroTaskListProps {
  taskId: string;
  taskType: string;
  microTaskPage: number;
  setMicroTaskPage: (page: number) => void;
  microTaskPageSize: number;
  setMicroTaskPageSize: (pageSize: number) => void;
  searchQuery: string;
  verificationStatus?: string;
  setVerificationStatus: (status: string | undefined) => void;
  showCreateMicroTaskForm?: boolean;
  setShowCreateMicroTaskForm?: React.Dispatch<React.SetStateAction<boolean>>;
  taskMetadata?: any;
  onSubmitSingle?: (formData: {
    instruction: string;
    text: string;
    taskId: string;
    is_test: boolean;
    audioFile?: File;
  }) => void;
  onSubmitCsv?: (uploadData: { file: File }) => void;
  onSubmitAudio?: (uploadData: {
    files: File[];
    is_test: boolean;
    instruction: string;
  }) => void;
  onSubmitTask?: (formData: {
    taskId: string;
    source_task_id: string;
    from_micro_task: boolean;
    from_data_set: boolean;
    limit: number|null;
  }) => void;
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
        {(() => {
          const maxVisiblePages = 5;
          const currentPage = pagination.page;
          const totalPages = pagination.pageCount;
          
          if (totalPages <= maxVisiblePages) {
            // Show all pages if total is less than or equal to max visible
            return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "outline" : "ghost"}
                className={
                  currentPage === pageNumber
                    ? "bg-primary text-black font-bold border-primary"
                    : ""
                }
                size="sm"
                onClick={() => pagination.setPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            ));
          }
          
          const pages = [];
          
          // Always show first page
          pages.push(
            <Button
              key={1}
              variant={currentPage === 1 ? "outline" : "ghost"}
              className={
                currentPage === 1
                  ? "bg-primary text-black font-bold border-primary"
                  : ""
              }
              size="sm"
              onClick={() => pagination.setPage(1)}
            >
              1
            </Button>
          );
          
          // Add ellipsis if needed
          if (currentPage > 3) {
            pages.push(
              <span key="ellipsis-start" className="px-2 text-gray-500">
                ...
              </span>
            );
          }
          
          // Show pages around current page
          const startPage = Math.max(2, currentPage - 1);
          const endPage = Math.min(totalPages - 1, currentPage + 1);
          
          for (let i = startPage; i <= endPage; i++) {
            if (i !== 1 && i !== totalPages) {
              pages.push(
                <Button
                  key={i}
                  variant={currentPage === i ? "outline" : "ghost"}
                  className={
                    currentPage === i
                      ? "bg-primary text-black font-bold border-primary"
                      : ""
                  }
                  size="sm"
                  onClick={() => pagination.setPage(i)}
                >
                  {i}
                </Button>
              );
            }
          }
          
          // Add ellipsis if needed
          if (currentPage < totalPages - 2) {
            pages.push(
              <span key="ellipsis-end" className="px-2 text-gray-500">
                ...
              </span>
            );
          }
          
          // Always show last page if more than 1 page
          if (totalPages > 1) {
            pages.push(
              <Button
                key={totalPages}
                variant={currentPage === totalPages ? "outline" : "ghost"}
                className={
                  currentPage === totalPages
                    ? "bg-primary text-black font-bold border-primary"
                    : ""
                }
                size="sm"
                onClick={() => pagination.setPage(totalPages)}
              >
                {totalPages}
              </Button>
            );
          }
          
          return pages;
        })()}
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
  showCreateMicroTaskForm,
  setShowCreateMicroTaskForm,
  taskMetadata,
  onSubmitSingle,
  onSubmitCsv,
  onSubmitAudio,
  onSubmitTask,
}) => {
 
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<{ [key: string]: string | boolean }>(
    {}
  );
  const {
    data: microtasksData,
    isLoading: isMicroTaskLoading,
    error: microTaskError,
  } = useGetTaskMicroTaskDetailFilter({
    microTaskPage,
    microTaskPageSize,
    searchQuery,
    taskId,
    verificationStatus,
    filters,
  });
  const [isOpenDeletor, setIsOpenDeletor] = useState(false);
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
          {row.original.text || "No text"}
        </div>
      ),
    },
    // {
    //   accessorKey: "type",
    //   header: "Type",
    //   enableSorting: true,
    //   cell: ({ row }) => (
    //     <div className="min-w-[80px]">{row.original.type}</div>
    //   ),
    // },
    // {
    //   accessorKey: "instruction",
    //   header: "Instruction",
    //   enableSorting: false,
    // },
    // {
    //   accessorKey: "is_test",
    //   header: "Test",
    //   enableSorting: true,
    //   cell: ({ row }) => (
    //     <div className="min-w-[50px]">
    //       {row.original.is_test ? "true" : "false"}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "audio",
      header: (props) => (
        <div className="text-center align-middle justify-center">Audio</div>
      ),
      enableSorting: false,
      cell: function ProjectManagerAudioCell({ row }) {
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
      accessorKey: "",
      header: "submission",
      enableSorting: true,
      cell: ({ row }: { row: { original: MicroTask } }) => {
        return (
          <Dialog>
            <DialogTrigger asChild>
              <button
                aria-label="More options"
                className="py-1.5 px-2 rounded-2xl bg-primary text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                View
              </button>
            </DialogTrigger>
            <DialogContent className="w-full">
              <DialogHeader>
                <DialogTitle></DialogTitle>
              </DialogHeader>
              <TaskDataset microTaskId={row.original.id} />
            </DialogContent>
          </Dialog>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <>
          <button
            onClick={() => handleViewDetails(row.original)}
            className="border ml -3 mr-2 border-gray-100  text-grey-300 hover:text-grey-800 transition-colors p-1 rounded-e-sm rounded-s-sm   hover:bg-blue-50"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
        </>
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
  const filterableColumns = [

    { accessorKey: "text", header: "Text" },
    { accessorKey: "is_test", header: "Test" },
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
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: microTaskTotalElements,
  });

  const handleFilterChange = (
    newFilters: { [key: string]: string | boolean },
    endpoint: string
  ) => {
    setFilters(newFilters);
    setMicroTaskPage(1);
  };

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
        <>
          <div className="flex justify-end items-center gap-4 mb-4">
            {taskMetadata &&
              showCreateMicroTaskForm !== undefined &&
              setShowCreateMicroTaskForm &&
              onSubmitSingle &&
              onSubmitCsv &&
              onSubmitAudio &&
              onSubmitTask && (
                <AddMicroTaskDialog
                  taskMetadata={taskMetadata}
                  open={showCreateMicroTaskForm}
                  setOpen={setShowCreateMicroTaskForm}
                  tasks={[]}
                  onSubmitSingle={onSubmitSingle}
                  onSubmitCsv={onSubmitCsv}
                  onSubmitAudio={onSubmitAudio}
                  onSubmitTask={onSubmitTask}
                />
              )}
            <FilterComponent
              columns={filterableColumns}
              onFilterChangeAction={handleFilterChange}
              initialFilters={filters}
              endpoint={`/api/workspace/micro-task/task/${taskId}`}
            />
          </div>
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
        </>
      ) : isMicroTaskLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div>
          <div className="flex justify-end items-center gap-4 mb-4">
            {taskMetadata &&
              showCreateMicroTaskForm !== undefined &&
              setShowCreateMicroTaskForm &&
              onSubmitSingle &&
              onSubmitCsv &&
              onSubmitAudio &&
              onSubmitTask && (
                <AddMicroTaskDialog
                  taskMetadata={taskMetadata}
                  open={showCreateMicroTaskForm}
                  setOpen={setShowCreateMicroTaskForm}
                  tasks={[]}
                  onSubmitSingle={onSubmitSingle}
                  onSubmitCsv={onSubmitCsv}
                  onSubmitAudio={onSubmitAudio}
                  onSubmitTask={onSubmitTask}
                />
              )}
            <FilterComponent
              columns={filterableColumns}
              onFilterChangeAction={handleFilterChange}
              initialFilters={filters}
              endpoint={`/api/workspace/micro-task/task/${taskId}`}
            />
          </div>
          <div className="rounded-md border border-gray-100 bg-white overflow-hidden relative">
            <Table>
              <TableHeader>
                {microTaskTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const headerContent = flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      );
                     
                      const isAudioHeader = headerContent === "Audio";

                      return (
                        <TableHead
                          key={header.id}
                          className={`text-sm font-bold bg-white text-gray-700 px-5 py-5 ${
                            isAudioHeader ? "text-center" : ""
                          }`}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className="flex items-center space-x-1 cursor-pointer"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <span
                                className={`text-gray-500 ${
                                  isAudioHeader
                                    ? "w-auto justify-center text-center"
                                    : ""
                                }`}
                              >
                                {headerContent}
                              </span>
                              {header.column.getCanSort() && (
                                <span
                                  className={`text-gray-500 ${
                                    isAudioHeader ? "text-center" : ""
                                  }`}
                                >
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
                {microTaskTable.getRowModel().rows?.length ? (
                  microTaskTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="border-gray-100">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-5 px-5 text-sm text-gray-500"
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

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px] h-[100vh] overflow-y-scroll bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-black"> Micro Task Details</DialogTitle>
          </DialogHeader>
          {selectedMicroTask && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="border mt-4  border-gray-100 px-4 py-4   rounded-2xl  ">
                <div>
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
                    </svg>{" "}
                    Basic Information
                  </h3>
                </div>
                <div className="   ">
                  <label className="mt-4 block text-sm font-medium text-black mb-2">
                    Task Content
                  </label>
                  <div className=" mt-4">
                    <p className="text-sm text-black break-words whitespace-pre-wrap">
                      {selectedMicroTask.text || ""}
                    </p>
                  </div>

                  {/* Audio File */}
                  {selectedMicroTask.type === "audio" &&
                    selectedMicroTask.file_path && (
                      <div className=" mt-4">
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

                  {selectedMicroTask.instruction && (
                    <div className="">
                      <label className="block  font-medium text-black mb-2 mt-3">
                        Instruction
                      </label>
                      <div className="mt-4">
                        <p className="text-sm text-black whitespace-pre-wrap">
                          {selectedMicroTask.instruction}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>{/* Task Content */}</div>
              {/* Instruction */}

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsOpenDeletor(true)}
                  className="!bg-white !text-red-500 !border-[0.5px] !border-red-500 !hover:bg-red-100 !rounded-lg !px-4 !py-2 flex items-center gap-2"
                  style={{ backgroundColor: "#095FAF" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.25 4.5835L15.7336 12.9377C15.6016 15.0722 15.5357 16.1394 15.0007 16.9067C14.7361 17.2861 14.3956 17.6062 14.0006 17.8468C13.2017 18.3335 12.1325 18.3335 9.99392 18.3335C7.8526 18.3335 6.78192 18.3335 5.98254 17.8459C5.58733 17.6049 5.24667 17.2842 4.98223 16.9042C4.4474 16.1357 4.38287 15.0669 4.25384 12.9295L3.75 4.5835"
                      stroke="#D03710"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                    <path
                      d="M2.5 4.58317H17.5M13.3797 4.58317L12.8109 3.40961C12.433 2.63005 12.244 2.24027 11.9181 1.99718C11.8458 1.94325 11.7693 1.89529 11.6892 1.85375C11.3283 1.6665 10.8951 1.6665 10.0287 1.6665C9.14067 1.6665 8.69667 1.6665 8.32973 1.8616C8.24842 1.90485 8.17082 1.95475 8.09774 2.01081C7.76803 2.26375 7.58386 2.6678 7.21551 3.47589L6.71077 4.58317"
                      stroke="#D03710"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7.91602 13.75V8.75"
                      stroke="#D03710"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12.084 13.75V8.75"
                      stroke="#D03710"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span> Delete Microtask</span>
                </Button>
                <DeleteTask
                  isOpen={isOpenDeletor}
                  onClose={() => setIsOpenDeletor(false)}
                  task_id={selectedMicroTask.id}
                  task_name={""} // Add this line
                />
                {/* <Button
                  variant="outline"
                  className="ml-2 bg-white text-primary !border-primary hover:bg-gray-100 rounded-lg px-4 py-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M11.7282 3.23796C12.3492 2.56515 12.6597 2.22875 12.9896 2.03252C13.7857 1.55905 14.766 1.54432 15.5754 1.99368C15.9108 2.17991 16.2308 2.50685 16.8709 3.16071C17.511 3.81458 17.8311 4.14151 18.0133 4.48419C18.4532 5.31101 18.4388 6.31241 17.9753 7.12566C17.7832 7.46271 17.4539 7.7799 16.7953 8.41425L8.95892 15.962C7.71082 17.1642 7.08675 17.7652 6.3068 18.0698C5.52685 18.3745 4.66942 18.3521 2.95455 18.3072L2.72123 18.3012C2.19917 18.2875 1.93814 18.2807 1.78641 18.1084C1.63467 17.9362 1.65538 17.6703 1.69682 17.1386L1.71932 16.8498C1.83592 15.353 1.89422 14.6047 2.18651 13.9319C2.47878 13.2592 2.98295 12.713 3.99127 11.6205L11.7282 3.23796Z"
                      stroke="#095FAF"
                      strokeWidth="1.25"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.8333 3.33325L16.6666 9.16659"
                      stroke="#095FAF"
                      strokeWidth="1.25"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.6667 18.3333H18.3334"
                      stroke="#095FAF"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Edit
                </Button> */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MicroTaskList;
