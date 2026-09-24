// useMicroTaskMutations.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { Task, MicroTask, InvitationLinkResponse, ReviewerDatset } from "@/app/types/project";
import { PaginationResponse } from "@/app/types/global";
import { useSession } from "next-auth/react";

interface NewTaskMicroTaskResponse extends PaginationResponse<MicroTask> { }
interface DatasetMicroTaskResponse extends PaginationResponse<ReviewerDatset> { }
interface NewTaskMicroTaskProps {
  microTaskPage: number
  microTaskPageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  taskId: string;
}
interface NewTaskMicroTaskFliterProps {
  microTaskPage: number
  microTaskPageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  filters: { [key: string]: string | boolean };
  taskId: string;
}
interface NewTaskMicroTaskDataSetProps {
  page: number
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  micro_task_id: string;
}
interface NewTaskMicroTaskDataFacilitatorSetProps {
  page: number
  contributor_id: string;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  task_id: string;
}
interface UseMicroTaskMutationProps {
  taskId: string;
}
interface ExportUser {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  contribution_count: string;
}

// Define the API response structure
interface ExportUserTaskResponse {
  message: string;
  code: number;
  data: ExportUser[];
}

// Input type for the mutation
interface ExportUserTaskInput {
  status: "Active";
  limit: number;
  minNumberOfAcceptedDataSets: number;
  sourceTaskId: string;
}
interface UseMicroUSerTaskMutationProps {
  status: "Active",
  limit: number,
  minNumberOfAcceptedDataSets: number,
  sourceTaskId: string,
  datasetStatus: string,
}
interface UseMicroTasktoTAskMutationProps {
  taskId: string;

}
interface tasktoTask {
  source_task_id: string;
  from_micro_task: boolean;
  from_data_set: boolean;
  limit: number|null;
}

interface SingleMicroTaskData {
  instruction: string;
  text: string;
  taskId: string;
  is_test: boolean;

}
interface InvitationProfilesProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  task_id: string
}
interface InvitationProfilesFilterProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  task_id: string;
  filters: { [key: string]: string | boolean };
}
interface CsvUploadData {
  file: File;
}
interface AudioUploadData {
  file: File;
  is_test: boolean;
  instruction: string;
}
interface InvitationProfilesRoleResponse extends PaginationResponse<InvitationLinkResponse> { }
interface ImportTaskData {
  source_task_id: string;
  from_micro_task: boolean;
  from_data_set: boolean;
  targetTaskId: string;
  limit: number|null;
}

export function useGetTaskMicroTaskDetail({
  microTaskPage,
  microTaskPageSize,
  searchQuery,
  verificationStatus,
  token,
  taskId
}: NewTaskMicroTaskProps) {
  const { data: session } = useSession();
  return useQuery<NewTaskMicroTaskResponse>({
    queryKey: ["taskMicroTasks", taskId, microTaskPage, microTaskPageSize, searchQuery, verificationStatus],
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
          `${baseUrl}/workspace/micro-task/task/${taskId}?${params.toString()}`,

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
export function useGetTaskMicroTaskDetailFilter({
  microTaskPage,
  microTaskPageSize,
  searchQuery,
  verificationStatus,
  filters,
  taskId,
}: NewTaskMicroTaskFliterProps) {
  const { data: session } = useSession();
  return useQuery<NewTaskMicroTaskResponse>({
    queryKey: [
      "taskMicroTasks",
      taskId,
      microTaskPage,
      microTaskPageSize,
      searchQuery,
      verificationStatus,
      filters,
    ],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(microTaskPage),
          limit: String(microTaskPageSize),
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

        const response = await axios.get<NewTaskMicroTaskResponse>(
          `${baseUrl}/workspace/micro-task/task/${taskId}?${params.toString()}`,
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
export function useGetMicroTaskDataSetDetail({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  micro_task_id
}: NewTaskMicroTaskDataSetProps) {
  const { data: session } = useSession();
  return useQuery<DatasetMicroTaskResponse>({
    queryKey: ["taskMicroTasks", micro_task_id, page, pageSize, searchQuery, verificationStatus],
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

        const response = await axios.get<DatasetMicroTaskResponse>(
          `${baseUrl}/workspace/data-set/micro_task/${micro_task_id}?${params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as DatasetMicroTaskResponse;
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
export const useAddSingleMicroTask = ({
  taskId,
}: UseMicroTaskMutationProps) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation<MicroTask, Error, SingleMicroTaskData>(
    {
      mutationFn: async (microTaskData) => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        console.log("MicroTask Data:", microTaskData);
        const data = { text: microTaskData.text, instruction: microTaskData.instruction, task_id: taskId, is_test: microTaskData.is_test };


        const response = await axios.post<MicroTask>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/micro-task`,
          data,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
              "accept": "*/*"
            },
          }
        );
       

        return response.data;
      },
      onSuccess: (data) => {
        toast.success("Success", {
          description: "Microtask created successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["taskMicroTasks"] });
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
export const useAddUserSingleMicroTask = (
) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation(
    {
      mutationFn: async (inputdata: Omit<{
        status: string,
        limit: number,
        minNumberOfAcceptedDataSets: number,
        sourceTaskId: string,
        datasetStatus: string,
        assignedTo: string
      }, "id">) => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }

        const data = { sourceTaskId: inputdata.assignedTo, status: inputdata.status, datasetStatus: inputdata.datasetStatus, limit: inputdata.limit, minNumberOfAcceptedDataSets: inputdata.minNumberOfAcceptedDataSets };


        const response = await axios.post<MicroTask>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${inputdata.sourceTaskId}/import-contributor-from-other-task`,
          data,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
              "accept": "*/*"
            },
          }
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success("Success", {
          description: "Users assigned successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["taskMicroTasks"] });
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
export const useExportUserTask = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation<ExportUserTaskResponse, AxiosError, ExportUserTaskInput>({
    mutationFn: async (inputdata: ExportUserTaskInput) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const data = {
        status: inputdata.status,
        limit: inputdata.limit,
        minNumberOfAcceptedDataSets: inputdata.minNumberOfAcceptedDataSets,
      };

      const response = await axios.post<ExportUserTaskResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${inputdata.sourceTaskId}/export-contributor`,
        data,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );
      return response.data;
    },
  
 
  });
};
export const useAddMicroTasksFromCsv = ({
  taskId,
}: UseMicroTaskMutationProps) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation<NewTaskMicroTaskResponse, Error, CsvUploadData>(
    {
      mutationFn: async (uploadData) => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }

        const formData = new FormData();
        formData.append("file", uploadData.file);

        const response = await axios.post<NewTaskMicroTaskResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/micro-task/${taskId}/import_csv`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success("Success", {
          description: `Imported  microtasks successfully`,
        });
        queryClient.invalidateQueries({ queryKey: ["taskMicroTasks"] });
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error("Error", {
            description:
              error.response?.data?.message || "Failed to import microtasks",
          });
        }
      },
    }
  );
};
export const useAddMicroTasksFromAudio = ({
  taskId,
}: UseMicroTaskMutationProps) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation<NewTaskMicroTaskResponse, Error, AudioUploadData>(
    {
      mutationFn: async (AudioUploadData) => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }

        const formData = new FormData();
        formData.append("file", AudioUploadData.file);
        formData.append("is_test", String(AudioUploadData.is_test));
        formData.append("instruction", String(AudioUploadData.instruction));

        const response = await axios.post<NewTaskMicroTaskResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/micro-task/${taskId}/audio`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success("Success", {
          description: `Created  microtasks successfully`,
        });
        queryClient.invalidateQueries({ queryKey: ["taskMicroTasks"] });
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error("Error", {
            description:
              error.response?.data?.message || "Failed to import microtasks",
          });
        }
      },
    }
  );
};

export const useImportMicroTasksFromTask = ({
  taskId,
}: UseMicroTasktoTAskMutationProps) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation<NewTaskMicroTaskResponse, Error, ImportTaskData>(
    {
      mutationFn: async (importData: tasktoTask) => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }

        const response = await axios.post<NewTaskMicroTaskResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/micro-task/${importData.source_task_id}/import_from_other_task`,
          {
            source_task_id: taskId,
            from_micro_task: importData.from_micro_task,
            from_data_set: importData.from_data_set,
            limit: importData.limit,

          },
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );
        return response.data;
      },
      onSuccess: (data) => {
        toast.success("Success", {
          description: `Imported Microtasks successfully`,
        });
        queryClient.invalidateQueries({ queryKey: ["taskMicroTasks"] });
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error("Error", {
            description:
              error.response?.data?.message || "Failed to import microtasks",
          });
        }
      },
    }
  );
};

export function useInvitation({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  task_id,
  token,
}: InvitationProfilesProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<InvitationProfilesRoleResponse>({
    queryKey: ["InvitationList", page, pageSize, searchQuery, verificationStatus],
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

        const response = await axios.get<InvitationProfilesRoleResponse>(
          `${baseUrl}/project-mgmt/invitation-link/task/${task_id}/?${params.toString()}`,
          //   `${baseUrl}/user?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as InvitationProfilesRoleResponse;
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
export function useGetTaskTaskDatasetDetail({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  task_id,
  token,
}: InvitationProfilesProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<DatasetMicroTaskResponse>({
    queryKey: ["DatasetList", task_id, page, pageSize, searchQuery, verificationStatus],
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

        const response = await axios.get<DatasetMicroTaskResponse>(
          `${baseUrl}/workspace/data-set/task/${task_id}/?${params.toString()}`,
          //   `${baseUrl}/user?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as DatasetMicroTaskResponse;
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
export function useGetTaskTaskDatasetDetailFilter({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  task_id,
  token,
  filters,
}: InvitationProfilesFilterProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<DatasetMicroTaskResponse>({
    queryKey: ["DatasetList",filters, task_id, page, pageSize, searchQuery, verificationStatus],
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

        const response = await axios.get<DatasetMicroTaskResponse>(
          `${baseUrl}/workspace/data-set/task/${task_id}/?${params.toString()}`,
          //   `${baseUrl}/user?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as DatasetMicroTaskResponse;
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
export function useGetMicroTaskDataSetFacilitatorDetail({
  page,
  pageSize,
  searchQuery,
  contributor_id,
  verificationStatus,
  task_id
}: NewTaskMicroTaskDataFacilitatorSetProps) {
  const { data: session } = useSession();
  return useQuery<DatasetMicroTaskResponse>({
    queryKey: ["taskMicroTasks", task_id, contributor_id, page, pageSize, searchQuery, verificationStatus],
    queryFn: async () => {


      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
          contributor_id,
        });

        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<DatasetMicroTaskResponse>(
          `${baseUrl}/workspace/data-set/facilitator/contributor/submissions/${task_id}?${params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as DatasetMicroTaskResponse;
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
export function useGetMicroTaskDataSetProjectMangerDetail({
  page,
  pageSize,
  searchQuery,
  contributor_id,
  verificationStatus,
  task_id
}: NewTaskMicroTaskDataFacilitatorSetProps) {
  const { data: session } = useSession();
  return useQuery<DatasetMicroTaskResponse>({
    queryKey: ["taskMicroTasks", task_id, contributor_id, page, pageSize, searchQuery, verificationStatus],
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

        const response = await axios.get<DatasetMicroTaskResponse>(
          `${baseUrl}/workspace/data-set/task/${task_id}?${params.toString()}&contributor_id=${contributor_id}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as DatasetMicroTaskResponse;
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
