import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { AddTaskContributor } from "@/lib/hooks/useProjectManager";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialogLeft";
import {
  userRoleProfiles,
  userRoleProfilesFilter,
  userRoleProfilesFilterUnassigned,
} from "@/lib/hooks/useFetchUser";
import { FilterComponent } from "@/components/ui/filterComponent";

interface CreateContributorsProps {
  onCancel: () => void;
  open: boolean;
  taskId: string;
  memberType: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateContributors: React.FC<CreateContributorsProps> = ({
  onCancel,
  taskId,
  memberType,
  open,
  setOpen,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7); // Initial page size
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const debouncedTaskSearch = useDebounce(taskSearchQuery, 500);
  const [verificationStatus, setVerificationStatus] = useState<string>();
  const [filters, setFilters] = useState<{ [key: string]: string | boolean }>({
    role: "Contributor",
  });
  const { data: usersData, isLoading: isUserLoading } =
    userRoleProfilesFilterUnassigned({
      page,
      taskId,
      pageSize, // pageSize is passed to the hook
      searchQuery: debouncedTaskSearch,
      verificationStatus,
      role: memberType,
      filters,
    });
  const filterableColumns = [
    { accessorKey: "first_name", header: "First Name" },
    { accessorKey: "middle_name", header: "Middle Name (Father Name)" },
    { accessorKey: "last_name", header: "Last Name((Grandfather Name))" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone_number", header: "Phone number" },
    { accessorKey: "gender", header: "Gender" },
    { accessorKey: "is_active", header: "Active" },
  ];
  const handleFilterChange = (
    newFilters: { [key: string]: string | boolean },
    endpoint: string
  ) => {
    setFilters(newFilters);
    setPage(1);
  };
  // State to cache all users fetched across different pages
  const [cachedUsers, setCachedUsers] = useState<any[]>([]);

  useEffect(() => {
    if (usersData?.data?.result) {
      // Add new users to the cache, filtering out duplicates by ID
      setCachedUsers((prev) => {
        const newUsers = usersData.data.result.filter(
          (newUser: any) =>
            !prev.some((cachedUser) => cachedUser.id === newUser.id)
        );
        return [...prev, ...newUsers];
      });
    }
  }, [usersData?.data?.result]);

  const addUSerMutation = AddTaskContributor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addUSerMutation.mutateAsync({
        contributor_ids: selectedUsers, // Correctly uses selectedUsers
        taskId: taskId,
      });
      localStorage.removeItem(`selectedUsers_${taskId}`);
      onCancel();
    } catch (error) {
      console.error("Error adding contributors:", error);
    }
  };

  const [activeTab, setActiveTab] = useState("users");
  const [selectedUsers, setSelectedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem(`selectedUsers_${taskId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  useEffect(() => {
    localStorage.setItem(
      `selectedUsers_${taskId}`,
      JSON.stringify(selectedUsers)
    );
  }, [selectedUsers, taskId]);

  // Derive selectedUserDetails from the cachedUsers array
  const selectedUserDetails =
    cachedUsers.filter((user: any) => selectedUsers.includes(user.id)) || [];

  const totalUsers = usersData?.data?.total || 0;
  const totalPages = Math.ceil(totalUsers / pageSize);

  // Function to handle page size change
  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPageSize(Number(event.target.value));
    setPage(1); // Reset to first page when page size changes
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Add {memberType} to Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Tabs */}
            <div className="flex space-x-4 mb-4 border-b">
              <button
                type="button"
                className={`pb-2 ${
                  activeTab === "users"
                    ? "text-primary border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("users")}
              >
                Users List
              </button>
              <button
                type="button"
                className={`pb-2 ${
                  activeTab === "selected"
                    ? "text-primary border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("selected")}
              >
                Selected Contributors ({selectedUsers.length})
              </button>
            </div>

            {/* Users List Tab */}
            {activeTab === "users" && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-semibold text-gray-800">
                    Selected Contributors ({selectedUsers.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("selected")}
                    className="px-4 py-2 text-primary border border-blue-600 rounded-md hover:bg-blue-50 text-sm"
                  >
                    Show Selected
                  </button>
                  <FilterComponent
                    columns={filterableColumns}
                    onFilterChangeAction={handleFilterChange}
                    initialFilters={filters}
                    endpoint={``}
                  />
                </div>
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={taskSearchQuery}
                    onChange={(e) => {
                      setTaskSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search users..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                {isUserLoading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : (usersData?.data?.result ?? []).length > 0 ? (
                  <>
                    <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded"
                                checked={
                                  usersData?.data?.result?.every((user: any) =>
                                    selectedUsers.includes(user.id)
                                  ) && usersData?.data?.result?.length > 0
                                }
                                onChange={(e) => {
                                  const allVisibleIds =
                                    usersData?.data?.result?.map(
                                      (user: any) => user.id
                                    ) || [];
                                  if (e.target.checked) {
                                    setSelectedUsers((prev) => [
                                      ...new Set([...prev, ...allVisibleIds]),
                                    ]);
                                  } else {
                                    setSelectedUsers((prev) =>
                                      prev.filter(
                                        (id) => !allVisibleIds.includes(id)
                                      )
                                    );
                                  }
                                }}
                              />
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Full Name
                              <button
                                type="button"
                                className="ml-1 focus:outline-none"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 inline-block"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                  />
                                </svg>
                              </button>
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                              <button
                                type="button"
                                className="ml-1 focus:outline-none"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 inline-block"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                  />
                                </svg>
                              </button>
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Phone number
                              <button
                                type="button"
                                className="ml-1 focus:outline-none"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 inline-block"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                  />
                                </svg>
                              </button>
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                              <button
                                type="button"
                                className="ml-1 focus:outline-none"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 inline-block"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                  />
                                </svg>
                              </button>
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                              <button
                                type="button"
                                className="ml-1 focus:outline-none"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 inline-block"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                  />
                                </svg>
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {usersData?.data?.result?.map((user: any) => (
                            <tr
                              key={user.id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleToggleUser(user.id)}
                            >
                              <td className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user.id)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleUser(user.id);
                                  }}
                                  className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs">
                                {user.first_name || "No name"}{" "}
                                {user.last_name || ""}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs">
                                {user.email}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs">
                                {user.phone_number || "No phone number"}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-xs">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {memberType}
                                </span>
                              </td>
                              {/* Removed the duplicate email column here */}
                              <td className="px-4 py-2 whitespace-nowrap text-xs">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    user.is_active
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {user.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <span>Show</span>
                        <select
                          value={pageSize}
                          onChange={handlePageSizeChange}
                          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={5}>5</option>
                          <option value={7}>7</option>
                          <option value={10}>10</option>
                          <option value={15}>15</option>
                          <option value={20}>20</option>
                        </select>
                        <span>entries</span>
                        <span className="ml-4">
                          Showing{" "}
                          {Math.min((page - 1) * pageSize + 1, totalUsers)} to{" "}
                          {Math.min(page * pageSize, totalUsers)} of{" "}
                          {totalUsers} records
                        </span>
                      </div>
                      <nav
                        className="relative z-0 inline-flex rounded-md  -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Previous</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((p) => (
                          <button
                            type="button"
                            key={p}
                            onClick={() => setPage(p)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === p
                                ? "z-10 bg-blue-50 border-blue-500 text-primary"
                                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setPage((prev) => Math.min(prev + 1, totalPages))
                          }
                          disabled={page === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </>
                ) : (
                  <div className="relative flex flex-col items-center justify-center py-8">
                    <img 
                      src="/empty.svg" 
                      alt="No users found" 
                      className="w-32 h-32 opacity-50"
                    />
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      selectedUsers.length === 0 || addUSerMutation.isPending
                    }
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {addUSerMutation.isPending
                      ? "Adding..."
                      : "Add Contributors"}
                  </button>
                </div>
              </div>
            )}

            {/* Selected Contributors Tab */}
            {activeTab === "selected" && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-semibold text-gray-800">
                    Selected Contributors ({selectedUsers.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("users")}
                    className="px-4 py-2 text-primary border border-blue-600 rounded-md hover:bg-blue-50 text-sm"
                  >
                    Back to Users List
                  </button>
                </div>

                {selectedUserDetails.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded"
                              checked={
                                selectedUsers.length ===
                                  selectedUserDetails.length &&
                                selectedUserDetails.length > 0
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers(
                                    selectedUserDetails.map(
                                      (user: any) => user.id
                                    )
                                  );
                                } else {
                                  // This is tricky: if you uncheck "all" here, it might unselect *all* selected users
                                  // from everywhere, not just those currently displayed in this list.
                                  // For simplicity, this will remove all selected users shown in this tab.
                                  setSelectedUsers((prev) =>
                                    prev.filter(
                                      (id) =>
                                        !selectedUserDetails
                                          .map((user: any) => user.id)
                                          .includes(id)
                                    )
                                  );
                                }
                              }}
                            />
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Full Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone Number
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedUserDetails.map((user: any) => (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleToggleUser(user.id)}
                          >
                            <td className="px-4 py-2 whitespace-nowrap text-xs">
                              <input
                                type="checkbox"
                                checked={true} // Always checked in this tab
                                onChange={() => handleToggleUser(user.id)}
                                className="h-4 w-4 text-primary focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-xs">
                              {user.first_name || "No name"}{" "}
                              {user.last_name || ""}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-xs">
                              {user.email}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-xs">
                              {user.phoneNumber || "No phone number"}
                            </td>

                            <td className="px-4 py-2 whitespace-nowrap text-xs">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {memberType}
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-xs">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No contributors selected
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      selectedUsers.length === 0 || addUSerMutation.isPending
                    }
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {addUSerMutation.isPending
                      ? "Adding..."
                      : "Add Contributors"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContributors;
