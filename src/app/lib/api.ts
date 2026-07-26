import axios from "axios";
import { parseCookies } from "nookies";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const cookies = parseCookies();
  const token = cookies["authToken"];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);

export const fetchUsers = async () => {
  const { data } = await api.get("/iam/users");
  return data;
};

export const fetchTasks = async () => {
  const { data } = await api.get("/iam/users");
  return data;
};
export const createTask = async (userData: any) => {
  const { data } = await api.post("/iam/users", userData);
  return data;
};
export const TaskInput = async () => {
  const { data } = await api.get("/iam/users");
  return data;
};

export const createUser = async (userData: any) => {
  const { data } = await api.post("/iam/users", userData);
  return data;
};
export default api;
