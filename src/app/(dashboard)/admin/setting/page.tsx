"use client";
import { useState, useEffect } from "react";
import AuthenticatedPage from "@/app/components/layout/AuthenticatedPage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScoreResponse, ScoreResponseChange } from "@/lib/hooks/usePayment";

interface UpdateTaskForm {
  scoreValue: number;
}
export default function UsersPage() {
  const [isEditing, setIsEditing] = useState(false);
  const {
    data: scoreData,
    isLoading: scoreDataLoading,
    error: scoreDataError,
  } = ScoreResponse();
  const balance = parseFloat((scoreData?.data.value_in_birr || 0).toString());
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const [formData, setFormData] = useState<UpdateTaskForm>({
    scoreValue: 0,
  });

  useEffect(() => {
    if (scoreData?.data.value_in_birr) {
      setFormData({ scoreValue: scoreData.data.value_in_birr });
    }
  }, [scoreData]);
  const updateScoreMutation = ScoreResponseChange();
  const handleSaveClick = () => {
    setIsEditing(false);
  };
  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateScoreMutation.mutateAsync({
        scoreValue: formData.scoreValue,
      });
      setIsEditing(false);
    } catch (error) {}
  };
  return (
    <AuthenticatedPage loadingMessage="Loading settings...">
      <div className="flex flex-col gap-6 w-full p-5 md:p-8">
        <Card className="flex flex-col gap-6 p-6 border border-gray-200 rounded-xl ">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Score Setting
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Set a unique password to protect your account.
              </p>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                className="ml-2 bg-white text-primary !border-primary hover:bg-gray-100 rounded-lg px-4 py-2"
                onClick={handleEditClick}
              >
                Change Setting
              </Button>
            ) : (
              <div className="flex justify-between">
                <Button variant="outline" className="bg-white" onClick={() => setIsEditing(!isEditing)}>
                  Cancel
                </Button>
                <Button
                  className="ml-2 px-4 py-2 rounded-lg"
                  onClick={handleChange}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
          {isEditing ? (
            <div className="flex items-center gap-4 p-4 ">
              <div className="flex flex-col flex-1">
                <label
                  htmlFor="score"
                  className="text-sm font-medium text-gray-700"
                >
                  Score
                </label>
                <input
                  type="number"
                  id="score"
                  value={1}
                  defaultValue={1}
                  className="mt-1"
                  readOnly
                />
              </div>
              <div className="flex items-center justify-center w-10 h-10 mt-6 text-gray-400">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 26 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 25C19.6274 25 25 19.6274 25 13C25 6.37258 19.6274 1 13 1C6.37258 1 1 6.37258 1 13C1 19.6274 6.37258 25 13 25Z"
                    fill="#EAECF0"
                    stroke="#89898D"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M18.3996 10.9434H8.87881C8.10361 10.9434 7.71481 10.9434 7.61881 10.731C7.52281 10.5198 7.79641 10.2702 8.34481 9.7722L10.0764 8.2002M7.59961 15.057H17.1204C17.8956 15.057 18.2844 15.057 18.3804 15.2694C18.4764 15.4806 18.2028 15.7302 17.6544 16.2282L15.9228 17.8002"
                    fill="#EAECF0"
                  />
                  <path
                    d="M18.3996 10.9434H8.87881C8.10361 10.9434 7.71481 10.9434 7.61881 10.731C7.52281 10.5198 7.79641 10.2702 8.34481 9.7722L10.0764 8.2002M7.59961 15.057H17.1204C17.8956 15.057 18.2844 15.057 18.3804 15.2694C18.4764 15.4806 18.2028 15.7302 17.6544 16.2282L15.9228 17.8002"
                    stroke="#89898D"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col flex-1">
                <label
                  htmlFor="amount"
                  className="text-sm font-medium text-gray-700"
                >
                  Amount
                </label>
                <Input
                  type="number"
                  id="amount"
                  className="mt-1"
                  value={formData.scoreValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scoreValue: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 ">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="0.34375"
                    y="0.34375"
                    width="43.3125"
                    height="43.3125"
                    rx="21.6562"
                    fill="#DDDFE3"
                  />
                  <rect
                    x="0.34375"
                    y="0.34375"
                    width="43.3125"
                    height="43.3125"
                    rx="21.6562"
                    stroke="#EBEBEB"
                    strokeWidth="0.6875"
                  />
                  <path
                    d="M12 14.5H18.7574C19.553 14.5 20.3161 14.8161 20.8787 15.3787L24 18.5"
                    stroke="#344054"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 23.5H12"
                    stroke="#344054"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.5 17.5L20.5 19.5C21.0523 20.0523 21.0523 20.9477 20.5 21.5C19.9477 22.0523 19.0523 22.0523 18.5 21.5L17 20C16.1393 20.8607 14.7767 20.9575 13.8029 20.2272L13.5 20"
                    stroke="#344054"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 21V25.5C15 27.3856 15 28.3284 15.5858 28.9142C16.1716 29.5 17.1144 29.5 19 29.5H28C29.8856 29.5 30.8284 29.5 31.4142 28.9142C32 28.3284 32 27.3856 32 25.5V22.5C32 20.6144 32 19.6716 31.4142 19.0858C30.8284 18.5 29.8856 18.5 28 18.5H19.5"
                    stroke="#344054"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M25.25 24C25.25 24.9665 24.4665 25.75 23.5 25.75C22.5335 25.75 21.75 24.9665 21.75 24C21.75 23.0335 22.5335 22.25 23.5 22.25C24.4665 22.25 25.25 23.0335 25.25 24Z"
                    stroke="#344054"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Birr per Score</h4>
                <p className="text-sm text-gray-500">
                  add score description here
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-lg font-semibold text-gray-900">
                  ETB {balance}
                </p>
                <p className="text-sm text-gray-500">Per point</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AuthenticatedPage>
  );
}
