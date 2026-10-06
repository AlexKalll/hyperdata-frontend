import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { PaginationResponse, SinglerResponse, AllResponse } from "@/app/types/global";
import {
  Language,
  NewLanguage,
  Basedata,
  BasedataTaskType,
  RegionBasedata,
  DialectBasedata,
  AnnotationBasedata,
  Organization,

} from "@/app/types/basedate";
import { useSession } from "next-auth/react";

interface languageProfilesResponse extends PaginationResponse<Language> { }
interface organizationProfilesResponse
  extends PaginationResponse<Organization> { }
interface DialectfilesResponse extends PaginationResponse<DialectBasedata> { }
interface AnnotationfilesResponse extends PaginationResponse<AnnotationBasedata> { }
interface RegionnofilesResponse extends PaginationResponse<RegionBasedata> { }
interface basedataofilesResponse extends PaginationResponse<Basedata> { }
interface basedataProfilesResponseAll extends AllResponse<Basedata> { }
interface basedataTaskTypeProfilesResponseAll extends AllResponse<BasedataTaskType> { }

interface basedataProfilesALLProps {
  servicename?: string;
}
interface basedatalanguageDialectProps {
  language_id?: string;
}
interface basedataProfilesProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  servicename?: string;
}
interface basedataDeleteProfilesProps {
  service_id: string;
  servicename?: string;
}

type BasedataUpdatePayload = {
  id: string;
  [key: string]: unknown;
};

interface languageProfilesProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
}

export function useLanguage({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
}: languageProfilesProps) {
  const { data: session } = useSession();

  return useQuery<languageProfilesResponse>({
    queryKey: ["language", page, pageSize, searchQuery, verificationStatus],
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

        const response = await axios.get<languageProfilesResponse>(
          `${baseUrl}/setting/language?${params.toString()}`,
          //   `${baseUrl}/user?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as languageProfilesResponse;
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
interface UseBasedataProps {
  servicename: string;
}

interface MutationError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function useBasedataSetting({
  page,
  pageSize,
  searchQuery,
  servicename,
  verificationStatus,
  token,
}: basedataProfilesProps) {
  return useQuery<languageProfilesResponse>({
    queryKey: [
      `${servicename}`,
      page,
      pageSize,
      searchQuery,
      verificationStatus,
    ],
    queryFn: async () => {
      try {
        if (!token) {
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

        const response = await axios.get<languageProfilesResponse>(
          `${baseUrl}/setting/${servicename}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data as languageProfilesResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch User ${servicename}`;
          toast.error("Error", { description: message });
        }
        throw error;
      }
    },
    enabled: !!token, // Only fetch when token is available
    retry: (failureCount, error) => {
      if (error.message === "No authentication token available") return false;
      return failureCount < 2;
    },
  });
}
export function useBasedata({
  page,
  pageSize,
  searchQuery,
  servicename,
  verificationStatus,
}: basedataProfilesProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<languageProfilesResponse>({
    queryKey: [
      `${servicename}`,
      page,
      pageSize,
      searchQuery,
      verificationStatus,
    ],
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

        const response = await axios.get<languageProfilesResponse>(
          `${baseUrl}/setting/${servicename}/paginate?${params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
   
        return response.data as languageProfilesResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch User ${servicename}`;
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
export function useBasedataAll({
  page,
  pageSize,
  searchQuery,
  servicename,
  verificationStatus,
}: basedataProfilesProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<languageProfilesResponse>({
    queryKey: [
      `${servicename}`,
      page,
      pageSize,
      searchQuery,
      verificationStatus,
    ],
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

        const response = await axios.get<languageProfilesResponse>(
          `${baseUrl}/setting/${servicename}?${params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
       
        return response.data as languageProfilesResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch User ${servicename}`;
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
export function useBasedataall({ servicename }: basedataProfilesALLProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<basedataProfilesResponseAll>({
    queryKey: [`${servicename}`],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<basedataProfilesResponseAll>(
          `${baseUrl}/setting/${servicename}/all`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as basedataProfilesResponseAll;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch User ${servicename}`;
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
export function useBasedatadialectLanguage({ language_id }: basedatalanguageDialectProps) {

  const { data: session } = useSession();

  return useQuery<basedataProfilesResponseAll>({
    queryKey: ["dialect", `${language_id}`],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<basedataProfilesResponseAll>(
          `${baseUrl}/setting/dialect/language/${language_id}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as basedataProfilesResponseAll;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch dialect `;
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
export function useBasedataTaskType({ servicename }: basedataProfilesALLProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<basedataTaskTypeProfilesResponseAll>({
    queryKey: [`${servicename}`],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<basedataTaskTypeProfilesResponseAll>(
          `${baseUrl}/project-mgmt/task-type/all`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as basedataTaskTypeProfilesResponseAll;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch User ${servicename}`;
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
export function useBasedataOrganization({
  page,
  pageSize,
  searchQuery,
  servicename,
  verificationStatus,
}: basedataProfilesProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<organizationProfilesResponse>({
    queryKey: [
      `${servicename}`,
      page,
      pageSize,
      searchQuery,
      verificationStatus,
    ],
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

        const response = await axios.get<organizationProfilesResponse>(
          `${baseUrl}/setting/${servicename}?${params.toString()}`,
          //   `${baseUrl}/user?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as organizationProfilesResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch User ${servicename}`;
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
export function useBasedataRegion({
  page,
  pageSize,
  searchQuery,
  servicename,
  verificationStatus,
}: basedataProfilesProps) {
  const res = useSession();
  const { data: session } = useSession();

  return useQuery<RegionnofilesResponse>({
    queryKey: [
      `${servicename}`,
      page,
      pageSize,
      searchQuery,
      verificationStatus,
    ],
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

        const response = await axios.get<RegionnofilesResponse>(
          `${baseUrl}/setting/${servicename}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as RegionnofilesResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch User ${servicename}`;
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
export function useBasedataDialect({
  page,
  pageSize,
  searchQuery,
  servicename,
  verificationStatus,
}: basedataProfilesProps) {
  const res = useSession();
  const { data: session } = useSession();

  return useQuery<DialectfilesResponse>({
    queryKey: [
      `${servicename}`,
      page,
      pageSize,
      searchQuery,
      verificationStatus,
    ],
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

        const response = await axios.get<DialectfilesResponse>(
          `${baseUrl}/setting/${servicename}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as DialectfilesResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch User ${servicename}`;
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
export function useBasedataAnnotation({
  page,
  pageSize,
  searchQuery,
  servicename,
  verificationStatus,
}: basedataProfilesProps) {
  const res = useSession();
  const { data: session } = useSession();

  return useQuery<AnnotationfilesResponse>({
    queryKey: [
      `${servicename}`,
      page,
      pageSize,
      searchQuery,
      verificationStatus,
    ],
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

        const response = await axios.get<AnnotationfilesResponse>(
          `${baseUrl}/setting/${servicename}/paginate?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as AnnotationfilesResponse;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch User ${servicename}`;
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
export const usePutBasedata = (
  servicename: UseBasedataProps["servicename"]
) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation<Basedata, MutationError, BasedataUpdatePayload>({
    mutationFn: async (responseData: BasedataUpdatePayload) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const { id, ...payload } = responseData;

      const response = await axios.put<Basedata>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/${servicename}/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      queryClient.invalidateQueries({ queryKey: [`${servicename}`] });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "basedata updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`${servicename}`] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description:
            error.response?.data?.message || "Failed to update basedata",
        });
      }
    },
  });
};
export const useAddBasedata = (
  servicename: UseBasedataProps["servicename"]
) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (ResponseData: Record<string, unknown>) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post<Basedata>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/${servicename}`,
        ResponseData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: `${servicename} created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [`${servicename}`] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description:
            error.response?.data?.message || `Failed to create ${servicename}`,
        });
      }
    },
  });
};
export const useAddBasedataOrganization = (
  servicename: UseBasedataProps["servicename"]
) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (ResponseData: Omit<Organization, "id">) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post<Organization>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/${servicename}`,
        ResponseData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: `${servicename} created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [`${servicename}`] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description:
            error.response?.data?.message || `Failed to create ${servicename}`,
        });
      }
    },
  });
};
export const usePutDynamicBasedata = (
  servicename: UseBasedataProps["servicename"]
) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (ResponseData: BasedataUpdatePayload) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const { id, ...payload } = ResponseData;

      const response = await axios.put<Basedata>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/${servicename}/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      queryClient.invalidateQueries({ queryKey: [`${servicename}`] });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: `${servicename} updated successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [`${servicename}`] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description:
            error.response?.data?.message || `Failed to create ${servicename}`,
        });
      }
    },
  });
};

export const usePutOrganiztionBasedata = (
  servicename: UseBasedataProps["servicename"]
) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (ResponseData: Organization) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const { id, ...payload } = ResponseData;

      const response = await axios.put<Organization>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/${servicename}/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      queryClient.invalidateQueries({ queryKey: [`${servicename}`] });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: `${servicename} updated successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [`${servicename}`] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description:
            error.response?.data?.message || `Failed to create ${servicename}`,
        });
      }
    },
  });
};

export const useDeleteBasedataSetting = ({
  servicename,
  service_id,
}: basedataDeleteProfilesProps) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      const response = await axios.delete(
        `${baseUrl}/setting/${servicename}/${service_id}`,
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
        description: `${servicename} deleted successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [`${servicename}`] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description:
            error.response?.data?.message || `Failed to delete ${servicename}`,
        });
      }
    },
  });
};
