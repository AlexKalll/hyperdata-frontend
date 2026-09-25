import React, { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialogBig";
import {
  showFacilltatorContributorsFiltered,
  RemoveFacilitatorContributor,
} from "@/lib/hooks/useFetchUser";
import { UserTask } from "@/app/types/global";

interface ShowFacilltatorContributorsProps {
  onCancel: () => void;
  taskID: string;
  open: boolean;
  selectedFacilitator?: UserTask | null;
}

const ShowFacilltatorContributors: React.FC<
  ShowFacilltatorContributorsProps
> = ({ onCancel, taskID, open, selectedFacilitator }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [taskSearchQuery] = useState("");
  const debouncedTaskSearch = useDebounce(taskSearchQuery, 500);
  const [filters] = useState<{ [key: string]: string | boolean }>({});
  const [verificationStatus] = useState<string>();
  const {
    data: usersData,
    isLoading: isUserLoading,
    refetch,
  } = showFacilltatorContributorsFiltered({
    page,
    user_id: selectedFacilitator?.user.id || "",
    taskID,
    pageSize,
    searchQuery: debouncedTaskSearch,
    verificationStatus,
    filters,
  });

  // Type guard to ensure usersData has the correct structure
  const hasValidData = (data: any): data is { data: { result: UserTask[]; total: number } } => {
    return data && typeof data === 'object' && 'data' in data && 
           data.data && typeof data.data === 'object' && 'result' in data.data;
  };

  // State to cache all users fetched across different pages
  const [cachedUsers, setCachedUsers] = useState<UserTask[]>([]);

  // Refetch data when dialog opens
  useEffect(() => {
    if (open) {
      
      refetch();
    }
  }, [open, refetch]);

  useEffect(() => {
    if (hasValidData(usersData)) {
      setCachedUsers((prev) => {
        const newUsers = usersData.data.result.filter(
          (newUser: UserTask) =>
            !prev.some((cachedUser) => cachedUser.id === newUser.id)
        );
        return [...prev, ...newUsers];
      });
    }
  }, [usersData]);

  const removeUserMutation = RemoveFacilitatorContributor();

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUserMutation.mutateAsync({
        facilitator_id: selectedFacilitator?.user.id,
        contributor_ids: [userId],
        task_id: taskID,
      });

      // Update both selectedUsers and cachedUsers to reflect the removal
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
      setCachedUsers((prev) => prev.filter((user) => user.id !== userId));

      // Also refetch to ensure data is in sync with backend
      refetch();

    } catch (error) {
      console.error("Error removing contributor:", error);
    }
  };

  const [selectedUsers, setSelectedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem(`selectedUsers_${taskID}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      `selectedUsers_${taskID}`,
      JSON.stringify(selectedUsers)
    );
  }, [selectedUsers, taskID]);

  // Derive selectedUserDetails from the cachedUsers array
  const selectedUserDetails = cachedUsers.filter((user) =>
    selectedUsers.includes(user.id)
  );



  const totalUsers = hasValidData(usersData) ? usersData.data.total : 0;
  const totalPages = Math.ceil(totalUsers / pageSize);

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Assigned Contributors to{" "}
            {selectedFacilitator?.user.first_name ||
              selectedFacilitator?.user.email ||
              "Facilitator"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          {isUserLoading ? (
            <div className="text-center py-4">Loading contributors...</div>
          ) : cachedUsers.length > 0 ? (
            <>
              <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone number
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cachedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap text-xs">
                          {user.first_name || "No name"} {user.last_name || ""}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs">
                          {user.email}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-xs">
                          {user.phone_number || ""}
                        </td>

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
                        <td className="px-4 py-2 whitespace-nowrap text-xs">
                          <button
                            type="button"
                            onClick={() => handleRemoveUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
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
                    Showing {Math.min((page - 1) * pageSize + 1, totalUsers)} to{" "}
                    {Math.min(page * pageSize, totalUsers)} of {totalUsers}{" "}
                    records
                  </span>
                </div>
                <nav
                  className="relative z-0 inline-flex rounded-md  -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    type="button"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPage(p)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === p
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
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
            <div className="text-center py-4 text-gray-500">
              No contributors assigned
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShowFacilltatorContributors;
