// Define user roles
export type UserRole = "Admin" | "ProjectManager" | "User" | "Reviewer" | "Facilitator" | null;

// Define menu item structure
export interface MenuItem {
  label: string;
  href: string;
  iconName: string;
  roles: UserRole[];
  subItems?: { label: string; href: string }[];
}


export const menuConfig: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    iconName: "overview",
    roles: ["Admin"],
  },
  {
    label: "Dashboard",
    href: "/projectmanager",
    iconName: "overview",
    roles: ["ProjectManager",],
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    iconName: "overview",
    roles: ["User"],
  },
  {
    label: "User Management",
    href: "/admin/users",
    iconName: "userManagement",
    roles: ["Admin"],
  },
  {
    label: "Project Management",
    href: "/admin/project",
    iconName: "projectManagement",
    roles: ["Admin"],
  },
  {
    label: "Dashboard",
    href: "/reviewer",
    iconName: "overview",
    roles: ["Reviewer"],
  },
  {
    label: "Tasks",
    href: "/reviewer/tasks",
    iconName: "projectManagement",
    roles: ["Reviewer"],
  },

  {
    label: "Tasks",
    href: "/facilitator/",
    iconName: "overview",
    roles: ["Facilitator"],
  },
  // {
  //   label: "Tasks",
  //   href: "/facilitator/tasks",
  //   iconName: "projectManagement",
  //   roles: ["Facilitator"],
  // },
  {
    label: "Base Data",
    href: "",
    iconName: "baseData",
    roles: ["Admin"],
    subItems: [
      { label: "Language", href: "/admin/basedata/language" },
      { label: "Dialect", href: "/admin/basedata/dialect" },
      { label: "Sector", href: "/admin/basedata/sector" },
      { label: "Organization", href: "/admin/basedata/organization" },
      { label: "Country", href: "/admin/basedata/country" },
      { label: "Region", href: "/admin/basedata/region" },
      { label: "Zone", href: "/admin/basedata/zone" },
      { label: "Rejection Type", href: "/admin/basedata/rejectionType" },
      { label: "Annotation Type", href: "/admin/basedata/annotationType" },
      { label: "Annotation ", href: "/admin/basedata/annotation" },
      { label: "Flag Type", href: "/admin/basedata/flagType" },
    ],
  },
  {
    label: "Archive",
    href: "/admin/projectArchive",
    iconName: "archive",
    roles: ["Admin"],
  },
  {
    label: "Settings",
    href: "/admin/setting",
    iconName: "settings",
    roles: ["Admin"],
  },

  {
    label: "System Log",
    href: "/admin/log",
    iconName: "log",
    roles: ["Admin"],
  },


  {
    label: "Projects",
    href: "/projectmanager/project",
    iconName: "projectManagement",
    roles: ["ProjectManager"],
  },
  {
    label: "Settings",
    href: "/settings",
    iconName: "settings",
    roles: ["ProjectManager", "Reviewer", "Facilitator"],
  },
  {
    label: "Help & Support",
    href: "/help",
    iconName: "help",
    roles: ["ProjectManager", "Reviewer", "Facilitator"],
  },
];
