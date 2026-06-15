
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { NewProject, MicroTaskStatistic, MicroTaskStatisticReviewer, ContributorMicroTaskAssignment, TaskCardType, NewTask, MicroTask, UpdateProject, Project, ProjectDetail, ProjectResponse, TaskResponse, ProjectTask, ContributorStats, UpdateTaskForm, UpdateTask } from "@/app/types/project";
import { User, UserTask, Project_User } from "@/app/types/global";
import { PaginationResponse, SinglerResponse, AllResponse } from "@/app/types/global"
import { useSession } from "next-auth/react";

interface NewProjectProfilesResponse extends PaginationResponse<ProjectResponse> { }

interface ProjectProfilesResponseData extends PaginationResponse<ProjectDetail> { }
interface NewProjectUserResponseData extends PaginationResponse<Project_User> { }
interface NewProjectUserResponse extends PaginationResponse<UserTask> { }
interface NewMicroTaskStatisticPrResponse extends PaginationResponse<MicroTaskStatistic> { }
interface NewMicroTaskStatisticReviewerPrResponse extends PaginationResponse<MicroTaskStatisticReviewer> { }
interface NewMicroTaskStatisticContributoPrResponse extends PaginationResponse<ContributorMicroTaskAssignment> { }

interface NewProjectTaskResponse extends PaginationResponse<TaskCardType> { }
interface NewTaskMicroTaskResponse extends PaginationResponse<MicroTask> { }
interface ProjectTaskaskResponseAll extends AllResponse<ProjectTask> { }

interface NewProjectrofilesProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
}
interface NewProjectrofilesFliterProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  filters: { [key: string]: string | boolean };
  token?: string;
}
interface projectTaskaskALLProps {
  project_id?: string;
}
interface projectTaskaskRealtedProps {
  task_id?: string;
}
interface NewTaskUserProps {
  userPage: number;
  userPageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  taskId: string;
  role?: string;
}
interface NewMicroTaskStatisticProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  taskId: string;
}
interface NewProjectrofilesUserProps {
  userPage: number;
  userPageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  projectId: string;
}
interface NewTaskMicroTaskProps {
  microTaskPage: number
  microTaskPageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  taskId: string;
}
interface NewProjectrofileTaskFliterProps {
  taskPage: number
  taskPageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  projectId: string;
  filters: { [key: string]: string | boolean };
}
interface NewProjectrofileTaskAll {

  projectId: string;

}
interface NewProjectrofileTaskProps {
  taskPage: number
  taskPageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
  token?: string;
  projectId: string;
}
interface SingleProjectResponse extends SinglerResponse<NewProject> {
}

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
function useNewProjectProfiles({
  page,
  pageSize,
  searchQuery,
  verificationStatus,

}: NewProjectrofilesProps) {
  const res1 = useSession();
  const { data: session, status } = useSession();
 
  return useQuery<NewProjectProfilesResponse>({
    queryKey: ["project", page, pageSize, searchQuery, verificationStatus],
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

        const response = await axios.get<NewProjectProfilesResponse>(
          `${baseUrl}/project-mgmt/project?${params.toString()}`,

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
    enabled: status === "authenticated", // Only fetch when token is available
    retry: (failureCount, error) => {
      if (error.message === "No authentication token available") return false;
      if (axios.isAxiosError(error) && error.response?.status === 401) return false; // Don't retry on 401
      return failureCount < 2; // Retry other errors up to 2 times
    },
  });
}
function useNewProjectProfilesArchive({
  page,
  pageSize,
  searchQuery,
  verificationStatus,

}: NewProjectrofilesProps) {
  const res1 = useSession();
  const { data: session, status } = useSession();

  return useQuery<NewProjectProfilesResponse>({
    queryKey: ["project archive", page, pageSize, searchQuery, verificationStatus],
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


        const response = await axios.get<NewProjectProfilesResponse>(
          `${baseUrl}/project-mgmt/project/archived?${params.toString()}`,

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
    enabled: status === "authenticated", // Only fetch when token is available
    retry: (failureCount, error) => {
      if (error.message === "No authentication token available") return false;
      if (axios.isAxiosError(error) && error.response?.status === 401) return false; // Don't retry on 401
      return failureCount < 2; // Retry other errors up to 2 times
    },
  });
}
function useMyProjectProfiles({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  token,
  filters
}: NewProjectrofilesFliterProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<NewProjectProfilesResponse>({
    queryKey: ["Myproject", filters, page, pageSize, searchQuery, verificationStatus],
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


        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<NewProjectProfilesResponse>(
          `${baseUrl}/project-mgmt/project/manager/my-projects?${params.toString()}`,

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

export function useSingleprojectProfile(id: string) {
  const { data: session } = useSession();
  return useQuery<SingleProjectResponse>({
    queryKey: ["Singleproject", id],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await axios.get<SingleProjectResponse>(
          `${baseUrl}/project-mgmt/project/${id}`,
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
            error.response?.data?.message || "Failed to fetch project profile";
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

export const useAddProject = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (projectData: Omit<NewProject, "id">) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const formData = new FormData();
      formData.append("name", projectData.name);
      formData.append("description", projectData.description);
      formData.append("start_date", projectData.start_date);
      formData.append("end_date", projectData.end_date);
      formData.append("tags", projectData.tags ? projectData.tags.join(",") : "");
      formData.append("manager_email", projectData.manager_email);
      // formData.append("status", projectData.status);
      if (projectData.image) {
        formData.append("image", projectData.image);
      }
      const response = await axios.post<NewProject>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/project`,
        formData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      queryClient.invalidateQueries({ queryKey: ['project'] });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "project created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data?.message || "Failed to create project",
        });
      }
    },
  });
};
export const useAssignProjectManager = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (projectData: Omit<{ email: string, project_id: string }, "id">) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }



      const response = await axios.post<NewProject>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/project/assign-manager`,
        projectData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      queryClient.invalidateQueries({ queryKey: ['project'] });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "project manager assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data?.message || "Failed to assign project manager",
        });
      }
    },
  });
};
export const usePutProject = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (projectData: UpdateProject) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const formData = new FormData();
      formData.append("name", projectData.name);
      formData.append("description", projectData.description);
      formData.append("start_date", projectData.start_date);
      formData.append("end_date", projectData.end_date);
      formData.append("status", projectData.status);
      formData.append("tags", projectData.tags ? projectData.tags.join(",") : "");

      if (projectData.image) {
        formData.append("image", projectData.image);
      }

      const response = await axios.put<UpdateProject>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/project/${projectData.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "project updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["Myproject"] });
      queryClient.invalidateQueries({ queryKey: ["Singleproject"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data?.message || "Failed to update project",
        });
      }
    },
  });
};

interface UseProjectDetailsProps {
  project_id: string;
}

interface ProjectDetailsMutationFnProps {
  projectData: Project;
}

export function useTask(id: string) {
  const { data: session } = useSession();
  return useQuery<TaskResponse>({
    queryKey: ["task", id],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await axios.get<TaskResponse>(
          `${baseUrl}/project-mgmt/task/${id}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as TaskResponse;
      } catch (error) {

        if (axios.isAxiosError(error)) {

          const message =
            error.response?.data?.message || "Failed to fetch task details";
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
export function useTaskFliter(id: string, filters: { [key: string]: string | boolean }) {
  const { data: session } = useSession();
  return useQuery<TaskResponse>({
    queryKey: ["task", id, filters],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await axios.get<TaskResponse>(
          `${baseUrl}/project-mgmt/task/${id}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as TaskResponse;
      } catch (error) {

        if (axios.isAxiosError(error)) {

          const message =
            error.response?.data?.message || "Failed to fetch task details";
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

export const useProjectDetails = (project_id: UseProjectDetailsProps["project_id"]) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation<ProjectDetail, Error, ProjectDetailsMutationFnProps["projectData"]>({
    mutationFn: async (projectData) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.put<ProjectDetail>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/project/${project_id}`,
        projectData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      toast.success("Success", {
        description: "Project updated successfully",
      });

      return response.data;
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data?.message || "Failed to update project",
        });
      }
    },
  });
};
export function useGetProjectTask({
  taskPage,
  taskPageSize,
  searchQuery,
  verificationStatus,
  token,
  projectId
}: NewProjectrofileTaskProps) {
  const { data: session } = useSession();
  return useQuery<NewProjectTaskResponse>({
    queryKey: ["task", projectId, taskPage, taskPageSize, searchQuery, verificationStatus],
    queryFn: async () => {


      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(taskPage),
          "limit": String(taskPageSize),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && { "verification-status": verificationStatus }),
        });

        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<NewProjectTaskResponse>(
          `${baseUrl}/project-mgmt/task/project/${projectId}?${params.toString()}`,

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
export function useGetProjectTaskFliter({
  taskPage,
  taskPageSize,
  searchQuery,
  verificationStatus,
  token,
  filters,
  projectId
}: NewProjectrofileTaskFliterProps) {
  const { data: session } = useSession();
  return useQuery<NewProjectTaskResponse>({
    queryKey: ["task", projectId, filters, taskPage, taskPageSize, searchQuery, verificationStatus],
    queryFn: async () => {


      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(taskPage),
          "limit": String(taskPageSize),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && { "verification-status": verificationStatus }),
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== "") {
              acc[key] = value.toString();
            }
            return acc;
          }, {} as Record<string, string>),
        });

        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<NewProjectTaskResponse>(
          `${baseUrl}/project-mgmt/task/project/${projectId}?${params.toString()}`,

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
export function useGetProjectTaskAll({

  projectId
}: NewProjectrofileTaskAll) {
  const { data: session } = useSession();
  return useQuery<ProjectTaskaskResponseAll>({
    queryKey: ["taskAll", projectId],
    queryFn: async () => {


      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }


        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<ProjectTaskaskResponseAll>(
          `${baseUrl}/project-mgmt/task/project/${projectId}/all`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );


        return response.data as ProjectTaskaskResponseAll;
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
export function useGetProjectTaskArchiveFliter({
  taskPage,
  taskPageSize,
  searchQuery,
  verificationStatus,
  token,
  filters,
  projectId
}: NewProjectrofileTaskFliterProps) {
  const { data: session } = useSession();
  return useQuery<NewProjectTaskResponse>({
    queryKey: ["taskArchive", projectId, filters, taskPage, taskPageSize, searchQuery, verificationStatus],
    queryFn: async () => {


      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(taskPage),
          "limit": String(taskPageSize),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && { "verification-status": verificationStatus }),
          ...Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== "") {
              acc[key] = value.toString();
            }
            return acc;
          }, {} as Record<string, string>),
        });

        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<NewProjectTaskResponse>(
          `${baseUrl}/project-mgmt/task/project/archived/${projectId}?${params.toString()}`,

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
export const useAddTask = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (taskData: Omit<NewTask, "id">) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post<User>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task`,
        taskData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Task created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["task"], });
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
const useUpdateTaskRequirement = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (taskData: UpdateTask) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.put<User>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${taskData.id}/requirement`,
        taskData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Task created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["task"], });
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
export const useUpdateRequarementTask = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (taskData: NewTask) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.put<User>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${taskData.id}/requirement`,
        taskData,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Task created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["task"], });
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
export function useGetProjectUser({
  userPage,
  userPageSize,
  searchQuery,
  verificationStatus,
  token,
  projectId
}: NewProjectrofilesUserProps) {
  const { data: session } = useSession();
  return useQuery<NewProjectUserResponseData>({
    queryKey: ["ProjectUser", projectId, userPage, userPageSize, searchQuery, verificationStatus],
    queryFn: async () => {


      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(userPage),
          "limit": String(userPageSize),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && { "verification-status": verificationStatus }),
        });

        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<NewProjectUserResponseData>(
          `${baseUrl}/project-mgmt/project/${projectId}/members?${params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );


        return response.data as NewProjectUserResponseData;
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
export function useGetTaskUserDetail({
  userPage,
  userPageSize,
  searchQuery,
  verificationStatus,
  token,
  taskId,
  role
}: NewTaskUserProps) {
  const { data: session } = useSession();
  return useQuery<NewProjectUserResponse>({
    queryKey: ["taskUsers", role, taskId, userPage, userPageSize, searchQuery, verificationStatus],
    queryFn: async () => {


      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const params = new URLSearchParams({
          page: String(userPage),
          "limit": String(userPageSize),
          ...(searchQuery && { "search": searchQuery }),
          ...(verificationStatus && { "verification-status": verificationStatus }),
        });

        const baseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<NewProjectUserResponse>(
          `${baseUrl}/project-mgmt/task/${taskId}/members?${params.toString()}&${role ? `role=${role}` : ""}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );


        return response.data as NewProjectUserResponse;
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

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (projectData: ProjectDetail) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.put<ProjectDetail>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/project/${projectData.id}`,
        projectData,
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
function useProjectTaskAsAll({ project_id }: projectTaskaskALLProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<ProjectTaskaskResponseAll>({
    queryKey: [`"ProjectTask" ${project_id}`],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<ProjectTaskaskResponseAll>(
          `${baseUrl}/project-mgmt/task/project/${project_id}/all`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as ProjectTaskaskResponseAll;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch tasks`;
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
function useProjectTaskAsRelated({ task_id }: projectTaskaskRealtedProps) {
  const res1 = useSession();
  const { data: session } = useSession();

  return useQuery<ProjectTaskaskResponseAll>({
    queryKey: [`"ProjectTask" ${task_id}`],
    queryFn: async () => {
      try {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await axios.get<ProjectTaskaskResponseAll>(
          `${baseUrl}/project-mgmt/task/related-task-type/${task_id}/`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        return response.data as ProjectTaskaskResponseAll;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            `Failed to fetch tasks`;
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

export const useTaskDistrubuion = (id: string) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post<User>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/task-distribution?task_id=${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Task distribution started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["task"], });
      queryClient.invalidateQueries({ queryKey: ["contributorStats"], });
      queryClient.invalidateQueries({ queryKey: ["MicroTaskStatistic"], });
    },
    onError: (error) => {
   
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data?.message || "Failed to  task distribution",
        });
      }
    },
  });
};
export const useTaskReviwerDistrubuion = (id: string) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post<User>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/task-distribution/reviewer/?task_id=${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Task distribution started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["ReviewerStats"] });
      queryClient.invalidateQueries({ queryKey: ["MicroTaskStatisticReviwer", id] });
      queryClient.invalidateQueries({ queryKey: ["task"], });
    },
    onError: (error) => {
      
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data?.message || "Failed to  task distribution",
        });
      }
    },
  });
};
export const useTaskClose = (id: string) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.patch<User>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${id}/close-toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Task Status Changed",
      });
      queryClient.invalidateQueries({ queryKey: ["task"], });
    },
    onError: (error) => {

      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data?.message || "Failed to close task",
        });
      }
    },
  });
};
export const useContributorStats = (task_id: string) => {
  const { data: session } = useSession();

  return useQuery<ContributorStats>({
    queryKey: ["contributorStats", task_id],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }
      const response = await axios.get<ContributorStats>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/task-distribution-monitoring/statistics/${task_id}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    enabled: !!session?.access_token,
    refetchInterval: 5000,
  });
};
export const useReviewerrStats = (task_id: string) => {
  const { data: session } = useSession();

  return useQuery<ContributorStats>({
    queryKey: ["ReviewerStats", task_id],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }
      // /task-distribution-monitoring/statistics/{task_id}/data-set-assignment-for-reviewers
      const response = await axios.get<ContributorStats>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/task-distribution-monitoring/statistics/${task_id}/data-set-assignment-for-reviewers`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    enabled: !!session?.access_token,
    refetchInterval: 5000,
  });
};
export function useMicroTaskStatistic({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  taskId
}: NewMicroTaskStatisticProps) {
  const { data: session } = useSession();
  return useQuery<NewMicroTaskStatisticPrResponse>({
    queryKey: ["MicroTaskStatistic", taskId, page, pageSize, searchQuery, verificationStatus],
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

        const response = await axios.get<NewMicroTaskStatisticPrResponse>(
          `${baseUrl}/task-distribution-monitoring/statistics/${taskId}/micro-task?${params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );


        return response.data as NewMicroTaskStatisticPrResponse;
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
export function useMicroTaskReviewerStatistic({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  taskId
}: NewMicroTaskStatisticProps) {
  const { data: session } = useSession();
  return useQuery<NewMicroTaskStatisticReviewerPrResponse>({
    queryKey: ["MicroTaskStatisticReviwer", taskId, page, pageSize, searchQuery, verificationStatus],
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
        ///task-distribution-monitoring/statistics/{task_id}/reviewers-task-progress
        const response = await axios.get<NewMicroTaskStatisticReviewerPrResponse>(
          `${baseUrl}/task-distribution-monitoring/statistics/${taskId}/reviewers-task-progress?${params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );


        return response.data as NewMicroTaskStatisticReviewerPrResponse;
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
    refetchInterval: 5000,
  });
};
export function useMicroTaskStatisticContributors({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
  taskId
}: NewMicroTaskStatisticProps) {
  const { data: session } = useSession();
  return useQuery<NewMicroTaskStatisticContributoPrResponse>({
    queryKey: ["MicroTaskStatisticContributors", taskId, page, pageSize, searchQuery, verificationStatus],
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

        const response = await axios.get<NewMicroTaskStatisticContributoPrResponse>(
          `${baseUrl}/task-distribution-monitoring/statistics/${taskId}/contributors?${params.toString()}`,

          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );


        return response.data as NewMicroTaskStatisticContributoPrResponse;
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

export const useUpdateBasicTAsk = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async (taskUpdateData: UpdateTaskForm) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.put<ProjectDetail>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${taskUpdateData.id}`,
        taskUpdateData,
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
        toast.error("Error", {
          description: error.response?.data?.message || "Failed to update user",
        });
      }
    },
  });
};

export const useDeleteTask = (task_id: string) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.patch<ProjectDetail>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/archive-toggle/${task_id}`, {},
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Task status changed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["taskArchive"] });
      queryClient.invalidateQueries({ queryKey: ["task"] });
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
export const useDeleteProjectToggle = (task_id: string) => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.patch<ProjectDetail>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/project/archive-toggle/${task_id}`,
        {}, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }
      );

      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Task Deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["task"] });
      queryClient.invalidateQueries({ queryKey: ["project archive"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
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

export const useDeleteMicroTask = (task_id: string) => {

  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.delete<ProjectDetail>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/workspace/micro-task/${task_id}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Task Deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["taskMicroTasks"] });
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
export const useRemoveTaskUser = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation(
    {
      mutationFn: async (data: { taskId: string; user_id: string }) => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${data.taskId}/members/remove`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              user_id: data.user_id,
            }),
          }
        );

        return response;
      },
      onSuccess: (data) => {
        toast.success("Success", {
          description: "User removed successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["taskUsers"] });
        queryClient.invalidateQueries({ queryKey: ["ProjectUser"] });
        queryClient.invalidateQueries({ queryKey: ["task"] });
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error("Error", {
            description:
              error.response?.data?.message || "Failed to remove user",
          });
        }
      },
    }
  );


};
export const useToggleActivateTaskUser= () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation(
    {
      mutationFn: async (data: { taskId: string; user_id: string }) => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${data.taskId}/members/activate-toggle`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              user_id: data.user_id,
            }),
          }
        );

        return response;
      },
      onSuccess: (data) => {
        toast.success("Success", {
          description: "User Status updated  successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["taskUsers"] });
        queryClient.invalidateQueries({ queryKey: ["ProjectUser"] });
        queryClient.invalidateQueries({ queryKey: ["task"] });
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error("Error", {
            description:
              error.response?.data?.message || "Failed to remove user",
          });
        }
      },
    }
  );


};

export {
  useMyProjectProfiles as MyProjectProfiles,
  useNewProjectProfiles as NewProjectProfiles,
  useNewProjectProfilesArchive as NewProjectProfilesArchive,
  useProjectTaskAsAll as projectTaskasAll,
  useProjectTaskAsRelated as projectTaskasRelated,
  useUpdateTaskRequirement as updateTaskRequirement,
};
