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
  UserLog,
  UserTask
} from "@/app/types/global";
import {

  ReviewerDatset,

} from "@/app/types/project";
import { useSession } from "next-auth/react";
import { use } from "react";


interface UserProfilesResponse extends PaginationResponse<User> { }
interface UserProfilesRoleResponse extends PaginationResponse<UserData> { }
interface UserforFaciltatorRoleResponse extends PaginationResponse<UserTask> { }
interface UserLogResponse extends PaginationResponse<UserLog> { }
interface FacilltatorContributorsSummtionResponse extends PaginationResponse<ReviewerDatset> { }
interface UserMeResponse extends SinglerResponse<MeResponse> { }
interface RemoveFacilitatorContributorPayload {
  contributor_ids: string[];
  task_id: string;
  facilitator_id?: string;
}
interface UserProfilesProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
}
interface UserProfilesPropsSingle {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  selectedRoleId?: string;
}
interface UserProfilesPropsSingleFiliter {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  selectedRoleId?: string;
  filters: { [key: string]: string | boolean },
}
interface FacilltatorrProfilesRoleProps {
  page: number;
  taskID?: string;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  role?: string;
}
interface FacilltatorrProfilesRolePropsfilters {
  page: number;
  taskID?: string;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  role?: string;
  filters: { [key: string]: string | boolean };

}
interface ShowFacilitatorProfilesRolePropsfilters {
  page: number;
  user_id?: string;
  taskID?: string;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  role?: string;
  filters: { [key: string]: string | boolean };
}
interface UserProfilesRoleProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  role?: string;
}
interface UserProfilesRolePropsFilter {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  role?: string;
  filters: { [key: string]: string | boolean };
}
interface UserProfilesRolePropsFilterUnassigned {
  page: number;
  taskId: string;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  role?: string;
  filters: { [key: string]: string | boolean };
}
interface UserProfilesLogProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
}
interface SingleUserResponse extends SinglerResponse<User> { }

export function useAuthToken() {
  return useQuery({
    queryKey: ["authToken"],
    queryFn: async () => {
      const response = await fetch("/api/getAuthToken");
      if (!response.ok) throw new Error("Failed to fetch token");
      const data = await response.json();
      return data.token;
    },
    retry: 2,
  });
}
function useUserProfilesAll({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  token,
}: UserProfilesProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<UserProfilesRoleResponse>({
    queryKey: ["users", page, pageSize, searchQuery, verificationStatus],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(page),
          "page-size": String(pageSize),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && {
            "verification-status": verificationStatus,
          }),
        });

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<UserProfilesRoleResponse>(
          `${baseUrl}/iam/users/all`,
          //   `${baseUrl}/user?${params.toString()}`,
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

function useUserProfiles({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  token,
  selectedRoleId
}: UserProfilesPropsSingle) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<UserProfilesRoleResponse>({
    queryKey: ["usersList", selectedRoleId, page, pageSize, searchQuery, verificationStatus],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          limit: String(pageSize),
          "page": String(page),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && {
            "verification-status": verificationStatus,
          }),
        });

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<UserProfilesRoleResponse>(
          `${baseUrl}/iam/users?${selectedRoleId && `role_id=${selectedRoleId}&`}${params.toString()}`,
          //   `${baseUrl}/user?${params.toString()}`,
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
function useUserProfilesFilter({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  token,
  selectedRoleId,
  filters
}: UserProfilesPropsSingleFiliter) {
  const res1 = useSession();
  const { data: session } = useSession();


  return useQuery<UserProfilesRoleResponse>({
    queryKey: ["usersList", selectedRoleId, page, filters, pageSize, searchQuery, verificationStatus],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && { "verification-status": verificationStatus }),
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== "") {
              acc[key] = value.toString();
            }
            return acc;
          }, {} as Record<string, string>),
        });

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const checkrole = (selectedRoleId && selectedRoleId !== "all") ? `role_id=${selectedRoleId}&` : "";
        const fullUrl = `${baseUrl}/iam/users?${checkrole}${params.toString()}`;

        const response = await axios.get<UserProfilesRoleResponse>(
          fullUrl,
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
function useUserRoleProfiles({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  role,

}: UserProfilesRoleProps) {
  const res1 = useSession();
  const { data: session } = useSession();
  let usertype = "facilitator";
  // 
  if (role) {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === "reviewers") {
      usertype = "reviewer";
    } else if (normalizedRole === "contributors") {
      usertype = "contributor";
    }
    else if (normalizedRole === "project_manager") {
      usertype = "project-manager";
    }
  }
  return useQuery<UserProfilesRoleResponse>({
    queryKey: ["users_role_list", role, page, pageSize, searchQuery, verificationStatus],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          limit: String(pageSize),
          "page": String(page),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && {
            "verification-status": verificationStatus,
          }),
        });

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<UserProfilesRoleResponse>(
          `${baseUrl}/iam/users/${usertype}?${params.toString()}`,
          //   `${baseUrl}/user?${params.toString()}`,
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
function useUserRoleProfilesFilter({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  role,
  filters

}: UserProfilesRolePropsFilter) {
  const res1 = useSession();
  const { data: session } = useSession();
  let usertype = "facilitator";

  if (role) {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === "reviewers") {
      usertype = "reviewer";
    } else if (normalizedRole === "contributors") {
      usertype = "contributor";
    }
  }
  return useQuery<UserProfilesRoleResponse>({
    queryKey: ["users_role_list_filters", filters, role, page, pageSize, searchQuery, verificationStatus],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && { "verification-status": verificationStatus }),
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== "") {
              acc[key] = value.toString();
            }
            return acc;
          }, {} as Record<string, string>),
        });

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<UserProfilesRoleResponse>(
          `${baseUrl}/iam/users/${usertype}?${params.toString()}`,
          //   `${baseUrl}/user?${params.toString()}`,
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
function useUserRoleProfilesFilterUnassigned({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  role,
  taskId,
  filters

}: UserProfilesRolePropsFilterUnassigned) {
  const res1 = useSession();
  const { data: session } = useSession();
  let usertype = "facilitator";

  if (role) {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === "reviewers") {
      usertype = "reviewer";
    } else if (normalizedRole === "contributors") {
      usertype = "contributor";
    }
  }
  const buildParams = () => {

  

    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(pageSize));

    if (searchQuery) params.append('search', searchQuery);
    if (verificationStatus) params.append('verification-status', verificationStatus);

    // === FILTERS: SKIP `role` key entirely ===
    Object.entries(filters).forEach(([k, v]) => {
      if (k === 'role') {
     
        return;
      }
      if (v == null) return;
      const s = String(v).trim();
      if (s && !['null', 'undefined'].includes(s)) {
       
        params.append(k, s);
      }
    });

    // === ADD role manually ONLY if not contributor ===
    const isContributor =
      usertype === 'contributor' ||
      (role && ['contributor', 'contributors'].includes(role.toLowerCase()));

 

    if (!isContributor && role) {

      params.append('role', role);
    } else if (isContributor) {

    }


    return params;
  };
  return useQuery<UserProfilesRoleResponse>({
    queryKey: [
      'users_role_list_filters',
      filters,
      role,
      page,
      taskId,
      pageSize,
      searchQuery,
      verificationStatus,
    ],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      const params = buildParams();
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

      const endpoint =
        usertype === 'contributor'
          ? `${baseUrl}/project-mgmt/task/${taskId}/get-contributors-by-task-requirement`
          : `${baseUrl}/project-mgmt/task/${taskId}/unassigned-users`;

      const response = await axios.get<UserProfilesRoleResponse>(
        `${endpoint}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      return response.data;
    },

    enabled: !!session?.access_token,
    retry: (failureCount, error: any) => {
      if (error?.message === 'No authentication token available') return false;
      return failureCount < 2;
    },

  });
}
export function useSingleUserProfile(id: string) {
  const { data: session } = useSession();
  return useQuery<SingleUserResponse>({
    queryKey: ["user", id],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await axios.get<SingleUserResponse>(
          `${baseUrl}/iam/user/${id}`,
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
            error.response?.data?.message || "Failed to fetch User profile";
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

export function useChangePassword() {
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (passwordData: UpdatePassword) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await axios.put(
        `${baseUrl}/iam/users/change-password?uuid=15bc2137-0b08-449e-8e7e-c68f2e830bd5`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (response.status == 200) {
        toast.success("Success", {
          description: "Password changed successfully",
        });
        setTimeout(() => {
          signOut();
        }, 1000);
      }
      return response.data;
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description:
            error.response?.data?.message || "Failed to change password",
        });
      }
    },
  });
}
export function useChangeimage() {
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (passwordData: UpdatePassword) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await axios.post(
        `${baseUrl}/iam/users/change-password?id=""`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Password changed successfully",
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description:
            error.response?.data?.message || "Failed to change password",
        });
      }
    },
  });
}
export const useAddUser = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (userData: Omit<NewUser, "id">) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post<User>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/users`,
        userData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "User created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["usersList"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data?.message || "Failed to create user",
        });
      }
    },
  });
};
export const usePutUser = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (userData: User) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }
          var sendedData ={
   
        role_id: userData.role_id
      }

      const response = await axios.put<User>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/users/${userData.id}`,
        sendedData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["usersList"] });
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
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (userData: { email: string }) => {
      const response = await axios.post<ResetPassword>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/auth/forgot-password`,
        userData
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Code sent to your email",
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data?.message || "Failed to send code",
        });
      }
    },
  });
};
export const useMeUser = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (userData: User) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.put<User>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/users/me`,
        userData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      if (response.status == 200) {
        toast.success("Success", {
          description: "User updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["usersList"] });
      }
      if (response.status !== 200) {
        throw new Error("Failed to update user");
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["usersList"] });
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
const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (userData: User) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.put<User>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/users/activate-toggle/${userData.id}`,
        userData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "User active status changed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["usersList"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description:
            error.response?.data?.message || "Failed to diactiavated user",
        });
      }
    },
  });
};
export const useMeData = (accessToken: string) => {
  return useQuery<UserMeResponse>({
    queryKey: ["Me"],
    queryFn: async () => {
      try {
        if (!accessToken) {
          throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<UserMeResponse>(
          `${baseUrl}/iam/users/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        return response.data as UserMeResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || "Failed to fetch User profiles";
          toast.error("Error", { description: message });
        }
        throw error;
      }
    },
    enabled: !!accessToken,
    retry: (failureCount, error) => {
      if (error.message === "No authentication token available") return false;
      return failureCount < 2;
    },
  });
}


function useUserLogProfiles({
  page,
  pageSize,
  searchQuery,
  verificationStatus,


}: UserProfilesLogProps) {
  const res1 = useSession();
  const { data: session } = useSession();
  let usertype = "facilitator";


  return useQuery<UserLogResponse>({
    queryKey: ["users_log_list", page, pageSize, searchQuery, verificationStatus],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          limit: String(pageSize),
          "page": String(page),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && {
            "verification-status": verificationStatus,
          }),
        });

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<UserLogResponse>(
          `${baseUrl}/activity-logs/my-activity-logs?${params.toString()}`,

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
function useUserFacilltatorContributors({
  page,
  taskID,
  pageSize,
  searchQuery,
  verificationStatus,
  role,

}: FacilltatorrProfilesRoleProps) {
  const res1 = useSession();
  const { data: session } = useSession();
  let usertype = "facilitator";


  return useQuery<UserforFaciltatorRoleResponse>({
    queryKey: ["users_role_list_facilitator", role, page, pageSize, searchQuery, verificationStatus],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          limit: String(pageSize),
          "page": String(page),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && {
            "verification-status": verificationStatus,
          }),
        });

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<UserforFaciltatorRoleResponse>(
          `${baseUrl}/project-mgmt/task/${taskID}/get-contributors-by-task-requirement?${params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        ``
        return response.data as UserforFaciltatorRoleResponse;
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
function useUserFacilltatorContributorsFiltered({
  page,
  taskID,
  pageSize,
  searchQuery,
  verificationStatus,
  role,
  filters,

}: FacilltatorrProfilesRolePropsfilters) {
  const res1 = useSession();
  const { data: session } = useSession();
  let usertype = "facilitator";


  return useQuery<UserforFaciltatorRoleResponse>({
    queryKey: ["users_role_list_facilitator_flitered", filters, role, page, pageSize, searchQuery, verificationStatus, taskID],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && { "verification-status": verificationStatus }),
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== "") {
              acc[key] = value.toString();
            }
            return acc;
          }, {} as Record<string, string>),
        });


        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<UserforFaciltatorRoleResponse>(
          `${baseUrl}/project-mgmt/task/facilitator/unassigned-contributors/${taskID}?${params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        ``
        return response.data as UserforFaciltatorRoleResponse;
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
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 3, // Keep in cache for 3 minutes (renamed from cacheTime)
    refetchOnMount: false, // Don't automatically refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: (failureCount, error) => {
      if (error.message === "No authentication token available") return false;
      return failureCount < 2;
    },
  });
}
function useShowFacilltatorContributorsFiltered({
  page,
  user_id,
  taskID,
  pageSize,
  searchQuery,
  verificationStatus,
  role,
  filters,

}: ShowFacilitatorProfilesRolePropsfilters) {
  const res1 = useSession();
  const { data: session } = useSession();
  let usertype = "facilitator";


  return useQuery<UserforFaciltatorRoleResponse>({
    queryKey: ["show_role_list_facilitator_flitered", filters, role, page, pageSize, searchQuery, verificationStatus, taskID, user_id],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && { "verification-status": verificationStatus }),
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== "") {
              acc[key] = value.toString();
            }
            return acc;
          }, {} as Record<string, string>),
        });


        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<UserforFaciltatorRoleResponse>(
          `${baseUrl}/project-mgmt/task/facilitator/contributors/${taskID}?facilitator_id=${user_id}&${params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        ``
        return response.data as UserforFaciltatorRoleResponse;
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
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes (renamed from cacheTime)
    refetchOnMount: false, // Don't automatically refetch on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: (failureCount, error) => {
      if (error.message === "No authentication token available") return false;
      return failureCount < 2;
    },
  });
}
function useUserFacilltatorContributorSubmissions({
  page,
  taskID,
  pageSize,
  searchQuery,
  verificationStatus,
  role,

}: FacilltatorrProfilesRoleProps) {
  const res1 = useSession();
  const { data: session } = useSession();



  return useQuery<UserProfilesRoleResponse>({
    queryKey: ["users_role_list_facilitator", role, page, pageSize, searchQuery, verificationStatus],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          limit: String(pageSize),
          "page": String(page),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && {
            "verification-status": verificationStatus,
          }),
        });

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<UserProfilesRoleResponse>(
          `${baseUrl}/pworkspace/data-set/facilitator/contributor/submissions/${taskID}/{params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        ``
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

export const RemoveFacilitatorContributor = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  if (!session?.access_token) {
    throw new Error("No authentication token available");
  }
  return useMutation({
    mutationFn: async (payload: RemoveFacilitatorContributorPayload) => {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/facilitator/remove-contributors/${payload.facilitator_id}`,
        {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, },

          data: { contributor_ids: payload.contributor_ids, task_id: payload.task_id },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show_role_list_facilitator_flitered"] });
    },
    onError: (error) => {
      console.error("Remove contributor error:", error);
    },
  });
};

export {
  useShowFacilltatorContributorsFiltered as showFacilltatorContributorsFiltered,
  useDeactivateUser as usedeactivateUser,
  useUserFacilltatorContributorSubmissions as userFacilltatorContributorSubmissions,
  useUserFacilltatorContributors as userFacilltatorContributors,
  useUserFacilltatorContributorsFiltered as userFacilltatorContributorsFiltered,
  useUserLogProfiles as userLogProfiles,
  useUserProfiles as userProfiles,
  useUserProfilesAll as userProfilesall,
  useUserProfilesFilter as userProfilesFilter,
  useUserRoleProfiles as userRoleProfiles,
  useUserRoleProfilesFilter as userRoleProfilesFilter,
  useUserRoleProfilesFilterUnassigned as userRoleProfilesFilterUnassigned,
};
