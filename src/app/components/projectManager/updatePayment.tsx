import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { TaskResponseData } from "@/app/types/project";
import axios from "axios";
interface UpdateTaskFormProps {
  task: TaskResponseData;
  onClose: () => void;
}
interface UpdateTaskForm {
  id: string;
  reviewer_payment_per_microtask: number;
  contributor_payment_per_microtask: number;
}

const UpdatePaymentModal: React.FC<UpdateTaskFormProps> = ({
  onClose,
  task,
}) => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<UpdateTaskForm>({
    id: task.id,
    reviewer_payment_per_microtask: task.payment?.reviewer_credit_per_microtask
      ? task.payment.reviewer_credit_per_microtask
      : 0,
    contributor_payment_per_microtask: task.payment
      ?.contributor_credit_per_microtask
      ? task.payment.contributor_credit_per_microtask
      : 0,
  });
  const queryClient = useQueryClient();
  const updateTaskMutation = useMutation({
    mutationFn: async (taskData: UpdateTaskForm) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${taskData.id}/payment`,
        {
          reviewer_credit_per_microtask:
            taskData.reviewer_payment_per_microtask,
          contributor_credit_per_microtask:
            taskData.contributor_payment_per_microtask,
        },
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Task updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to update task";
        const errorDetails = error.response?.data?.errors
          ? JSON.stringify(error.response.data.errors)
          : "";
        toast.error("Error", {
          description: `${errorMessage}${errorDetails ? `: ${errorDetails}` : ""}`,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred",
        });
      }
    },
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh
    
    // Basic validation
    if (formData.reviewer_payment_per_microtask < 0) {
      setErrors({ reviewer_payment_per_microtask: "Payment cannot be negative" });
      return;
    }
    
    if (formData.contributor_payment_per_microtask < 0) {
      setErrors({ contributor_payment_per_microtask: "Payment cannot be negative" });
      return;
    }

    try {
      await updateTaskMutation.mutateAsync(formData);
      onClose(); // Close modal on success
    } catch (error) {
      // Error is already handled in the mutation's onError
      console.error("Error updating payment:", error);
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-80 z-50 flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={updateTaskMutation.isPending}
        >
          <X className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Update Payment Settings
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Reviewer payment (credits per reviewed microtask){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              required
              name="reviewer_payment_per_microtask"
              type="number"
              value={formData.reviewer_payment_per_microtask}
              onChange={handleChange}
               placeholder="Enter credits"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.reviewer_payment_per_microtask
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.reviewer_payment_per_microtask && (
              <p className="text-red-500 text-sm">
                {errors.reviewer_payment_per_microtask}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Contributor payment (credits per approved microtask){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              required
              name="contributor_payment_per_microtask"
              type="number"
              value={formData.contributor_payment_per_microtask}
              onChange={handleChange}
               placeholder="Enter credits"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.contributor_payment_per_microtask
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.contributor_payment_per_microtask && (
              <p className="text-red-500 text-sm">
                {errors.contributor_payment_per_microtask}
              </p>
            )}
          </div>
          {/* Buttons */}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={updateTaskMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={updateTaskMutation.isPending}
            >
              {updateTaskMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePaymentModal;
