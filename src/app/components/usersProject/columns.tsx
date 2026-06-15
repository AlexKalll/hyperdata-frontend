"use client";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UserData } from "@/app/types/global";
import { Badge } from "@/app/components/ui/badge";
import { UserDetailsModal } from "./userDetailsModal";
export const individualColumns: ColumnDef<UserData>[] = [
  {
    accessorKey: "first_name",
    header: "First  Name",
    cell: function ProjectUserFirstNameCell({ row }) {
      const initials =
        row
          .getValue<string>("first_name")
          ?.split(" ")
          ?.map((n) => n[0])
          ?.join("") || "".toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-5 md:w-9 md:h-9 rounded-full bg-[#6dacff] text-white flex items-center justify-center md:text-sm text-xs font-medium">
            {initials}
          </div>
          <span className="font-medium">{row.getValue("first_name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: function ProjectUserStatusCell({ row }) {
      const status = row.original.is_active;
      return (
        <Badge variant={status ? "active" : "deactivated"}>
          {status === true ? "Active" : "Deactivated"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: function ProjectUserRoleCell({ row }) {
      const roleData = row.original?.role;
      const role = typeof roleData === 'object' ? roleData?.name : roleData;
      const roleColors: Record<string, string> = {
        SuperAdmin: "text-red-500",
        Contributor: "text-blue-500",
        ProjectManager: "text-green-500",
        Facilitator: "text-yellow-500",
        Reviewer: "text-purple-500",
      };

      const roleClass = roleColors[role] || "bg-gray-500 text-white";

      return (
        <span className={`px-2 py-1 rounded text-sm font-medium  ${roleClass}`}>
          {role}
        </span>
      );
    },
  },
  {
    accessorKey: "created_date",
    header: "Date",
  },

  {
    accessorKey: "",
    header: "Action",
    cell: function ProjectUserActionCell({ row }) {
      const [isOpen, setIsOpen] = useState(false);

      const handleDeactivate = () => {};

      const handleEdit = () => {};
      return (
        <>
          <button
            onClick={() => setIsOpen(true)}
            className="hover:bg-gray-100 p-1 rounded"
            aria-label="View user details"
          >
            <svg
              fill="none"
              stroke="currentColor"
              height="20"
              viewBox="0 0 21 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6.66667C2 6.66667 5.73096 2.5 10.3333 2.5C14.9357 2.5 18.6667 6.66667 18.6667 6.66667"
                stroke="#667085"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
              <path
                d="M18.2867 10.8708C18.54 11.226 18.6667 11.4037 18.6667 11.6666C18.6667 11.9295 18.54 12.1072 18.2867 12.4624C17.1483 14.0588 14.241 17.4999 10.3333 17.4999C6.42565 17.4999 3.51842 14.0588 2.38003 12.4624C2.12667 12.1072 2 11.9295 2 11.6666C2 11.4037 2.12667 11.226 2.38003 10.8708C3.51842 9.27442 6.42565 5.83325 10.3333 5.83325C14.241 5.83325 17.1483 9.27442 18.2867 10.8708Z"
                stroke="#667085"
                strokeWidth="1.25"
              />
              <path
                d="M12.8333 11.6667C12.8333 10.286 11.7141 9.16675 10.3333 9.16675C8.95256 9.16675 7.83331 10.286 7.83331 11.6667C7.83331 13.0475 8.95256 14.1667 10.3333 14.1667C11.7141 14.1667 12.8333 13.0475 12.8333 11.6667Z"
                stroke="#667085"
                strokeWidth="1.25"
              />
            </svg>
          </button>
          <UserDetailsModal
            user={row.original}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onDeactivate={handleDeactivate}
            onEdit={handleEdit}
          />
        </>
      );
    },
  },
];
