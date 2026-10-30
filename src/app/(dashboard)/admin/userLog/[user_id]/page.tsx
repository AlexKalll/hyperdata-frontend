"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSingleUserlog } from "@/lib/hooks/useStatistics";
import { UserLog } from "@/app/types/global";
import type { SortingState } from "@tanstack/react-table";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialogLeft";
const UserLogPage: React.FC = () => {
  const router = useRouter();
  const { user_id } = useParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<string>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState<string>("");

  const {
    data: logData,
    isLoading: islogLoading,
    error: logError,
  } = useSingleUserlog(
    user_id as string,
    page,
    pageSize,
    searchQuery,
    verificationStatus ?? ""
  );
  const logs: UserLog[] = Array.isArray(logData?.data?.result)
    ? logData.data.result
    : [];
  const logTotalElements = logData?.data?.total || 0;
  const logTotalPages = logData?.data?.totalPages || 1;
  const logStartRecord = logs.length ? (page - 1) * pageSize + 1 : 0;
  const logEndRecord = Math.min(page * pageSize, logTotalElements);

  const logColumns: ColumnDef<UserLog>[] = [
    {
      accessorKey: "user_id",
      header: "User id",
      enableSorting: true,
    },
    {
      accessorKey: "action",
      header: "Action",
      enableSorting: true,
    },
    {
      accessorKey: "entity_type",
      header: "Entity type",
      enableSorting: true,
    },
    {
      accessorKey: "user_agent",
      header: "User agent",
      enableSorting: true,
    },
    
    {
      accessorKey: "ip",
      header: "IP",
      enableSorting: true,
    },
    {
      accessorKey: "created_date",
      header: "Created date",
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue() as string;
        if (!value) return "";
        const date = new Date(value);
        return date.toLocaleString();
      },
    },
    {
      accessorKey: "metadata",
      header: "Meta data",
      enableSorting: true,
      cell: ({ getValue, row }) => {
        const value = getValue() as string;
        const handleShowMore = () => {
          setSelectedMetadata(value || "");
          setIsDialogOpen(true);
        };
        return (
          <div className="flex items-center space-x-2">
            <span className="max-w-[150px] inline-block overflow-hidden text-ellipsis whitespace-nowrap">
              {value || ""}
            </span>
            {value && value.length > 20 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowMore}
                className="text-primary hover:text-blue-800"
              >
                Show More
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const logTable = useReactTable({
    data: logs,
    columns: logColumns,
    state: {
      sorting,
      pagination: { pageIndex: page - 1, pageSize: pageSize },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: logTotalElements,
  });
  if (logError) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Error loading logs: {(logError as Error).message}
        </p>
      </div>
    );
  }

  return (
    <>
      {islogLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-600">No logs found.</p>
      ) : (
        <div>
          <div className="rounded-md border border-gray-100 bg-white overflow-hidden relative">
            <Table className="w-full">
              <TableHeader>
                {logTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="text-sm font-bold text-gray-500"
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
                {logTable.getRowModel().rows?.length ? (
                  logTable.getRowModel().rows.map((row) => (
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
                      colSpan={logColumns.length}
                      className="h-24 text-center"
                    >
                      {islogLoading ? (
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
          <div className="flex items-center justify-between py-4">
            <PaginationControls
              pagination={{
                pageCount: logTotalPages,
                page: page,
                setPage: setPage,
                pageSize: pageSize,
                setPageSize: setPageSize,
                showingText:
                  logTotalElements > 0
                    ? `Showing ${logStartRecord} to ${logEndRecord} out of ${logTotalElements} records`
                    : "",
              }}
            />
          </div>
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Metadata Details
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-700 whitespace-pre-wrap break-words">
              {selectedMetadata}
            </p>
          </div>
          <div className="fixed bottom-0 right-0 p-4 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="text-black hover:bg-gray-100"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserLogPage;
