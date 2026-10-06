"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  CustomDialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialogLeft";
import { formatDateMedium } from "@/app/types/dateUtils";
import { UserData, UserLog } from "@/app/types/global";
import { Badge } from "@/app/components/ui/badge";
import { usedeactivateUser } from "@/lib/hooks/useFetchUser";
import { Button } from "@/components/ui/button";
import UpdateUserForm from "./updateUserForm";
import { DeactivateUser } from "./deactivateUser";
import { useRouter } from "next/navigation";
import { useSingleUserlog } from "@/lib/hooks/useStatistics";
import { PaginationControls } from "@/components/ui/paginationShort";
import {
  Loader2,
} from "lucide-react";
import {
  Table,
  TableCell,
  TableBody,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";

interface UserDetailsModalProps {
  user: UserData | null;
  isOpen: boolean;
  onCloseAction: () => void;
  onDeactivate: (userId: string) => void;
  onEdit: (userId: string) => void;
}

export function UserDetailsModal({
  user,
  isOpen,
  onCloseAction,
}: UserDetailsModalProps) {
  const [isOpenEditer, setIsOpenEditer] = useState(false);
  const [isOpenDiactivate, setIsOpenDiactivate] = useState(false);
  const updateUserMutation = usedeactivateUser();
  const [activeTab, setActiveTab] = useState<"User Details" | "Activity log">(
    "User Details"
  );
  const handleDeactivate = async () => {
    if (!user) return;
    await updateUserMutation.mutateAsync(user);
    onCloseAction();
  };
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery] = useState("");
  const [verificationStatus] = useState<string>();
  const {
    data: logData,
    isLoading: islogLoading,
    error: logError,
  } = useSingleUserlog(
    user?.id ?? "",
    page,
    pageSize,
    searchQuery,
    verificationStatus ?? ""
  );
  const logs: UserLog[] = Array.isArray(logData?.data?.result)
    ? logData?.data?.result || []
    : [];
  const [sorting, setSorting] = useState<SortingState>([]);
  const logTotalElements = logData?.data?.total ?? 0;
  const logTotalPages = logData?.data?.totalPages ?? 1;
  const logStartRecord = logs.length ? (page - 1) * pageSize + 1 : 0;
  const logEndRecord = Math.min(page * pageSize, logTotalElements);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMetadata] = useState<string>("");

  const logColumns: ColumnDef<UserLog>[] = [
    {
      accessorKey: "action",
      header: "Action",
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <span className="text-gray-500 flex flex-row items-center">
            <svg
              width="35"
              height="35"
              viewBox="0 0 35 35"
              fill="none"
              className="mr-2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="35" height="35" rx="17.5" fill="#FF0000" />
              <path
                d="M18 21.6668V19.8335"
                stroke="white"
                strokeWidth="1.375"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.5833 20.7502C11.5833 17.2063 14.4561 14.3335 17.9999 14.3335C21.5438 14.3335 24.4166 17.2063 24.4166 20.7502C24.4166 24.294 21.5438 27.1668 17.9999 27.1668C14.4561 27.1668 11.5833 24.294 11.5833 20.7502Z"
                stroke="white"
                strokeWidth="1.375"
              />
              <path
                d="M22.125 15.7085V12.9585C22.125 10.6803 20.2782 8.8335 18 8.8335C15.7218 8.8335 13.875 10.6803 13.875 12.9585V15.7085"
                stroke="white"
                strokeWidth="1.375"
                strokeLinecap="round"
              />
            </svg>
            {value}
          </span>
        );
      },
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

  if (!user) return null;

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
      <Dialog open={isOpen} onOpenChange={onCloseAction}>
        <DialogContent className="sm:max-w-[600px]">
          {/* Tab Navigation Inside DialogContent */}
          <div className="border-b border-gray-100 mb-4 mr-2">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab("User Details")}
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === "User Details"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                User Details
              </button>
              <button
                onClick={() => setActiveTab("Activity log")}
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === "Activity log"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Activity log
              </button>
            </nav>
          </div>

          {activeTab === "User Details" && (
            <div>
              <div className="space-y-1 pb-4 flex items-center gap-4 mt-7 rounded-2xl border-b bg-gray-100 px-2 py-2 border-gray-100 mb-4">
                <img
                  src={user?.image || "/default-avatar.png"}
                  alt="User"
                  className="w-16 h-16 mt-2 mb-2 rounded-full"
                />
                <div>
                  <h2 className="text-xl font-semibold flex items-center h-8">
                    {user.first_name} {user.last_name}
                  </h2>
                  <Badge
                    className="ml-5 p-2 h-5 mt-2"
                    variant={user.is_active ? "active" : "deactivated"}
                  >
                    <span
                      className={`w-2 mr-2 h-2 rounded-full ${
                        user.is_active ? "bg-[#037847]" : "bg-red-500"
                      }`}
                    ></span>
                    {user.is_active ? "Active" : "Deactivated"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center mb-2">
                <DialogHeader>
                  <p className="mb-8 font-medium">General Info</p>
                </DialogHeader>
              </div>
              <div className="grid gap-4 py-4 bg-white">
                <div className="grid grid-cols-3 items-center gap-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500 col-span-1">
                    Role
                  </span>
                  <div className="col-span-2 flex justify-end">
                    {((typeof user.role === 'object' && user.role?.name) || (typeof user.role === 'string' && user.role)) && (
                      <span
                        className={`inline-block whitespace-nowrap px-2 py-1 text-sm font-medium rounded-2xl ${
                          (typeof user.role === 'object' ? user.role?.name : user.role) === "Admin"
                            ? "text-red-500 bg-gray-100"
                            : (typeof user.role === 'object' ? user.role?.name : user.role) === "Contributor"
                              ? "bg-[#ECF6FF] text-[#095FAF]"
                              : (typeof user.role === 'object' ? user.role?.name : user.role) === "ProjectManager"
                                ? "text-[#0502C2] bg-[#F0EFFF]"
                                : (typeof user.role === 'object' ? user.role?.name : user.role) === "Facilitator"
                                  ? "text-[#3F3748] bg-gray-100"
                                  : (typeof user.role === 'object' ? user.role?.name : user.role) === "Reviewer"
                                    ? "bg-[#FCEFFF] text-[#8500A3]"
                                    : ""
                        }`}
                      >
                        {typeof user.role === 'object' ? user.role?.name : user.role}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 mt-2 items-center gap-4 mb-3 h-8 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    Email
                  </span>
                  <span className="text-gray-900 flex justify-end">
                    {user.email}
                  </span>
                </div>

                <div className="grid grid-cols-2 items-center gap-4 mb-3 h-8 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    Birth Date
                  </span>

                  <span className="text-gray-900 flex justify-end">
                    {user.birth_date ? formatDateMedium(user.birth_date) : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center gap-4 mb-3 h-8 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    Gender
                  </span>
                  <span className="text-gray-900 flex justify-end">
                    {user.gender}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center gap-4 mb-3 h-8 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    Language
                  </span>
                  <span className="text-gray-900 flex justify-end">
                    {typeof user.language === 'object' ? user.language?.name || '' : user.language}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center gap-4 mb-3 h-8 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    Dialect
                  </span>
                  <span className="text-gray-900 flex justify-end">
                    {typeof user.dialect === 'object' ? user.dialect?.name || '' : user.dialect}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center gap-4 mb-3 h-8 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    Phone Number
                  </span>
                  <span className="text-gray-900 flex justify-end">
                    {user.phone_number}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center gap-4 mb-3 h-8 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    City
                  </span>
                  <span className="text-gray-900 flex justify-end">
                    {typeof user.city === 'object' ? user.city?.name || '' : user.city}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center gap-4 mb-3 h-8 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">
                    Woreda
                  </span>
                  <span className="text-gray-900 flex justify-end">
                    {typeof user.woreda === 'object' ? user.woreda?.name || '' : user.woreda}
                  </span>
                </div>
                <div className="grid grid-cols-2 items-center gap-4 py-3">
                  <span className="text-sm font-medium text-gray-500">
                    Created Date
                  </span>
                  <span className="text-gray-900 flex justify-end">
                    {user.created_date
                      ? formatDateMedium(user.created_date)
                      : ""}
                  </span>
                </div>
                <div className="flex justify-end items-center pt-4 mt-2">
                  <div className="flex items-center space-x-2">
                    {user.is_active ? (
                      <Button
                        onClick={() => {
                          setIsOpenDiactivate(true);
                          onCloseAction();
                        }}
                        variant="outline"
                        className="!bg-white !text-red-500 !border-[0.5px] !border-red-500 !hover:bg-red-100 !rounded-lg !px-4 !py-2 flex items-center gap-2"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4.24996 8.99967H13.4166M16.2812 8.99967C16.2812 10.975 15.4965 12.8694 14.0998 14.2661C12.703 15.6629 10.8086 16.4476 8.83329 16.4476C6.85798 16.4476 4.96358 15.6629 3.56682 14.2661C2.17006 12.8694 1.38538 10.975 1.38538 8.99967C1.38538 7.02436 2.17006 5.12996 3.56682 3.7332C4.96358 2.33645 6.85798 1.55176 8.83329 1.55176C10.8086 1.55176 12.703 2.33645 14.0998 3.7332C15.4965 5.12996 16.2812 7.02436 16.2812 8.99967Z"
                            stroke="#D03710"
                            strokeWidth="1.25"
                          />
                        </svg>
                        Deactivate account
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          handleDeactivate();
                        }}
                        variant="outline"
                        className="ml-2 bg-white text-primary !border-primary hover:bg-gray-100 rounded-lg px-4 py-2"
                      >
                        Activate account
                      </Button>
                    )}
                  </div>
                  <Button
                variant="outline"
                    className="ml-2 bg-white text-primary !border-primary hover:bg-gray-100 rounded-lg px-4 py-2"
                onClick={() => setIsOpenEditer(true)}
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
                  </Button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "Activity log" && (
            <div>
              {islogLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="w-6 h-8 animate-spin" />
                </div>
              ) : logs.length === 0 ? (
                <div className="relative flex flex-col items-center justify-center py-12">
                  <img 
                    src="/empty.svg" 
                    alt="No logs found" 
                    className="w-64 h-64 opacity-50"
                  />
                </div>
              ) : (
                <div>
                  <div className="rounded-md border border-gray-100 bg-white overflow-hidden relative">
                    <Table className="w-full">
                      {/* <TableHeader>
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
                                        {header.column.getIsSorted() ===
                                        "asc" ? (
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
                      </TableHeader> */}
                      <TableBody>
                        {logTable.getRowModel().rows?.length ? (
                          logTable.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              className=" bg-white border-gray-200 mb-2"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell
                                  key={cell.id}
                                  className="py-5 px-2 text-sm"
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
                              colSpan={logColumns.length}
                              className="h-24 text-center"
                            >
                              {islogLoading ? (
                                ""
                              ) : (
                                <div className="flex justify-center items-center h-48">
                                  <Loader2 className="w-6 h-8 animate-spin" />
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
            </div>
          )}
        </DialogContent>
      </Dialog>
      <CustomDialog
        open={isOpenEditer}
        onOpenChange={setIsOpenEditer}
        onClose={() => setIsOpenEditer(false)}
      >
        <DialogContent>
          <DialogHeader>
            <p className="mb-8 font-bold">Update User</p>
          </DialogHeader>
          <UpdateUserForm
            onClose={() => setIsOpenEditer(false)}
            initialData={{ 
              ...user, 
              role: typeof user.role === 'object' ? user.role?.name || '' : user.role || ''
            }}
          />
        </DialogContent>
      </CustomDialog>
      <DeactivateUser
        isOpen={isOpenDiactivate}
        user={user}
        onClose={() => setIsOpenDiactivate(false)}
      />
    </>
  );
}
