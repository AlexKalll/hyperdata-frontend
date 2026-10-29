// Define user roles
export type UserRole = "SuperAdmin" | "Admin" | "ProjectManager" | "User" | "Reviewer" | "Facilitator" | null;

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
    href: "/superadmin",
    iconName: "overview",
    roles: ["SuperAdmin", "Admin"],
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
    href: "/superadmin/users",
    iconName: "userManagement",
    roles: ["SuperAdmin", "Admin"],
  },
  {
    label: "Project Management",
    href: "/superadmin/project",
    iconName: "projectManagement",
    roles: ["SuperAdmin", "Admin"],
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
    roles: ["SuperAdmin", "Admin"],
    subItems: [
      { label: "Language", href: "/superadmin/basedata/language" },
      { label: "Dialect", href: "/superadmin/basedata/dialect" },
      { label: "Sector", href: "/superadmin/basedata/sector" },
      { label: "Organization", href: "/superadmin/basedata/organization" },
      { label: "Country", href: "/superadmin/basedata/country" },
      { label: "Region", href: "/superadmin/basedata/region" },
      { label: "Zone", href: "/superadmin/basedata/zone" },
      { label: "Rejection Type", href: "/superadmin/basedata/rejectionType" },
      { label: "Annotation Type", href: "/superadmin/basedata/annotationType" },
      { label: "Annotation ", href: "/superadmin/basedata/annotation" },
      { label: "Flag Type", href: "/superadmin/basedata/flagType" },
    ],
  },
  {
    label: "Archive",
    href: "/superadmin/projectArchive",
    iconName: "archive",
    roles: ["SuperAdmin", "Admin"],
  },
  {
    label: "Settings",
    href: "/superadmin/setting",
    iconName: "settings",
    roles: ["SuperAdmin", "Admin"],
  },

  {
    label: "System Log",
    href: "/superadmin/log",
    iconName: "log",
    roles: ["SuperAdmin", "Admin"],
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
