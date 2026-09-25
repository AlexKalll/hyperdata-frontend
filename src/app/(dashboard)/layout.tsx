"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/app/components/layout/Sidebar";
import TopBar from "@/app/components/layout/TopBar";
import { useSyncAuthStore } from "@/app/context/auth-context";
import { usePathname } from "next/navigation";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useSyncAuthStore();
  const pathname = usePathname();

  // Map for friendly names
  const titleMap: Record<string, string> = {
    project: "Project",
    projectDetail: "Project Detail",
    basedata: "Base Data",
    country: "Country",
    projectmanager: "Dashboard",
    superadmin: "Dashboard",
    users :"User Management"
  };

  // Helper to check if a segment is a UUID (basic check)
  function isUUID(segment: string) {
    return /^[0-9a-fA-F-]{32,}$/.test(segment) && segment.includes("-");
  }

  // Helper to check if a segment is dynamic ([id])
  function isDynamic(segment: string) {
    return segment.startsWith("[") && segment.endsWith("]");
  }

  function toTitleCase(str: string) {
    // Split camelCase or lowercase words and capitalize
    return str
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to space
      .replace(/[_-]/g, " ") // underscores/dashes to space
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function getPageTitle(pathname: string) {
    const segments = pathname.split("/").filter(Boolean);
    // Remove dynamic and UUID segments
    const staticSegments = segments.filter(
      seg => !isDynamic(seg) && !isUUID(seg)
    );
    // Use the last static segment
    let last = staticSegments[staticSegments.length - 1];
    if (!last) return "Dashboard";
    return titleMap[last] || toTitleCase(last);
  }

  function getRoleFromPath(pathname: string) {
    const segments = pathname.split("/").filter(Boolean);
    // Assuming role is always the 2nd segment after (dashboard)
    const dashboardIdx = segments.indexOf("(dashboard)");
    if (dashboardIdx !== -1 && segments.length > dashboardIdx + 1) {
      return segments[dashboardIdx + 1].charAt(0).toUpperCase() + segments[dashboardIdx + 1].slice(1);
    }
    return "";
  }

  const role = getRoleFromPath(pathname);
  const pageTitle = getPageTitle(pathname);
  const fullTitle = role ? `${role} ${pageTitle}` : pageTitle;

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
        if (mobile) {
          setIsSidebarOpen(false);
        } else {
          setIsSidebarOpen(true);
        }
      }
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <div className="flex">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      <div
        className={`flex-1 flex flex-col ${
          isSidebarOpen && !isMobile ? "ml-64" : "ml-0 w-full"
        }`}
      >
        <TopBar title={fullTitle} toggleSidebarAction={toggleSidebar} isMobile={isMobile} isSidebarOpen={isSidebarOpen} />
        <main  className={`flex-1 px-4 py-4 bg-white transition-all duration-300`}>
          {children}
        </main>
      </div>
    </div>
  );
}
