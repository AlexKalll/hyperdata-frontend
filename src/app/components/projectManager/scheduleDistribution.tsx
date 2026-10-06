import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialogLeft";
import { Button } from "@/components/ui/button";

// @ts-ignore
import Papa from "papaparse/papaparse.min.js";
import { projectTaskasAll, projectTaskasRelated } from "@/lib/hooks/useProject";
import {
  TaskResponse,
  TaskResponseData,
  ProjectTask,
} from "@/app/types/project";
import { toast } from "sonner";
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
  Calendar,
  Copy,
  Plus,
  Users,
  Link2,
  ChevronDown,
} from "lucide-react";
interface ScheduleDistributionProps {
  distribution_started: boolean;
}

const ScheduleDistribution: React.FC<ScheduleDistributionProps> = ({
  distribution_started,
}) => {
  const [scheduleformData, setScheduleFormData] = useState({
    startDate: "",
    startTime: "",
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setScheduleFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "startDate" || name === "endDate") {
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label="More options"
          size="default"
          className="p-2 ml-2 rounded-md bg-primary text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {distribution_started
            ? "Schedule Redistribution "
            : "Schedule Distribution"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-1/2">
        <DialogHeader>
          <DialogTitle>Schedule Redistribution</DialogTitle>
        </DialogHeader>
        <div className="flex-1">
          <div className="relative mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distribution start date
            </label>
            <div className="relative">
              <input
                type="date"
                name="startDate"
                value={scheduleformData.startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none `}
                required
              />
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distribution time
            </label>
            <div className="relative">
              <input
                type="time"
                name="startTime"
                value={scheduleformData.startTime}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none `}
                required
              />
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 right-0 p-4 flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDistribution;
