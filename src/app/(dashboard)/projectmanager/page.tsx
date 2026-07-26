"use client";

import React, { useState, useEffect } from "react";
import { MyProjectProfiles, useProjectDetails } from "@/lib/hooks/useProject";
import {
  ProjectDetail,
  ProjectOnly,
  ProjectResponse,
} from "@/app/types/project";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  PaginationResponse,
  SinglerResponse,
  AllResponse,
} from "@/app/types/global";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FilterComponent } from "@/components/ui/filterComponent";
import { useSession } from "next-auth/react";
import { Bar, Line } from "react-chartjs-2";
import {
  useSingleprojecStatisticsProject,
  useSingleProjectManagerStatisticsData_sets,
} from "@/lib/hooks/useStatistics";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  TooltipItem,
} from "chart.js";
interface FilterComponentProps {
  columns: { accessorKey: string; header: string }[];
  onFilterChangeAction: (
    filters: { [key: string]: string | boolean },
    endpoint: string
  ) => void;
  initialFilters?: { [key: string]: string | boolean };
  endpoint: string;
}
interface NewProjectProfilesResponse
  extends PaginationResponse<ProjectResponse> {}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ProjectOverviewProps {
  projectId: string;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projectId }) => {
  const [viewType, setViewType] = useState<"WEEKLY" | "MONTHLY" | "YEARLY">(
    "WEEKLY"
  );
  const projecIcon = (
    <svg
      width="47"
      height="48"
      viewBox="0 0 47 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="23.1484"
        cy="24.3281"
        rx="22.8632"
        ry="23.3437"
        fill="#095FAF"
      />
      <path
        d="M25.5945 11.8398H21.3335C20.6598 11.8399 20.0096 12.0862 19.5074 12.5319C19.0053 12.9775 18.6862 13.5911 18.6114 14.2554H16.4639C15.7374 14.2554 15.0407 14.5417 14.527 15.0513C14.0133 15.561 13.7247 16.2522 13.7247 16.9729V33.2779C13.7247 33.9986 14.0133 34.6898 14.527 35.1994C15.0407 35.7091 15.7374 35.9954 16.4639 35.9954H30.4641C30.8238 35.9954 31.18 35.9251 31.5123 35.7885C31.8447 35.652 32.1466 35.4518 32.401 35.1994C32.6554 34.9471 32.8571 34.6475 32.9948 34.3178C33.1324 33.9881 33.2033 33.6347 33.2033 33.2779V16.9729C33.2033 16.616 33.1324 16.2627 32.9948 15.933C32.8571 15.6033 32.6554 15.3037 32.401 15.0513C32.1466 14.799 31.8447 14.5988 31.5123 14.4623C31.18 14.3257 30.8238 14.2554 30.4641 14.2554H28.3166C28.2417 13.5911 27.9227 12.9775 27.4205 12.5319C26.9183 12.0862 26.2682 11.8399 25.5945 11.8398ZM21.3335 13.6515H25.5945C25.8366 13.6515 26.0689 13.7469 26.2401 13.9168C26.4113 14.0867 26.5075 14.3171 26.5075 14.5573C26.5075 14.7976 26.4113 15.028 26.2401 15.1979C26.0689 15.3677 25.8366 15.4632 25.5945 15.4632H21.3335C21.0914 15.4632 20.8591 15.3677 20.6879 15.1979C20.5167 15.028 20.4205 14.7976 20.4205 14.5573C20.4205 14.3171 20.5167 14.0867 20.6879 13.9168C20.8591 13.7469 21.0914 13.6515 21.3335 13.6515ZM24.0727 21.804C24.0727 21.5638 24.1689 21.3334 24.3401 21.1635C24.5114 20.9936 24.7436 20.8982 24.9858 20.8982H29.2467C29.4889 20.8982 29.7211 20.9936 29.8923 21.1635C30.0636 21.3334 30.1598 21.5638 30.1598 21.804C30.1598 22.0442 30.0636 22.2746 29.8923 22.4445C29.7211 22.6144 29.4889 22.7098 29.2467 22.7098H24.9858C24.7436 22.7098 24.5114 22.6144 24.3401 22.4445C24.1689 22.2746 24.0727 22.0442 24.0727 21.804ZM24.9858 27.5409H29.2467C29.4889 27.5409 29.7211 27.6364 29.8923 27.8063C30.0636 27.9761 30.1598 28.2065 30.1598 28.4468C30.1598 28.687 30.0636 28.9174 29.8923 29.0873C29.7211 29.2572 29.4889 29.3526 29.2467 29.3526H24.9858C24.7436 29.3526 24.5114 29.2572 24.3401 29.0873C24.1689 28.9174 24.0727 28.687 24.0727 28.4468C24.0727 28.2065 24.1689 27.9761 24.3401 27.8063C24.5114 27.6364 24.7436 27.5409 24.9858 27.5409ZM21.9787 21.2363L19.5439 23.6519C19.3727 23.8215 19.1407 23.9168 18.8987 23.9168C18.6567 23.9168 18.4247 23.8215 18.2535 23.6519L17.036 22.4441C16.9463 22.3612 16.8744 22.2612 16.8245 22.1501C16.7746 22.039 16.7477 21.919 16.7456 21.7974C16.7434 21.6758 16.766 21.5549 16.8119 21.4422C16.8578 21.3294 16.9262 21.2269 17.0129 21.1409C17.0996 21.0549 17.2029 20.9871 17.3165 20.9415C17.4302 20.8959 17.552 20.8736 17.6746 20.8757C17.7972 20.8779 17.9181 20.9045 18.0301 20.954C18.1421 21.0035 18.2429 21.0749 18.3265 21.1639L18.8987 21.7315L20.6883 19.9561C20.7719 19.8671 20.8727 19.7957 20.9847 19.7462C21.0967 19.6967 21.2176 19.6701 21.3402 19.6679C21.4628 19.6658 21.5846 19.6882 21.6982 19.7337C21.8119 19.7793 21.9152 19.8471 22.0019 19.9331C22.0886 20.0191 22.157 20.1216 22.2029 20.2344C22.2488 20.3472 22.2714 20.468 22.2692 20.5896C22.267 20.7112 22.2402 20.8312 22.1903 20.9423C22.1404 21.0534 22.0684 21.1534 21.9787 21.2363ZM21.9787 26.5989C22.1497 26.7687 22.2458 26.9989 22.2458 27.239C22.2458 27.479 22.1497 27.7093 21.9787 27.8791L19.5439 30.2947C19.3727 30.4643 19.1407 30.5596 18.8987 30.5596C18.6567 30.5596 18.4247 30.4643 18.2535 30.2947L17.036 29.0869C16.9463 29.004 16.8744 28.904 16.8245 28.7928C16.7746 28.6817 16.7477 28.5618 16.7456 28.4402C16.7434 28.3185 16.766 28.1977 16.8119 28.0849C16.8578 27.9721 16.9262 27.8697 17.0129 27.7837C17.0996 27.6976 17.2029 27.6298 17.3165 27.5843C17.4302 27.5387 17.552 27.5163 17.6746 27.5185C17.7972 27.5206 17.9181 27.5473 18.0301 27.5968C18.1421 27.6463 18.2429 27.7177 18.3265 27.8067L18.8987 28.3743L20.6883 26.5989C20.8595 26.4292 21.0916 26.334 21.3335 26.334C21.5755 26.334 21.8075 26.4292 21.9787 26.5989Z"
        fill="white"
      />
    </svg>
  );
  const totalmictotaskIcon = (
    <svg
      width="46"
      height="47"
      viewBox="0 0 46 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="22.8887" cy="23.4994" rx="22.5" ry="23.306" fill="#667085" />
      <path
        d="M12.6266 17.0249C12.6266 15.823 13.1041 14.6703 13.9539 13.8205C14.8038 12.9706 15.9565 12.4932 17.1584 12.4932H29.243C30.4449 12.4932 31.5975 12.9706 32.4474 13.8205C33.2973 14.6703 33.7747 15.823 33.7747 17.0249V29.1095C33.7747 30.3114 33.2973 31.4641 32.4474 32.3139C31.5975 33.1638 30.4449 33.6413 29.243 33.6413H17.1584C15.9565 33.6413 14.8038 33.1638 13.9539 32.3139C13.1041 31.4641 12.6266 30.3114 12.6266 29.1095V17.0249ZM22.2248 18.6926C22.3667 18.5508 22.4463 18.3584 22.4463 18.1578C22.4463 17.9573 22.3667 17.7649 22.2248 17.6231C22.083 17.4813 21.8907 17.4016 21.6901 17.4016C21.4895 17.4016 21.2972 17.4813 21.1554 17.6231L19.0224 19.756L18.4227 19.2092C18.2737 19.0818 18.081 19.0174 17.8854 19.0295C17.6897 19.0416 17.5065 19.1293 17.3743 19.274C17.2421 19.4187 17.1714 19.6092 17.177 19.8051C17.1827 20.0011 17.2643 20.1871 17.4046 20.324L18.5375 21.3587C18.6811 21.4894 18.8694 21.5598 19.0635 21.5553C19.2576 21.5508 19.4425 21.4718 19.5798 21.3346L22.2248 18.6926ZM22.2248 25.176C22.1547 25.1056 22.0713 25.0498 21.9796 25.0118C21.8878 24.9737 21.7894 24.9541 21.6901 24.9541C21.5908 24.9541 21.4924 24.9737 21.4006 25.0118C21.3089 25.0498 21.2255 25.1056 21.1554 25.176L19.0224 27.3089L18.4227 26.7621C18.2737 26.6347 18.081 26.5703 17.8854 26.5824C17.6897 26.5945 17.5065 26.6821 17.3743 26.8269C17.2421 26.9716 17.1714 27.1621 17.177 27.358C17.1827 27.554 17.2643 27.74 17.4046 27.8769L18.5375 28.9116C18.6809 29.0425 18.8691 29.1132 19.0632 29.109C19.2573 29.1048 19.4423 29.026 19.5798 28.889L22.2233 26.2455C22.3649 26.1038 22.4445 25.9117 22.4445 25.7115C22.4445 25.5112 22.3649 25.3191 22.2233 25.1775M24.7113 26.0884C24.5109 26.0884 24.3188 26.1679 24.1772 26.3096C24.0355 26.4512 23.956 26.6433 23.956 26.8437C23.956 27.044 24.0355 27.2361 24.1772 27.3777C24.3188 27.5194 24.5109 27.5989 24.7113 27.5989H28.4877C28.688 27.5989 28.8801 27.5194 29.0218 27.3777C29.1634 27.2361 29.243 27.044 29.243 26.8437C29.243 26.6433 29.1634 26.4512 29.0218 26.3096C28.8801 26.1679 28.688 26.0884 28.4877 26.0884H24.7113ZM23.956 19.2908C23.956 19.4911 24.0355 19.6832 24.1772 19.8248C24.3188 19.9665 24.5109 20.0461 24.7113 20.0461H28.4877C28.688 20.0461 28.8801 19.9665 29.0218 19.8248C29.1634 19.6832 29.243 19.4911 29.243 19.2908C29.243 19.0904 29.1634 18.8983 29.0218 18.7567C28.8801 18.6151 28.688 18.5355 28.4877 18.5355H24.7113C24.5109 18.5355 24.3188 18.6151 24.1772 18.7567C24.0355 18.8983 23.956 19.0904 23.956 19.2908Z"
        fill="white"
      />
    </svg>
  );
  const totalUsersIcon = (
    <svg
      width="46"
      height="48"
      viewBox="0 0 46 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="22.8888" cy="23.9994" rx="22.5" ry="23.306" fill="#667085" />
      <path
        d="M22.7691 21.6976C25.3117 21.6976 27.3728 19.6364 27.3728 17.0939C27.3728 14.5514 25.3117 12.4902 22.7691 12.4902C20.2266 12.4902 18.1655 14.5514 18.1655 17.0939C18.1655 19.6364 20.2266 21.6976 22.7691 21.6976Z"
        fill="white"
      />
      <path
        d="M31.9763 30.3285C31.9763 33.1886 31.9763 35.5077 22.769 35.5077C13.5616 35.5077 13.5616 33.1886 13.5616 30.3285C13.5616 27.4685 17.6842 25.1494 22.769 25.1494C27.8537 25.1494 31.9763 27.4685 31.9763 30.3285Z"
        fill="white"
      />
    </svg>
  );
  const TotalMicroTasksIcon = (
    <svg
      width="46"
      height="47"
      viewBox="0 0 46 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="23.1385" cy="23.4994" rx="22.5" ry="23.306" fill="#095FAF" />
      <path
        d="M17.7859 28.7322H21.5623V24.9558H17.7859V28.7322ZM25.3387 28.7322H29.1152V24.9558H25.3387V28.7322ZM17.7859 21.1794H21.5623V17.4029H17.7859V21.1794ZM25.3387 21.1794H29.1152V17.4029H25.3387V21.1794ZM15.4142 33.1381C14.8344 33.1381 14.3506 32.9442 13.9628 32.5565C13.5751 32.1688 13.3808 31.6846 13.38 31.1039V15.0313C13.38 14.4514 13.5743 13.9676 13.9628 13.5799C14.3514 13.1922 14.8352 12.9979 15.4142 12.9971H31.488C32.0671 12.9971 32.5509 13.1913 32.9395 13.5799C33.328 13.9685 33.5219 14.4523 33.521 15.0313V31.1051C33.521 31.6842 33.3272 32.168 32.9395 32.5565C32.5517 32.9451 32.0675 33.1389 31.4868 33.1381H15.4142Z"
        fill="white"
      />
    </svg>
  );
  const { data: superadminData, isLoading: superadminLoading } =
    useSingleprojecStatisticsProject(projectId);
  const { data: datasetData, isLoading: datasetLoading } =
    useSingleProjectManagerStatisticsData_sets(viewType, projectId);

  const metrics = superadminData?.data
    ? [
        {
          title: "Total Tasks",
          value: superadminData.data.total_tasks,
          change: "bg-blue-100",
          icon: projecIcon,
        },
        {
          title: "Total Micro Tasks",
          value: superadminData.data.total_micro_tasks,
          change: "bg-white",
          icon: totalmictotaskIcon,
        },
        {
          title: "Total Data sets",
          value: superadminData.data.total_data_sets,
          change: "bg-blue-100",
          icon: TotalMicroTasksIcon,
        },
        {
          title: "Total Users",
          value:
            (superadminData.data.total_reviewers
              ? superadminData.data.total_reviewers
              : 0) +
            (superadminData.data.total_contributors
              ? superadminData.data.total_contributors
              : 0) +
            (superadminData.data.total_facilitators
              ? superadminData.data.total_facilitators
              : 0),
          change: "bg-white",
          icon: totalUsersIcon,
        },
      ]
    : [];

  const currentYear = new Date().getFullYear();
  const labels = (() => {
    switch (viewType) {
      case "WEEKLY":
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      case "MONTHLY":
        return Array.from({ length: 12 }, (_, i) =>
          new Date(currentYear, i, 1).toLocaleString("default", {
            month: "short",
          })
        );
      case "YEARLY":
        return [
          currentYear - 2,
          currentYear - 1,
          currentYear,
          currentYear + 1,
          currentYear + 2,
        ].map((y) => y.toString());
      default:
        return ["No Data"];
    }
  })();

  const dataValues =
    Array.isArray(datasetData?.data) && datasetData?.data?.length > 0
      ? datasetData.data.map((item) => {
          const date = item.date;
          let index: number;
          switch (viewType) {
            case "WEEKLY":
              index = (date - 1) % 7;
              break;
            case "MONTHLY":
              index = (date - 1) % 12;
              break;
            case "YEARLY":
              index = [
                currentYear - 2,
                currentYear - 1,
                currentYear,
                currentYear + 1,
                currentYear + 2,
              ].indexOf(date);
              break;
            default:
              index = 0;
          }
          return { index, value: parseInt(item.count) || 0 };
        })
      : [{ index: 0, value: 0 }];

  const lineData: ChartData<"line", number[], string> = {
    labels: labels,
    datasets: [
      {
        label: "Total Dataset",
        data: labels.map((_, i) => {
          const dataPoint = dataValues.find((d) => d.index === i);
          return dataPoint ? dataPoint.value : 0;
        }),
        fill: false,
        backgroundColor: "rgba(0, 0, 0, 0)",
        borderColor: "rgba(0, 112, 192, 1)",
        pointBackgroundColor: "rgba(0, 0, 0, 1)",
        pointBorderColor: "rgba(0, 0, 0, 1)",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Total Dataset",
        color: "#095FAF",
      },
      tooltip: {
        enabled: true,
        mode: "nearest" as const,
        callbacks: {
          label: (tooltipItem: TooltipItem<"line">) =>
            `${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Count" },
      },
      x: {
        title: { display: false },
        ticks: {
          autoSkip: false,
        },
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="y-0 py-5 px-4">
        <span className="text-gray-700 text-lg font-medium">
          {superadminData?.data?.project?.name}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`${metric.change} px-3 py-5 flex flex-row rounded-lg shadow-sm items-center gap-2`}
          >
            <div>{metric.icon}</div>
            <div className="py-2 px-1 rounded-lg">
              <p className="text-gray-500 text-sm font-medium">
                {metric.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {superadminLoading ? "Loading..." : metric.value}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900"></h2>
          <select
            className="border border-gray-100rounded px-2 py-1 text-sm text-gray-700 bg-white"
            value={viewType}
            onChange={(e) =>
              setViewType(e.target.value as "WEEKLY" | "MONTHLY" | "YEARLY")
            }
          >
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
        <div className="relative w-full h-[350px] md:h-[400px] lg:h-[450px]">
          {datasetLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading dataset data...</p>
            </div>
          ) : Array.isArray(datasetData?.data) &&
            datasetData?.data?.length > 0 ? (
            <Line data={lineData} options={lineOptions} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>No dataset data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const [projects, setProjects] = useState<ProjectDetail[]>([]);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [projectToUpdate, setProjectToUpdate] = useState<ProjectOnly | null>(
    null
  );
  const [filters, setFilters] = useState<{ [key: string]: string | boolean }>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [verificationStatus, setVerificationStatus] = useState<string>();
  const { data: projectData, isLoading: isProjectLoading } = MyProjectProfiles({
    page,
    pageSize,
    filters,
    searchQuery: debouncedSearch,
    verificationStatus,
  }) as { data?: NewProjectProfilesResponse; isLoading: boolean };

  const handleUpdateProjectClick = (project: ProjectDetail) => {
    setProjectToUpdate(project);
    setIsUpdateModalOpen(true);
  };

  const handleFilterChange = (
    newFilters: { [key: string]: string | boolean },
    endpoint: string
  ) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    setSelectedProject(projectId || null);
  };

  useEffect(() => {
    if (projectData?.data.result) {
      setProjects(projectData.data.result);
      setLoading(false);
    }
  }, [projectData]);

  // Sample columns for FilterComponent (adjust based on your needs)
  const filterColumns = [
    { accessorKey: "name", header: "Project Name" },
    { accessorKey: "description", header: "Description" },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{" "}</h1>
        <div className="flex items-center ">
          <select
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 bg-white"
            value={selectedProject || ""}
            onChange={handleProjectSelect}
            disabled={isProjectLoading}
          >
            <option value="">Select a Project</option>
            {projectData?.data.result.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <FilterComponent
            columns={filterColumns}
            onFilterChangeAction={handleFilterChange}
            endpoint="/projects"
            initialFilters={filters}
          />
        </div>
      </div>

      {selectedProject && (
        <ProjectOverview projectId={selectedProject} />
      )}
    </div>
  );
}
