"use client";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UserData } from "@/app/types/global";
import { Badge } from "@/app/components/ui/badge";
import { UserDetailsModal } from "./userDetailsModal";
import { formatDateMedium } from "@/app/types/dateUtils";
export const individualColumns: ColumnDef<UserData>[] = [
  {
    accessorKey: "",
    header: "Full   Name",
    cell: function UserFullNameCell({ row }) {
      return (
        <div className="flex items-center gap-3">
          <span className="font-medium">
            {row.original.first_name} {row.original.middle_name}{" "}
            {row.original.last_name}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: function UserRoleCell({ row }) {
      const roleData = row.original?.role;
      const role = typeof roleData === 'object' ? roleData?.name : roleData;
      const roleColors: Record<string, string> = {
        SuperAdmin: "text-red-500 ",
        Contributor: "bg-[#ECF6FF] text-[#095FAF]",
        ProjectManager: "text-[#0502C2] bg-[#F0EFFF]",
        Facilitator: "text-[#3F3748] bg-[#F2F4F7]",
        Reviewer: "bg-[#FCEFFF] text-[#8500A3]",
      };

      const roleClass = roleColors[role] || "bg-gray-500 text-white";

      return (
        <span
          className={`px-2 py-1  text-sm font-medium rounded-2xl ${roleClass}`}
        >
          {role}
        </span>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: function UserStatusCell({ row }) {
      const status = row.original.is_active;
      return (
        <Badge variant={status ? "active" : "deactivated"}>
          {status === true ? "Active" : "Deactivated"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_date",
    header: "Created Date",
    cell: function UserCreatedDateCell({ row }) {
      const date = row.original.created_date;
      return <span>{date ? formatDateMedium(date) : ""}</span>;
    },
  },

  {
    accessorKey: "",
    header: "Action",
    cell: function UserActionCell({ row }) {
      const [isOpen, setIsOpen] = useState(false);

      const handleDeactivate = (userId: string) => {};

      const handleEdit = (userId: string) => {};
      return (
        <>
          <button
            onClick={() => setIsOpen(true)}
            className="hover:bg-gray-100 p-1 rounded"
            aria-label="View user details"
          >
            <svg
              width="33"
              height="28"
              viewBox="0 0 33 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.6"
                y="1.1"
                width="31.8"
                height="25.8"
                rx="5.4"
                stroke="#EAECF0"
                strokeWidth="1.2"
              />
              <path
                d="M10.875 11.75C10.875 11.75 13.3934 8.9375 16.5 8.9375C19.6066 8.9375 22.125 11.75 22.125 11.75"
                stroke="#667085"
                strokeWidth="0.84375"
                strokeLinecap="round"
              />
              <path
                d="M21.8685 14.5878C22.0395 14.8276 22.125 14.9475 22.125 15.125C22.125 15.3025 22.0395 15.4224 21.8685 15.6622C21.1001 16.7397 19.1377 19.0625 16.5 19.0625C13.8623 19.0625 11.8999 16.7397 11.1315 15.6622C10.9605 15.4224 10.875 15.3025 10.875 15.125C10.875 14.9475 10.9605 14.8276 11.1315 14.5878C11.8999 13.5103 13.8623 11.1875 16.5 11.1875C19.1377 11.1875 21.1001 13.5103 21.8685 14.5878Z"
                stroke="#667085"
                strokeWidth="0.84375"
              />
              <path
                d="M18.1875 15.125C18.1875 14.193 17.432 13.4375 16.5 13.4375C15.568 13.4375 14.8125 14.193 14.8125 15.125C14.8125 16.057 15.568 16.8125 16.5 16.8125C17.432 16.8125 18.1875 16.057 18.1875 15.125Z"
                stroke="#667085"
                strokeWidth="0.84375"
              />
            </svg>
          </button>
          <UserDetailsModal
            user={row.original}
            isOpen={isOpen}
            onCloseAction={() => setIsOpen(false)}
            onDeactivate={handleDeactivate}
            onEdit={handleEdit}
          />
        </>
      );
    },
  },
];
