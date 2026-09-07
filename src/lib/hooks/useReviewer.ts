import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { NewProject, TaskCardType, RejectType, ReviewerDatset, NewTask, MicroTask, UpdateProject, Project, ProjectDetail, ProjectResponse, TaskResponse } from "@/app/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationResponse, SinglerResponse, AllResponse, OneResponse } from "@/app/types/global";
interface NewTaskMicroTaskResponse extends PaginationResponse<ReviewerDatset> { }
interface NewProjectTaskResponse extends PaginationResponse<TaskCardType> { }
interface RejectTypeALLResponse extends AllResponse<RejectType> { }
interface NewProjectrofileTaskProps {
    page: number
    pageSize: number;
    searchQuery?: string;
    verificationStatus?: string;
    token?: string;

}
interface FlagPayload {
    microTaskId: string;
    flag_type_id: string;
    comment: string
}
interface NewTaskMicroTaskProps {
    microTaskPage: number
    microTaskPageSize: number;
    searchQuery?: string;
    verificationStatus?: string;
    token?: string;
    taskId: string;
}
interface NewTaskMicroTasStatuskProps {
    microTaskPage: number
    microTaskPageSize: number;
    searchQuery?: string;
    verificationStatus?: string;
    token?: string;
    taskId: string;
    status: string;
}
export function useGetProjectTask({
    page,
    pageSize,
    searchQuery,
    verificationStatus,
}: NewProjectrofileTaskProps) {
    const { data: session } = useSession();
    return useQuery<NewProjectTaskResponse>({
        queryKey: ["reviewer_tasks", page, pageSize, searchQuery, verificationStatus],
        queryFn: async () => {


            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const params = new URLSearchParams({
                    page: String(page),
                    "limit": String(pageSize),
                    ...(searchQuery && { "search": searchQuery }),
                    ...(verificationStatus && { "verification-status": verificationStatus }),
                });

                const baseUrl =
                    process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await axios.get<NewProjectTaskResponse>(
                    `${baseUrl}/project-mgmt/task/reviewer_tasks?${params.toString()}`,

                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );


                return response.data as NewProjectTaskResponse;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to task";
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token, // Only fetch when token is available
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
};
export function useGetProjectTaskFacilitator({
    page,
    pageSize,
    searchQuery,
    verificationStatus,
}: NewProjectrofileTaskProps) {
    const { data: session } = useSession();
    return useQuery<NewProjectTaskResponse>({
        queryKey: ["reviewer_tasks", page, pageSize, searchQuery, verificationStatus],
        queryFn: async () => {


            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const params = new URLSearchParams({
                    page: String(page),
                    "limit": String(pageSize),
                    ...(searchQuery && { "search": searchQuery }),
                    ...(verificationStatus && { "verification-status": verificationStatus }),
                });

                const baseUrl =
                    process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await axios.get<NewProjectTaskResponse>(
                    `${baseUrl}/project-mgmt/task/facilitator_tasks?${params.toString()}`,

                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );


                return response.data as NewProjectTaskResponse;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to task";
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token, // Only fetch when token is available
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
};
export function useGetTaskMicroTaskResponseForReviewers({
    microTaskPage,
    microTaskPageSize,
    searchQuery,
    verificationStatus,
    token,
    status,
    taskId
}: NewTaskMicroTasStatuskProps) {
    const { data: session } = useSession();
    return useQuery<NewTaskMicroTaskResponse>({
        queryKey: ["taskMicroTasksResultReviewers", taskId, status, microTaskPage, microTaskPageSize, searchQuery, verificationStatus],
        queryFn: async () => {


            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const params = new URLSearchParams({
                    page: String(microTaskPage),
                    "limit": String(microTaskPageSize),
                    ...(searchQuery && { "search": searchQuery }),
                    ...(verificationStatus && { "verification-status": verificationStatus }),
                });

                const baseUrl =
                    process.env.NEXT_PUBLIC_API_BASE_URL;
                if (status) {
                    params.append("status", status);
                }
                const response = await axios.get<NewTaskMicroTaskResponse>(
                    `${baseUrl}/workspace/data-set/reviewer/${taskId}?${params.toString()}`,

                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );

                return response.data as NewTaskMicroTaskResponse;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch User profiles";
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token && !!taskId, // Only fetch when token and taskId are available
        staleTime: 0, // Always consider data stale
        refetchOnMount: true, // Refetch when component mounts
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
};
export function useGetTaskMicroTaskResponseForFacilitator({
    microTaskPage,
    microTaskPageSize,
    searchQuery,
    verificationStatus,
    token,
    taskId
}: NewTaskMicroTaskProps) {
    const { data: session } = useSession();
    return useQuery<NewTaskMicroTaskResponse>({
        queryKey: ["taskMicroTasksResulFacilitator", microTaskPage, microTaskPageSize, searchQuery, verificationStatus],
        queryFn: async () => {


            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const params = new URLSearchParams({
                    page: String(microTaskPage),
                    "limit": String(microTaskPageSize),
                    ...(searchQuery && { "search": searchQuery }),
                    ...(verificationStatus && { "verification-status": verificationStatus }),
                });

                const baseUrl =
                    process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await axios.get<NewTaskMicroTaskResponse>(
                    `${baseUrl}/workspace/data-set/reviewer/new-data-sets/${taskId}?${params.toString()}`,

                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );

                return response.data as NewTaskMicroTaskResponse;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch User profiles";
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token, // Only fetch when token is available
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
};

export function useGetTaskMicroTaskResponseForReviewersSubmission({
    microTaskPage,
    microTaskPageSize,
    searchQuery,
    verificationStatus,
    token,
    taskId
}: NewTaskMicroTaskProps) {
    const { data: session } = useSession();
    return useQuery<NewTaskMicroTaskResponse>({
        queryKey: ["taskMicroTasksResultReviewersSubmission", microTaskPage, microTaskPageSize, searchQuery, verificationStatus],
        queryFn: async () => {


            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const params = new URLSearchParams({
                    page: String(microTaskPage),
                    "limit": String(microTaskPageSize),
                    ...(searchQuery && { "search": searchQuery }),
                    ...(verificationStatus && { "verification-status": verificationStatus }),
                });

                const baseUrl =
                    process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await axios.get<NewTaskMicroTaskResponse>(
                    `${baseUrl}/workspace/data-set/reviewer/submissions/${taskId}?${params.toString()}`,

                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );

                return response.data as NewTaskMicroTaskResponse;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch User profiles";
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token, // Only fetch when token is available
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
};
export function useReject() {
    const res1 = useSession();
    const { data: session } = useSession();

    return useQuery<RejectTypeALLResponse>({
        queryKey: [`rejection-type-all`],
        queryFn: async () => {
            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }

                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await axios.get<RejectTypeALLResponse>(
                    `${baseUrl}/setting/rejection-type`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );

                return response.data as RejectTypeALLResponse;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message ||
                        `Failed to fetch rejection-type`;
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token, // Only fetch when token is available
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
}
export const useFlagMicrotask = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (payload: FlagPayload) => {
            const data = {
                flag_type_id: payload.flag_type_id,
                comment: payload.comment,
            };
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/data-set/flag/${payload.microTaskId}`,
                data,
                {
                    headers: { Authorization: `Bearer ${session?.access_token}` },
                }
            );
            queryClient.invalidateQueries({ queryKey: ["taskMicroTasksResultReviewers"] });
            return response.data;
        },
    });
};
export const useApprove = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (userData: { microTaskId: string, annotation_id: string, annotation: string }) => {
            if (!session?.access_token) {
                throw new Error("No authentication token available");
            }


            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/data-set/approve/${userData.microTaskId}`,
                { annotation: userData.annotation },
                {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            toast.success("Success", {
                description: "Approved successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["taskMicroTasksResultReviewers"] });
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                toast.error("Error", {
                    description: error.response?.data?.message || "Failed to update user",
                });
            }
        },
    });
};
export const useRejectionMicrotask = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation({
        mutationFn: async (userData: {
            microTaskId: string,
            comment: string;
            rejection_type_ids: string[];
            flag?:boolean
        }) => {

            let data = {
                comment: userData.comment,
                rejection_type_ids: userData.rejection_type_ids,
                flag: userData.flag
            }
            if (!session?.access_token) {
                throw new Error("No authentication token available");
            }

            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/data-set/reject/${userData.microTaskId}`,
                data,
                {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            toast.success("Success", {
                description: "Rejected successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["taskMicroTasksResultReviewers"] });
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                toast.error("Error", {
                    description: error.response?.data?.message || "Failed to update user",
                });
            }
        },
    });
};
