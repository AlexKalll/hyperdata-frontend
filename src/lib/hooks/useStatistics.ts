import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { StatisticsData_sets, StatisticsSuperadmin, StatisticsProject, SuperAdminDatasetLanguage } from "@/app/types/statistics";
import { PaginationResponse, SinglerResponse, AllResponse, UserLog } from "@/app/types/global";
import { useSession } from "next-auth/react";

interface SingleStatisticsData_sets extends SinglerResponse<StatisticsData_sets> { }
interface UserLogResponse extends PaginationResponse<UserLog> { }
interface SingleStatisticsSuperadmin extends SinglerResponse<StatisticsSuperadmin> { }
interface SingleStatisticsProject extends SinglerResponse<StatisticsProject> { }
interface SingleSuperAdminDatasetLanguage extends SinglerResponse<SuperAdminDatasetLanguage> { }

export function useSingleprojecStatisticsData_sets(view_type: string) {
    const { data: session } = useSession();
    return useQuery<SingleStatisticsData_sets>({
        queryKey: ["SingleStatisticsData_sets", view_type],
        queryFn: async () => {
            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const response = await axios.get<SingleStatisticsData_sets>(
                    `${baseUrl}/statistics/superadmin/dataset-contribution?view_type=${view_type}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response.data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch dataset statistics";
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token,
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
}

export function useSingleprojecStatisticsSuperadmins() {
    const { data: session } = useSession();
    return useQuery<SingleStatisticsSuperadmin>({
        queryKey: ["SingleStatisticsSuperadmin"],
        queryFn: async () => {
            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const response = await axios.get<SingleStatisticsSuperadmin>(
                    `${baseUrl}/statistics/superadmin/`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response.data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch superadmin statistics";
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token,
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
}

export function useSingleprojecStatisticsProject(project_id: string) {
    const { data: session } = useSession();
    return useQuery<SingleStatisticsProject>({
        queryKey: ["SingleStatisticsProject", project_id],
        queryFn: async () => {
            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const response = await axios.get<SingleStatisticsProject>(
                    `${baseUrl}/statistics/project/project?project_id=${project_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response.data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch project statistics";
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token,
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
}

export function useSingleUserlog(user_id: string, page: number, pageSize: number, searchQuery: string, verificationStatus: string) {
    const { data: session } = useSession();
    return useQuery<UserLogResponse>({
        queryKey: ["UserLogResponseUserId", user_id, page, pageSize, searchQuery, verificationStatus],
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
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const response = await axios.get<UserLogResponse>(
                    `${baseUrl}/activity-logs/${user_id}?${params.toString()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response.data as UserLogResponse;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch user logs";
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token && !!user_id,
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
}

export function useSingleProjectManagerStatisticsData_sets(view_type: string, project_id: string) {
    const { data: session } = useSession();
    return useQuery<SingleStatisticsData_sets>({
        queryKey: ["SingleStatisticsData_sets", view_type, project_id],
        queryFn: async () => {
            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const url = project_id 
                    ? `${baseUrl}/statistics/project/project-dataset?project_id=${project_id}&view_type=${view_type}` 
                    : `${baseUrl}/statistics/project/project-dataset?view_type=${view_type}`;
                const response = await axios.get<SingleStatisticsData_sets>(url, {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });
                return response.data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch project dataset statistics";
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token,
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
}

export function useSingleSuperAdminDatasetLanguage(view_type: string) {
    const { data: session } = useSession();
    return useQuery<SingleSuperAdminDatasetLanguage>({
        queryKey: ["SingleSuperAdminDatasetLanguage", view_type],
        queryFn: async () => {
            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const response = await axios.get<SingleSuperAdminDatasetLanguage>(
                    `${baseUrl}/statistics/superadmin/dataset-language?view_type=${view_type}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response.data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch dataset language statistics";
                    toast.error("Error", { description: message });
                }
                throw error;
            }
        },
        enabled: !!session?.access_token,
        retry: (failureCount, error) => {
            if (error.message === "No authentication token available") return false;
            return failureCount < 2;
        },
    });
}
