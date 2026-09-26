
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Invitation, InvitationResponse, InvitationTask, AssignAutomaticContributor, AssignTask, AssignTaskContributor, AssignfacilitatorContributor, MicroTask, Instruction, ProjectResponse } from "@/app/types/project";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginationResponse, SinglerResponse, AllResponse, OneResponse } from "@/app/types/global";
import axios from "axios";
interface NewTaskMicroTaskResponse extends PaginationResponse<MicroTask> { }
interface NewProjectProfilesResponse extends SinglerResponse<ProjectResponse> { }
interface InvitationResponseData extends OneResponse<InvitationResponse> { }
interface NewTaskMicroTaskProps {
    microTaskPage: number
    microTaskPageSize: number;
    searchQuery?: string;
    verificationStatus?: string;
    token?: string;
    taskId: string;
}



interface NewProjectrofilesProps {
    id: string
}

export const GenerateInvitationLink = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation(
        {
            mutationFn: async (data: Invitation) => {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }



                const response = await axios.post<InvitationResponseData>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/invitation-link/project/${data.projectId}`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response;
            },
            onSuccess: (data) => {
                toast.success("Success", {
                    description: "Invitation created successfully",
                });
                queryClient.invalidateQueries({ queryKey: ["InvitationList"] });
            },
            onError: (error) => {
                if (axios.isAxiosError(error)) {
                    toast.error("Error", {
                        description:
                            error.response?.data?.message || "Failed to create microtask",
                    });
                }
            },
        }
    );


};
export const GenerateTaskInvitationLink = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation(
        {
            mutationFn: async (data: InvitationTask) => {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }



                const response = await axios.post<InvitationResponseData>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/invitation-link/task/${data.taskId}`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response;
            },
            onSuccess: (data) => {
                toast.success("Success", {
                    description: "Invitation created successfully",
                });
                queryClient.invalidateQueries({ queryKey: ["InvitationList"] });
            },
            onError: (error) => {
                if (axios.isAxiosError(error)) {
                    toast.error("Error", {
                        description:
                            error.response?.data?.message || "Failed to create microtask",
                    });
                }
            },
        }
    );


};
export const GenerateAutomaticAssignXontributortoFacilitator = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation(
        {
            mutationFn: async (data: AssignAutomaticContributor) => {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }



                const response = await axios.post<InvitationResponseData>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/facilitator/${data.taskId}/automatic-assign-contributor-to-facilitator`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response;
            },
            onSuccess: (data) => {
                toast.success("Success", {
                    description: "Assigned  successfully",
                });
                queryClient.invalidateQueries({ queryKey: ["InvitationList"] });
            },
            onError: (error) => {
                if (axios.isAxiosError(error)) {
                    toast.error("Error", {
                        description:
                            error.response?.data?.message || "Failed to create microtask",
                    });
                }
            },
        }
    );


};
export const GenerateInstruction = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation(
        {
            mutationFn: async (InstructionData: Instruction) => {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }



                const { taskId, ...payload } = InstructionData;
                const response = await axios.post<InvitationResponseData>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${taskId}/add-instruction`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response;
            },
            onSuccess: (data) => {
                toast.success("Success", {
                    description: "Instruction created successfully",
                });
                queryClient.invalidateQueries({ queryKey: ["task"] });
            },
            onError: (error) => {
                if (axios.isAxiosError(error)) {
                    toast.error("Error", {
                        description:
                            error.response?.data?.message || "Failed to create microtask",
                    });
                }
            },
        }
    );


};
export const EditInstruction = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation(
        {

            mutationFn: async (InstructionData: Instruction) => {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }



                const { taskId, ...payload } = InstructionData;
                const response = await axios.put<InvitationResponseData>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${taskId}/instruction`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response;
            },
            onSuccess: (data) => {
                toast.success("Success", {
                    description: "Instruction Update successfully",
                });
                queryClient.invalidateQueries({ queryKey: ["task"] });
            },
            onError: (error) => {
                if (axios.isAxiosError(error)) {
                    toast.error("Error", {
                        description:
                            error.response?.data?.message || "Failed to create microtask",
                    });
                }
            },
        }
    );


};
export const DeleteInstruction = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: async (taskId: string) => {
            if (!session?.access_token) {
                throw new Error("No authentication token available");
            }

            return axios.delete(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${taskId}/instruction`,
                {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                }
            );
        },
        onSuccess: () => {
            toast.success("Success", {
                description: "Instruction deleted successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["task"] });
        },
        onError: (error) => {
            if (axios.isAxiosError(error)) {
                toast.error("Error", {
                    description:
                        error.response?.data?.message || "Failed to delete instruction",
                });
            }
        },
    });
};
export function MyProjectProfilesDetail({
    id
}: NewProjectrofilesProps) {
    const res1 = useSession();
    const { data: session } = useSession();

    return useQuery<NewProjectProfilesResponse>({
        queryKey: ["MyprojectDetail", id],
        queryFn: async () => {


            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const params = new URLSearchParams({});

                const baseUrl =
                    process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await axios.get<NewProjectProfilesResponse>(
                    `${baseUrl}/project-mgmt/project/${id}`,

                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );


                return response.data as NewProjectProfilesResponse;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch project profiles";
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

export function useGetTaskLinkList({
    microTaskPage,
    microTaskPageSize,
    searchQuery,
    verificationStatus,
    token,
    taskId
}: NewTaskMicroTaskProps) {
    const { data: session } = useSession();
    return useQuery<NewTaskMicroTaskResponse>({
        queryKey: ["taskLink", microTaskPage, microTaskPageSize, searchQuery, verificationStatus],
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
                    `${baseUrl}/project-mgmt/invitation-link/task/${taskId}?${params.toString()}`,

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
                        error.response?.data?.message || "invitation-link";
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
export const AddTaskUser = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation(
        {
            mutationFn: async (data: AssignTask) => {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const role = data.memberType;
                let usertype = "facilitator";

                if (role) {
                    const normalizedRole = role.toLowerCase();
                    if (normalizedRole === "reviewers") {
                        usertype = "reviewer";
                    } else if (normalizedRole === "contributors") {
                        usertype = "contributor";
                    }
                }
                const response = await axios.post<InvitationResponseData>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${data.taskId}/assign-${usertype}`,
                    { emails: data.emails },
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response;
            },
            onSuccess: (data) => {
                toast.success("Success", {
                    description: "Invitation created successfully",
                });
                queryClient.invalidateQueries({ queryKey: ["users_role_list_filters"] });
                queryClient.invalidateQueries({ queryKey: ["taskUsers"] });
            },
            onError: (error) => {
                if (axios.isAxiosError(error)) {
                    toast.error("Error", {
                        description:
                            error.response?.data?.message || "Failed to create microtask",
                    });
                }
            },
        }
    );


};
export const AddTaskContributor = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation(
        {
            mutationFn: async (data: AssignTaskContributor) => {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }

                const response = await axios.post<InvitationResponseData>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${data.taskId}/assign-contributor`,
                    { contributor_ids: data.contributor_ids },
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response;
            },
            onSuccess: (data) => {
                toast.success("Success", {
                    description: "Invitation created successfully",
                });
                queryClient.invalidateQueries({ queryKey: ["users_role_list_filters"] });
                queryClient.invalidateQueries({ queryKey: ["taskUsers"] });
            },
            onError: (error) => {
                if (axios.isAxiosError(error)) {
                    toast.error("Error", {
                        description:
                            error.response?.data?.message || "Failed to create microtask",
                    });
                }
            },
        }
    );


};
export const AddFacilitatorContributor = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    return useMutation(
        {
            mutationFn: async (data: AssignfacilitatorContributor) => {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }

                const response = await axios.post<InvitationResponseData>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${data.taskId}/assign-contributor-to-facilitator`,
                    {
                        facilitator_id: data.facilitator_id,
                        contributor_ids: data.contributor_ids,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );
                return response;
            },
            onSuccess: (data) => {
                toast.success("Success", {
                    description: "Contributor assigned to facilitator successfully",
                }); queryClient.invalidateQueries({ queryKey: ["taskUsers"] });
            },
            onError: (error) => {
                if (axios.isAxiosError(error)) {
                    toast.error("Error", {
                        description:
                            error.response?.data?.message || "Failed to create microtask",
                    });
                }
            },
        }
    );


};
