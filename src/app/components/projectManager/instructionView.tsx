"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import EditTaskInstruction from "./editTaskInstruction";
import { DeleteInstruction } from "@/lib/hooks/useProjectManager";
interface InstructionViewProps {
  onCancel: () => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  taskInstructions: {
    id: string;
    task_id: string;
    title: string;
    content: string;
    image_instruction_url: string | null;
    video_instruction_url: string | null;
    audio_instruction_url: string | null;
    created_by: string;
    updated_by: string | null;
    created_date: string;
    updated_date: string;
  };
}

const InstructionView: React.FC<InstructionViewProps> = ({
  onCancel,
  taskInstructions,

  open,
  setOpen,
}) => {
  const [showEditInstruction, setShowEditInstruction] = useState(false);
  const deleteInstruction = DeleteInstruction();

  const handleDelete = async () => {
    if (!window.confirm("Delete this instruction?")) return;

    try {
      await deleteInstruction.mutateAsync(taskInstructions.task_id);
      setOpen(false);
      onCancel();
    } catch {
      return;
    }
  };

  if (!taskInstructions) {
    return (
      <div className="p-4">
        <button
          onClick={onCancel}
          className="flex items-center text-primary hover:text-blue-800 mb-4"
        >
          <span className="mr-1">←</span> Back
        </button>
        <div className="text-red-500">No instructions available.</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Back Button */}
      <button
        onClick={onCancel}
        className="flex items-center text-primary hover:text-blue-800 mb-4"
      >
        <span className="mr-1">←</span> Back
      </button>

      {/* Task Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-bold mr-2">
            {taskInstructions.title ? taskInstructions.title : ""}
          </h2>
        </div>
      </div>

      {/* Dates */}
      <div className="text-gray-500 text-sm mb-4">
        <span className="mr-4">
          Created{" "}
          {new Date(taskInstructions.created_date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <span>
          Last Update{" "}
          {new Date(taskInstructions.updated_date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Instructions Section */}
      <div className="bg-gray-100 p-4 rounded-lg ">
        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
        <p className="text-gray-700">{taskInstructions.content}</p>
      </div>

      {/* Video Link (if available) */}
      {taskInstructions.video_instruction_url && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg  flex items-center">
          <span className="mr-2">🔗</span>
          <div>
            <p className="font-semibold">Video Link</p>
            <a
              href={taskInstructions.video_instruction_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {taskInstructions.video_instruction_url}
            </a>
          </div>
        </div>
      )}
      {taskInstructions.audio_instruction_url && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg  flex items-center">
          <span className="mr-2">🔗</span>
          <div>
            <p className="font-semibold">Audio Link</p>
            <a
              href={taskInstructions.audio_instruction_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {taskInstructions.audio_instruction_url}
            </a>
          </div>
        </div>
      )}
      {showEditInstruction && (
        <EditTaskInstruction
          onCancel={() => {
            setShowEditInstruction(false);
            onCancel();
          }}
          taskId={taskInstructions.task_id}
          taskInstructions={taskInstructions}
          open={showEditInstruction}
          setOpen={setShowEditInstruction}
        />
      )}
      <div className="flex mr-10 justify-end mt-4 space-x-2 flex-row">
        <Button
          variant="outline"
          onClick={() => setShowEditInstruction(true)}
          className=" text-left px-4 py-2 text-primary hover:bg-gray-100 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="mr-2"
          >
            <path
              d="M11.7282 3.23796C12.3492 2.56515 12.6597 2.22875 12.9896 2.03252C13.7857 1.55905 14.766 1.54432 15.5754 1.99368C15.9108 2.17991 16.2308 2.50685 16.8709 3.16071C17.511 3.81458 17.8311 4.14151 18.0133 4.48419C18.4532 5.31101 18.4388 6.31241 17.9753 7.12566C17.7832 7.46271 17.4539 7.7799 16.7953 8.41425L8.95892 15.962C7.71082 17.1642 7.08675 17.7652 6.3068 18.0698C5.52685 18.3745 4.66942 18.3521 2.95455 18.3072L2.72123 18.3012C2.19917 18.2875 1.93814 18.2807 1.78641 18.1084C1.63467 17.9362 1.65538 17.6703 1.69682 17.1386L1.71932 16.8498C1.83592 15.353 1.89422 14.6047 2.18651 13.9319C2.47878 13.2592 2.98295 12.713 3.99127 11.6205L11.7282 3.23796Z"
              stroke="#095FAF"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            <path
              d="M10.8333 3.33325L16.6666 9.16659"
              stroke="#095FAF"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            <path
              d="M11.6667 18.3333H18.3334"
              stroke="#095FAF"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Edit
        </Button>
        <Button
          variant="outline"
          onClick={handleDelete}
          disabled={deleteInstruction.isPending}
          className=" text-left px-4 py-2 text-red-500 border  border-red-300 hover:bg-red-200 flex items-center"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M4.24996 8.99967H13.4166M16.2812 8.99967C16.2812 10.975 15.4965 12.8694 14.0998 14.2661C12.703 15.6629 10.8086 16.4476 8.83329 16.4476C6.85798 16.4476 4.96358 15.6629 3.56682 14.2661C2.17006 12.8694 1.38538 10.975 1.38538 8.99967C1.38538 7.02436 2.17006 5.12996 3.56682 3.7332C4.96358 2.33645 6.85798 1.55176 8.83329 1.55176C10.8086 1.55176 12.703 2.33645 14.0998 3.7332C15.4965 5.12996 16.2812 7.02436 16.2812 8.99967Z"
              stroke="#D03710"
              strokeWidth="1.25"
            />
          </svg>
          {deleteInstruction.isPending ? "Deleting..." : "Delete Instruction"}
        </Button>
      </div>
    </div>
  );
};

export default InstructionView;
