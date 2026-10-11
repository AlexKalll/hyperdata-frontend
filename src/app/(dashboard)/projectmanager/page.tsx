"use client";

import AuthenticatedPage from "@/app/components/layout/AuthenticatedPage";
import { StatisticsProject } from "@/app/types/statistics";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  FolderOpen,
  Layers,
  ListTodo,
} from "lucide-react";

interface ApiResponse<T> {
  data: T;
}

interface ManagedProject {
  id: string;
  name: string;
  status?: string;
}

interface ProjectManagerDashboard {
  projects: ManagedProject[];
  totalTasks: number;
  totalMicroTasks: number;
  totalDatasets: number;
}

const numberFormat = new Intl.NumberFormat();

export default function ProjectManagerDashboardPage() {
  const { data: session } = useSession();
  const accessToken = session?.access_token;

  const { data, isLoading, isError, refetch } =
    useQuery<ProjectManagerDashboard>({
      queryKey: ["projectManagerDashboard", session?.user?.id],
      enabled: !!accessToken,
      queryFn: async () => {
        if (!accessToken) {
          throw new Error("No authentication token available");
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const headers = { Authorization: `Bearer ${accessToken}` };
        const projectsResponse = await axios.get<ApiResponse<ManagedProject[]>>(
          `${baseUrl}/project-mgmt/project/manager/my-projects/all`,
          { headers },
        );
        const projects = projectsResponse.data.data;

        const projectStatistics = await Promise.all(
          projects.map(async (project) => {
            const response = await axios.get<ApiResponse<StatisticsProject>>(
              `${baseUrl}/statistics/project/project?project_id=${encodeURIComponent(project.id)}`,
              { headers },
            );
            return response.data.data;
          }),
        );

        return {
          projects,
          totalTasks: projectStatistics.reduce(
            (total, statistics) => total + statistics.total_tasks,
            0,
          ),
          totalMicroTasks: projectStatistics.reduce(
            (total, statistics) => total + statistics.total_micro_tasks,
            0,
          ),
          totalDatasets: projectStatistics.reduce(
            (total, statistics) => total + statistics.total_data_sets,
            0,
          ),
        };
      },
    });

  const metrics = [
    { label: "Projects", value: data?.projects.length ?? 0, Icon: FolderOpen },
    { label: "Tasks", value: data?.totalTasks ?? 0, Icon: ListTodo },
    { label: "Microtasks", value: data?.totalMicroTasks ?? 0, Icon: Layers },
    { label: "Datasets Collected", value: data?.totalDatasets ?? 0, Icon: Database },
  ];

  return (
    <AuthenticatedPage loadingMessage="Loading your dashboard...">
      <div className="mx-auto max-w-6xl space-y-8 p-2 sm:p-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Project Manager</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              A quick overview of the projects you manage.
            </p>
          </div>
          <Link
            href="/projectmanager/project"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Go to projects
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(({ label }) => (
              <div
                key={label}
                className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
              />
            ))}
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
          >
            <p>We couldn’t load your project summary.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <section
              aria-label="Project statistics"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {metrics.map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="rounded-lg bg-blue-50 p-3 text-primary">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {numberFormat.format(value)}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Your projects
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Projects assigned to you, with their current status.
                  </p>
                </div>
                <Link
                  href="/projectmanager/project"
                  className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
                >
                  View all
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>

              {data?.projects.length ? (
                <ul className="divide-y divide-gray-100">
                  {data.projects.slice(0, 5).map((project) => (
                    <li
                      key={project.id}
                      className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {project.name}
                        </p>
                        {project.status && (
                          <p className="mt-1 text-xs capitalize text-gray-500">
                            {project.status.replace(/[_-]/g, " ")}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/projectmanager/projectDetail/${project.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        Open project
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg bg-gray-50 px-4 py-6 text-sm text-gray-600">
                  No projects are assigned to you yet. Your assigned projects
                  will appear here.
                </p>
              )}

              <Link
                href="/projectmanager/project"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:hidden"
              >
                Go to projects
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </section>
          </>
        )}
      </div>
    </AuthenticatedPage>
  );
}
