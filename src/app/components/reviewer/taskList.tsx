"use client";
import React, { useState } from "react";

import { useDebounce } from "@/lib/hooks/useDebounce";
import { useGetProjectTask } from "@/lib/hooks/useReviewer";
import { Button } from "@/components/ui/button";
import { renderPaginationButtons } from "@/components/ui/paginationHelper";
import TaskCard from "./taskCard";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon, Loader2 } from "lucide-react";

import { TaskCardType } from "@/app/types/project";

interface TaskListProps {}
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

const TaskList: React.FC<TaskListProps> = ({}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const debouncedTaskSearch = useDebounce(taskSearchQuery, 500);
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize, setTaskPageSize] = useState(10);
  const [verificationStatus, setVerificationStatus] = useState<string>();
  const {
    data: tasksData,
    isLoading: isTaskLoading,
    isError: isTaskError,
    refetch,
  } = useGetProjectTask({
    page: taskPage,
    pageSize:taskPageSize,
    searchQuery: debouncedTaskSearch,
    verificationStatus,
  });

  const tasks: TaskCardType[] = tasksData?.data?.result || [];
  const taskTotalPages = tasksData?.data?.totalPages || 1;
  const taskTotalElements = tasksData?.data?.total || 0;
  const taskStartRecord = tasks.length ? (taskPage - 1) * taskPageSize + 1 : 0;
  const taskEndRecord = Math.min(taskPage * taskPageSize, taskTotalElements);

  const handleTaskClick = (taskId: string, task: TaskCardType) => {
    // Store task data in localStorage for the review page
    localStorage.setItem(`task_${taskId}`, JSON.stringify(task));
    // Navigate to the review page
    router.push(`/reviewer/tasks/${taskId}/review`);
  };

  return (
    <div>
      {isTaskLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : isTaskError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <p className="text-sm text-red-600">
            Reviewer tasks could not be loaded. Please try again.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center py-12">
          <img 
            src="/empty.svg" 
            alt="No tasks found" 
            className="w-64 h-64 opacity-50"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between py-4">
        <PaginationControls
          pagination={{
            pageCount: taskTotalPages,
            page: taskPage,
            setPage: setTaskPage,
            pageSize: taskPageSize,
            setPageSize: setTaskPageSize,
            showingText:
              taskTotalElements > 0
                ? `Showing ${taskStartRecord} to ${taskEndRecord} out of ${taskTotalElements} records`
                : "",
          }}
        />
      </div>
    </div>
  );
};

export default TaskList;
