
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";


import { PaginationResponse, SinglerResponse, AllResponse } from "@/app/types/global"
import { useSession } from "next-auth/react";


interface BalanceResponse {
    message: string
    code: string
    data: string

}
interface statisticsResponse {
    data:
    {
        textDataSet: number,
        audioDataSet: number,
        totalDataSet: number
    }
}
interface Score {
    id: string,
    value_in_birr: number,
    created_date: string,
    updated_date: string
}
interface transaction {
    id: string,
    amount: string,
    type: string,
    metadata: null,
    status: string,
    user_id: string,
    created_date: string,
    updated_date: string
}
interface WithdrawMoney {
    paymentMethod: string
    phoneNumber: string
    amount: string

}
interface ScoreUpdate {
   scoreValue: number
}


interface TransactionResponse extends PaginationResponse<transaction> { }
interface ScoreResponse extends SinglerResponse<Score> { }

export function MyBalanceResponse() {
    const res1 = useSession();
    const { data: session } = useSession();

    return useQuery<BalanceResponse>({
        queryKey: ["MyBalance",],
        queryFn: async () => {


            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }


                const baseUrl =
                    process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await axios.get<BalanceResponse>(
                    `${baseUrl}/wallet/balance`,

                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );


                return response.data as BalanceResponse;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch Balance";
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
export function ScoreResponse() {
    const res1 = useSession();
    const { data: session } = useSession();

    return useQuery<ScoreResponse>({
        queryKey: ["MyScore",],
        queryFn: async () => {


            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }


                const baseUrl =
                    process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await axios.get<ScoreResponse>(
                    `${baseUrl}/score-value`,

                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );


                return response.data as ScoreResponse;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch Score";
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
export function ScoreResponseChange() {
    const queryClient = useQueryClient();
    const res1 = useSession();
    const { data: session } = useSession();
  return useMutation({
    mutationFn: async (taskUpdateData: ScoreUpdate) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }

      const response = await axios.put<ScoreResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/score-value/update`,
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
      queryClient.invalidateQueries({ queryKey: ["MyScore"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error("Error", {
          description: error.response?.data?.message || "Failed to update user",
        });
      }
    },
  });
   
}
export const useWithdrawMoney = () => {
    const queryClient = useQueryClient();
    const { data: session } = useSession();

    return useMutation({
        mutationFn: async (taskData: WithdrawMoney) => {
            if (!session?.access_token) {
                throw new Error("No authentication token available");
            }

            const response = await axios.post<WithdrawMoney>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/wallet/withdraw-money`,
                {
                    paymentMethod: taskData.paymentMethod,
                    phoneNumber: taskData.phoneNumber,
                    amount: Number(taskData.amount),
                },
                {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                }
            );
            return response.data;
        },
        onSuccess: () => {
            toast.success("Success", {
                description: "Withdraw  successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["MyBalance"], });
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
export function useTransactionResponse({
    page,
    pageSize,
    type,
}: { page: number, pageSize: number, type: string }) {
    const { data: session } = useSession();

    return useQuery<TransactionResponse>({
        queryKey: ["TransactionResponseData", page, pageSize, type],
        queryFn: async () => {
            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }
                const params = new URLSearchParams({
                    page: String(page),
                    "limit": String(pageSize),
                });

                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await axios.get<TransactionResponse>(
                    `${baseUrl}/transaction?${params.toString()}&type=${type}`,
                    //   `${baseUrl}/user?${params.toString()}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );

                return response.data as TransactionResponse;
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
export function Reviewerstatistics() {
    const res1 = useSession();
    const { data: session } = useSession();

    return useQuery<statisticsResponse>({
        queryKey: ["statisticsResponse",],
        queryFn: async () => {


            try {
                if (!session?.access_token) {
                    throw new Error("No authentication token available");
                }


                const baseUrl =
                    process.env.NEXT_PUBLIC_API_BASE_URL;

                const response = await axios.get<statisticsResponse>(
                    `${baseUrl}/statistics/reviewer/reviewer`,

                    {
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    }
                );


                return response.data as statisticsResponse;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const message =
                        error.response?.data?.message || "Failed to fetch Balance";
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
