// components/user-details-modal.tsx
"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  CustomDialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialogLeft";
import { User } from "@/app/types/global";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import { usedeactivateUser } from "@/lib/hooks/useFetchUser";
import { Button } from "@/components/ui/button";
import UpdateUserForm from "./updateUserForm";
interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onDeactivate: (userId: string) => void;
  onEdit: (userId: string) => void;
}
interface UserDetailsDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onDeactivate: (userId: string) => void;
  onEdit: (userId: string) => void;
}

export function UserDetailsModal({
  user,
  isOpen,
  onClose,

}: UserDetailsModalProps) {
  const currentUser = user;
  const [isOpenEditer, setIsOpenEditer] = useState(false);
  const [isOpendeactivate, setIsOpendeactivate] = useState(false);
  const [isOpendeactivateId, setIsOpendeactivateid] = useState("");
  const updateUserMutation = usedeactivateUser();
  const handleDeactivate = async () => {
    if (!user) return;
    await updateUserMutation.mutateAsync(user);
    onClose();
  };
  if (!user) return null;
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <p className="mb-8 font-bold ">User Information</p>
          </DialogHeader>
          <div className="space-y-1 border-b pb-4 flex-row flex items-center gap-4 mb-4">
            <img
              src={user?.image || "/default-avatar.png"}
              alt="User"
              className="w-17 h-17 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant={user.status ? "deactivated" : "active"}>
                  {user.status ? "Deactivated" : "Active"}
                </Badge>
                <span className="text-gray-600">{user.email}</span>
              </div>
            </div>
          </div>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium text-gray-500">
                First Name
              </span>
              <span className="col-span-3">{user.first_name}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium text-gray-500">
                Last Name
              </span>
              <span className="col-span-3">{user.last_name}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium text-gray-500">Email</span>
              <span className="col-span-3">{user.email}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <span className="col-span-3">
                {user.status ? "Deactivated" : "Active"}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="text-sm font-medium text-gray-500">
                Created Date
              </span>
              <span className="col-span-3">{user.created_date}</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <div className="flex items-center space-x-2">
                {/* <Checkbox
                  id="deactivate"
                  className="h-4 w-4"
                  checked={user.status === "inactive"}
                  onCheckedChange={() => onDeactivate(user.id)}
                /> */}
                {user.is_active ? (
                  <Button
                    onClick={() => {
                      setIsOpendeactivate(true);
                      setIsOpendeactivateid(user.id);
                    }}
                    variant="outline"
                    className="!bg-white !text-red-500 !border-[0.5px] !border-red-500 !hover:bg-red-100 !rounded-lg !px-4 !py-2 flex items-center gap-2"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.24996 8.99967H13.4166M16.2812 8.99967C16.2812 10.975 15.4965 12.8694 14.0998 14.2661C12.703 15.6629 10.8086 16.4476 8.83329 16.4476C6.85798 16.4476 4.96358 15.6629 3.56682 14.2661C2.17006 12.8694 1.38538 10.975 1.38538 8.99967C1.38538 7.02436 2.17006 5.12996 3.56682 3.7332C4.96358 2.33645 6.85798 1.55176 8.83329 1.55176C10.8086 1.55176 12.703 2.33645 14.0998 3.7332C15.4965 5.12996 16.2812 7.02436 16.2812 8.99967Z"
                        stroke="#D03710"
                        strokeWidth="1.25"
                      />
                    </svg>
                    Deactivate account
                  </Button>
                ) : (
                  <div>
                    <Button
                      onClick={() => {
                        handleDeactivate();
                      }}
                      variant="outline"
                      className="!bg-white !text-primary !border-[0.5px] !border-prim !hover:bg-blue-100 !rounded-lg !px-4 !py-2 flex items-center gap-2"
                    >
                      Activate account
                    </Button>
                  </div>
                )}
              </div>
              {/* <Button
                variant="outline"
                className="bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                onClick={( ) => setIsOpenEditer(true)}
              >
                Edit
              </Button> */}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <CustomDialog
        open={isOpenEditer}
        onOpenChange={setIsOpenEditer}
        onClose={() => setIsOpenEditer(false)}
      >
        <DialogContent>
          <DialogHeader>
            <p className="mb-8 font-bold ">Update u User</p>
          </DialogHeader>
          <UpdateUserForm
            onClose={() => setIsOpenEditer(false)}
            initialData={user}
          />
        </DialogContent>
      </CustomDialog>
      <CustomDialog
        open={isOpendeactivate}
        onOpenChange={() => setIsOpendeactivate(false)}
        onClose={() => setIsOpendeactivate(false)}
      >
        <DialogContent>
          <DialogHeader>
            <p className="mb-8 font-bold ">deactivate the user</p>
          </DialogHeader>
          <Button
            onClick={() => {
              handleDeactivate();
              setIsOpendeactivate(false);
            }}
            variant="outline"
            className="!bg-white !text-red-500 !border-[0.5px] !border-red-500 !hover:bg-red-100 !rounded-lg !px-4 !py-2 flex items-center gap-2"
          >
            Deactivate
          </Button>
          <Button
            onClick={() => {
              setIsOpendeactivate(false);
            }}
            variant="outline"
            className="!bg-white !text-primary !border-[0.5px] !border-primary !hover:bg-red-100 !rounded-lg !px-4 !py-2 flex items-center gap-2"
          >
            Cancel
          </Button>
        </DialogContent>
      </CustomDialog>
    </>
  );
}
