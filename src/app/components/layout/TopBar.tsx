"use client";

import { Bell, MoreVertical, ArrowLeft, Menu } from "lucide-react";
import { useAuthStore } from "@/app/context/auth-context";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { MeResponse } from "@/app/types/global";
import { useRouter, usePathname } from "next/navigation";
import { useNotificationCount } from "@/lib/hooks/useNotifications";
import NotificationModal from "./NotificationModal";

export default function TopBar({
  title,
  toggleSidebarAction,
  isMobile,
  isSidebarOpen,
}: {
  title: string;
  toggleSidebarAction: () => void;
  isMobile: boolean;
  isSidebarOpen: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [localUserdata, setLocalUserdata] = useState<MeResponse>(() => {
    // Initialize default user data
    const defaultUserData: MeResponse = {
      id: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      phone_number: null,
      profile_picture: null,
      birth_date: "",
      gender: "",
      is_active: false,
      created_by: null,
      updated_by: null,
      created_date: "",
      updated_date: "",
      language_id: null,
      dialect_id: null,
      role_id: "",
      woreda: null,
      city: null,
      zone_id: null,
      region_id: null,
      sectors: null,
      role: {
        id: "",
        name: "",
        description: "",
        created_by: null,
        updated_by: null,
        created_date: "",
        updated_date: "",
      },
      wallet: null,
      dialect: null,
      language: null,
      score: null,
    };

    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (
            typeof parsedData === "object" &&
            "id" in parsedData &&
            "first_name" in parsedData &&
            "middle_name" in parsedData &&
            "last_name" in parsedData &&
            "email" in parsedData &&
            "role" in parsedData
          ) {
            return parsedData as MeResponse;
          }
        } catch (error) {
          console.error("Failed to parse userData from localStorage:", error);
        }
      }
    }

    return defaultUserData;
  });

  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const { data: notificationCount } = useNotificationCount();
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown
  const [lastProjectDetailPath, setLastProjectDetailPath] = useState<
    string | null
  >(null);

  const handleLogout = async () => {
    localStorage.removeItem("userData");
    await signOut({ callbackUrl: "/login" });
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;

    const stored = localStorage.getItem("userData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.id && parsed?.first_name && parsed?.role) {
          setLocalUserdata(parsed);
        }
      } catch (error) {
        console.error("Failed to parse userData from localStorage:", error);
      }
    }
  }, [mounted]);
  // Track last visited project detail page for smarter back navigation
  useEffect(() => {
    const projectManagerDetailMatch = pathname.match(
      /^\/projectmanager\/projectDetail\/([^/]+)$/
    );
    const superadminDetailMatch = pathname.match(
      /^\/superadmin\/projectDetail\/([^/]+)$/
    );

    if (projectManagerDetailMatch) {
      const path = `/projectmanager/projectDetail/${projectManagerDetailMatch[1]}`;
      setLastProjectDetailPath(path);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("lastProjectDetailPath", path);
        } catch {}
      }
    } else if (superadminDetailMatch) {
      const path = `/superadmin/projectDetail/${superadminDetailMatch[1]}`;
      setLastProjectDetailPath(path);
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("lastProjectDetailPath", path);
        } catch {}
      }
    } else {
      // On non-projectDetail pages, try to hydrate from sessionStorage (once per mount/change)
      if (typeof window !== "undefined") {
        try {
          const stored = sessionStorage.getItem("lastProjectDetailPath");
          if (stored) setLastProjectDetailPath(stored);
        } catch {}
      }
    }
  }, [pathname]);
  const profilePic = mounted
    ? session?.user?.profile_picture ||
      localUserdata.profile_picture ||
      "/default-avatar.png"
    : "/default-avatar.png";
  // State for breadcrumb data
  const [breadcrumbData, setBreadcrumbData] = useState<{
    projectName?: string;
    projectId?: string;
    taskName?: string;
    taskId?: string;
  }>({});

  // Fetch and store breadcrumb data based on current path
  useEffect(() => {
    const fetchBreadcrumbData = async () => {
      if (!session?.access_token) return;

      // Extract IDs from pathname
      const projectDetailMatch = pathname.match(
        /\/(projectmanager|superadmin)\/projectDetail\/([^/]+)$/
      );
      const taskMatch = pathname.match(
        /\/(projectmanager|superadmin|reviewer|facilitator)\/tasks\/([^/]+)/
      );

      try {
        // Fetch project data if on project detail page
        if (projectDetailMatch) {
          const projectId = projectDetailMatch[2];
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/project/${projectId}`,
            {
              headers: { Authorization: `Bearer ${session.access_token}` },
            }
          );
          const data = await response.json();
          const breadcrumb = {
            projectName: data.data?.name,
            projectId: projectId,
          };
          setBreadcrumbData(breadcrumb);
          // Store in sessionStorage for task pages
          if (typeof window !== "undefined") {
            sessionStorage.setItem("currentProject", JSON.stringify(breadcrumb));
          }
        }
        // Fetch task data if on task page
        else if (taskMatch) {
          const taskId = taskMatch[2];
          
          // First try to get project from sessionStorage
          let storedProject = null;
          if (typeof window !== "undefined") {
            const stored = sessionStorage.getItem("currentProject");
            if (stored) {
              try {
                storedProject = JSON.parse(stored);
              } catch (e) {}
            }
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${taskId}`,
            {
              headers: { Authorization: `Bearer ${session.access_token}` },
            }
          );
          const data = await response.json();
          
          // Use stored project if API doesn't return it, or fetch it
          let projectName = storedProject?.projectName;
          let projectId = data.data?.project_id;

          // If we don't have project name but have project_id, fetch it
          if (!projectName && projectId) {
            try {
              const projectResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/project/${projectId}`,
                {
                  headers: { Authorization: `Bearer ${session.access_token}` },
                }
              );
              const projectData = await projectResponse.json();
              projectName = projectData.data?.name;
            } catch (e) {
              console.error("Error fetching project:", e);
            }
          }

          setBreadcrumbData({
            projectName: projectName,
            projectId: projectId,
            taskName: data.data?.name,
            taskId: taskId,
          });
        }
      } catch (error) {
        console.error("Error fetching breadcrumb data:", error);
      }
    };

    fetchBreadcrumbData();
  }, [pathname, session?.access_token]);

  // Routes that should show BACK BUTTON (not breadcrumb)
  const backButtonRoutes = [
    {
      pattern: /^\/projectmanager\/projectDetail\/[^/]+$/,
      backTo: "/projectmanager/project",
    },
    {
      pattern: /^\/superadmin\/projectDetail\/[^/]+$/,
      backTo: "/superadmin/project",
    },
    {
      pattern: /^\/reviewer\/tasks\/[^/]+\/review$/,
      backTo: "/reviewer/tasks",
    },
  ];

  // Routes that should show BREADCRUMB (not back button)
  const breadcrumbRoutes = [
    /^\/projectmanager\/tasks\/[^/]+$/,
    /^\/superadmin\/tasks\/[^/]+$/,
    /^\/reviewer\/tasks\/[^/]+$/,
    /^\/facilitator\/tasks\/[^/]+$/,
  ];

  const shouldShowBackButton = backButtonRoutes.some((route) =>
    route.pattern.test(pathname)
  );
  
  const shouldShowBreadcrumb = breadcrumbRoutes.some((route) =>
    route.test(pathname)
  );

  const backRoute = backButtonRoutes.find((route) =>
    route.pattern.test(pathname)
  )?.backTo;

  const handleBackClick = () => {
    if (backRoute) {
      router.push(backRoute);
    } else {
      router.back();
    }
  };

  return (
    <header className="py-4 px-4 mb-1 flex items-center justify-between z-20 bg-white">
      <div className="flex items-center gap-4">
        {/* Show BACK BUTTON + PROJECT NAME for project detail pages */}
        {shouldShowBackButton && breadcrumbData.projectName && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </button>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-gray-800">
              {breadcrumbData.projectName}
            </span>
          </div>
        )}
        
        {/* Show BREADCRUMB for task pages */}
        {shouldShowBreadcrumb && (breadcrumbData.projectName || breadcrumbData.taskName) ? (
          <div className="flex items-center gap-1 text-sm">
            {breadcrumbData.projectName && (
              <>
                <button
                  onClick={() => {
                    const role = pathname.includes("superadmin") ? "superadmin" : "projectmanager";
                    router.push(`/${role}/projectDetail/${breadcrumbData.projectId}`);
                  }}
                  className="text-gray-600 hover:text-primary hover:underline font-medium transition-colors"
                >
                  {breadcrumbData.projectName}
                </button>
                {breadcrumbData.taskName && (
                  <span className="text-gray-400">/</span>
                )}
              </>
            )}
            {breadcrumbData.taskName && (
              <span className="text-gray-800 font-medium">
                {breadcrumbData.taskName}
              </span>
            )}
          </div>
        ) : !shouldShowBackButton && !isMobile && (
          <h1 className="text-2xl px-2 font-bold text-gray-800">{title}</h1>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          {isMobile && (
            <button
              onClick={toggleSidebarAction}
              className="p-2 text-gray-700 focus:outline-none justify-end"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          )}
          <button
            className="relative p-2 hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => setIsNotificationModalOpen(true)}
          >
            {/* Notification Bell Icon */}

            <div className="relative">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19.5 12.4395V10.5H18V12.75C18 12.9489 18.0791 13.1396 18.2197 13.2803L20.25 15.3105V16.5H3.75V15.3105L5.78025 13.2803C5.92091 13.1396 5.99996 12.9489 6 12.75V9.75C5.99791 8.6961 6.27398 7.6603 6.80032 6.74724C7.32665 5.83417 8.08463 5.07618 8.99767 4.5498C9.91072 4.02343 10.9465 3.74733 12.0004 3.74938C13.0543 3.75144 14.089 4.03157 15 4.5615V2.88525C14.2861 2.56914 13.5267 2.36766 12.75 2.28825V0.75H11.25V2.2875C9.40093 2.4757 7.68732 3.34284 6.44053 4.72124C5.19373 6.09964 4.50233 7.89138 4.5 9.75V12.4395L2.46975 14.4697C2.32909 14.6104 2.25004 14.8011 2.25 15V17.25C2.25 17.4489 2.32902 17.6397 2.46967 17.7803C2.61032 17.921 2.80109 18 3 18H8.25V18.75C8.25 19.7446 8.64509 20.6984 9.34835 21.4016C10.0516 22.1049 11.0054 22.5 12 22.5C12.9946 22.5 13.9484 22.1049 14.6517 21.4016C15.3549 20.6984 15.75 19.7446 15.75 18.75V18H21C21.1989 18 21.3897 17.921 21.5303 17.7803C21.671 17.6397 21.75 17.4489 21.75 17.25V15C21.75 14.8011 21.6709 14.6104 21.5303 14.4697L19.5 12.4395ZM14.25 18.75C14.25 19.3467 14.0129 19.919 13.591 20.341C13.169 20.7629 12.5967 21 12 21C11.4033 21 10.831 20.7629 10.409 20.341C9.98705 19.919 9.75 19.3467 9.75 18.75V18H14.25V18.75Z"
                  fill="#364957"
                />
              </svg>

              {/* Notification Count Badge */}
              {notificationCount?.data !== undefined &&
                notificationCount.data >= 0 && (
                  <span
                    className={
                      "absolute -top-2 -right-2 min-w-[18px] h-[18px] " +
                      (notificationCount.data > 0
                        ? "bg-red-500"
                        : "bg-gray-300") +
                      " text-white text-[10px] rounded-full flex items-center justify-center font-medium px-1 transform scale-100"
                    }
                  >
                    {notificationCount.data > 99
                      ? "99+"
                      : notificationCount.data}
                  </span>
                )}
            </div>
          </button>

          {/* Notification Modal */}
          {isNotificationModalOpen && (
            <NotificationModal
              isOpen={isNotificationModalOpen}
              onClose={() => setIsNotificationModalOpen(false)}
            />
          )}
        </div>
        <div className="relative">
          <button onClick={() => setIsModalOpen(!isModalOpen)}>
            <img
              src={profilePic}
              alt="User"
              className="w-8 h-8 rounded-full "
            />
          </button>

          {/* Modal Popup */}
          {isModalOpen && (
            <div
              ref={dropdownRef}
              className={`
      absolute z-30 mt-2 bg-white rounded-md shadow-lg
      ${
        isMobile
          ? "left-1/2 -translate-x-1/2 w-48 max-w-[calc(100vw-1rem)]"
          : "right-0 w-56"
      }
    `}
            >
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 border-b flex items-center space-x-2">
                  <img
                    src={
                      session?.user?.profile_picture ||
                      localUserdata.profile_picture ||
                      "/default-avatar.png"
                    }
                    alt="User"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">
                      {session?.user?.first_name ||
                        localUserdata.first_name ||
                        "Name"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session?.user?.role ||
                        localUserdata.role?.name ||
                        "User Role"}
                    </p>
                  </div>
                </div>
                <Link href="/settings">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Account Setting
                  </button>
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setIsModalOpen(false);
                    handleLogout();
                  }}
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
