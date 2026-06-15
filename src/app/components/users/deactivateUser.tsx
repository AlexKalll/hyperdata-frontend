import {
  Dialog,
  DialogContent,
  CustomDialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { usedeactivateUser } from "@/lib/hooks/useFetchUser";
import { Button } from "@/components/ui/button";
import { User } from "@/app/types/global";
interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}
export function DeactivateUser({
  user,
  isOpen,
  onClose,
}: UserDetailsModalProps) {
  const updateUserMutation = usedeactivateUser();
  const [isOpendeactivate, setIsOpendeactivate] = useState(false);
  const handleDeactivate = async () => {
    if (!user) return;
    await updateUserMutation.mutateAsync(user);
    onClose();
  };
  if (!user) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>
          <DialogHeader>
            <p className="text-lg text-gray-600">
              Do you want to deactivate this user?
            </p>
          </DialogHeader>
        </DialogTitle>
        <div className="flex flex-row items-end mt-4">
          <Button
            onClick={() => {
              handleDeactivate();
              setIsOpendeactivate(false);
              onClose();
            }}
            variant="outline"
            className="!bg-white !text-red-500 !border-[0.5px] !border-red-500 !hover:bg-red-100 !rounded-lg !px-4 !py-2 flex items-center gap-2 mr-3"
          >
            Deactivate
          </Button>
          <Button
            onClick={() => {
              onClose();
            }}
            variant="outline"
            className="!bg-white !text-primary !border-[0.5px] !border-primary !hover:bg-red-100 !rounded-lg !px-4 !py-2 flex items-center gap-2"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
