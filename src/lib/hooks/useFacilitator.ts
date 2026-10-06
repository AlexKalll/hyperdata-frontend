import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import {
    User,
    UserData,
    MeResponse,
    ResetPassword,
    NewUser,
    PaginationResponse,
    SinglerResponse,
    UpdatePassword,
    UserLog
} from "@/app/types/global";
import { useSession } from "next-auth/react";
interface UserProfilesResponse extends PaginationResponse<User> { }
interface UserProfilesRoleResponse extends PaginationResponse<UserData> { }
interface UserLogResponse extends PaginationResponse<UserLog> { }
interface UserMeResponse extends SinglerResponse<MeResponse> { }

interface UserFacilitatorProps {
    facilitator_id: String; // Use selectedFacilitator's ID
    contributor_ids: String[]; // Correctly uses selectedUsers
    taskId: String;
}
interface UserProfilesProps {
    page: number;
    taskId: string;
    pageSize: number;
    searchQuery?: string;
    verificationStatus?: string;
    token?: string;
}
function useUserProfileFacilitators({
    page,
    taskId,
    pageSize,
    searchQuery,
    verificationStatus,
    token,
}: UserProfilesProps) {
    const res1 = useSession();
    const { data: session } = useSession();

    return useQuery<UserProfilesRoleResponse>({
        queryKey: ["usersAssignedforFacilitotors", taskId, page, pageSize, searchQuery, verificationStatus],
        queryFn: async () => {
            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const params = new URLSearchParams({
                    page: String(page),
                    "limit": String(pageSize),
                    ...(searchQuery && { "search": searchQuery }),
                    ...(verificationStatus && {
                        "verification-status": verificationStatus,
                    }),
                });

                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await axios.get<UserProfilesRoleResponse>(
                    `${baseUrl}/project-mgmt/task/facilitator/my-assigned_contributors/${taskId}?${params.toString()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );

                return response.data as UserProfilesRoleResponse;
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
}

export { useUserProfileFacilitators as userProfileFacilitators };
