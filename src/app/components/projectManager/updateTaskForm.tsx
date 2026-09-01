"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { TaskResponseData } from "@/app/types/project";
import { Basedata, BasedataTaskType } from "@/app/types/basedate";
import axios from "axios";
import { useBasedataall, useBasedataTaskType } from "@/lib/hooks/useBasedata";
import { toast } from "sonner";

interface UpdateTaskFormProps {
  task: TaskResponseData;
  onCancel: () => void;
}

interface DialectOption {
  id: string;
  name: string;
}

interface DialectResponse {
  message: string;
  code: number;
  data: DialectOption[];
}

interface UpdateTaskForm {
  id: string;
  max_contributor_per_micro_task: number;
  max_contributor_per_facilitator: number | null;
  max_dataset_per_reviewer: number | null;
  max_micro_task_per_contributor: number | null;
  minimum_seconds?: number | null;
  maximum_seconds?: number | null;
  contributor_completion_time_limit: number | null;
  reviewer_completion_time_limit: number | null;
  minimum_characters_length: number | null;
  maximum_characters_length: number | null;
  appriximate_time_per_batch: number | null;
  reviewer_payment_per_microtask: number | null;
  contributor_payment_per_microtask: number | null;
  max_retry_per_task: number | null;
  max_expected_no_of_contributors: number | null;
  batch: number | null;
  is_dialect_specific: boolean;
  dialects: { id: string }[];
  is_age_specific: boolean;
  age: { min: number | null; max: number | null };
  is_sector_specific: boolean;
  sector: { id: string }[];
  is_gender_specific: boolean;
  gender: { male: number; female: number };
  is_location_specific: boolean;
  location: { name: string };
}

const UpdateTask: React.FC<UpdateTaskFormProps> = ({ task, onCancel }) => {
  const [step, setStep] = useState(1);
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState<UpdateTaskForm>({
    id: task.id,
    max_contributor_per_micro_task:
      task.taskRequirement.max_contributor_per_micro_task,
    max_contributor_per_facilitator:
      task.taskRequirement.max_contributor_per_facilitator,
    minimum_characters_length: task.taskRequirement.minimum_characters_length ?? null,
    maximum_characters_length: task.taskRequirement.maximum_characters_length ?? null,
    maximum_seconds: task.taskRequirement.maximum_seconds ?? null,
    minimum_seconds: task.taskRequirement.minimum_seconds ?? null,
    max_expected_no_of_contributors: task.max_expected_no_of_contributors ?? null,
    max_dataset_per_reviewer: task.taskRequirement.max_dataset_per_reviewer,
    appriximate_time_per_batch: task.taskRequirement.appriximate_time_per_batch ?? null,
    reviewer_completion_time_limit:
      task?.reviewer_completion_time_limit != null
        ? task.reviewer_completion_time_limit / 24
        : null,
    contributor_completion_time_limit:
      task.contributor_completion_time_limit != null
        ? task.contributor_completion_time_limit / 24
        : null,
    reviewer_payment_per_microtask: task.payment?.reviewer_credit_per_microtask ?? null,
    contributor_payment_per_microtask: task.payment?.contributor_credit_per_microtask ?? null,
    max_retry_per_task: task.taskRequirement.max_retry_per_task,
    max_micro_task_per_contributor: task.taskRequirement.max_micro_task_per_contributor ?? null,
    batch: task.taskRequirement.batch ?? null,
    is_dialect_specific: task.taskRequirement.is_dialect_specific,
    dialects:
      task.taskRequirement.dialects?.map((dialect) => ({ id: dialect.id })) ||
      [],
    is_age_specific: task.taskRequirement.is_age_specific,
    age: task.taskRequirement.age || { min: null, max: null },
    is_sector_specific: task.taskRequirement.is_sector_specific,
    sector:
      task.taskRequirement.sectors?.map((sector) => ({ id: sector.name })) ||
      [],
    is_gender_specific: task.taskRequirement.is_gender_specific,
    gender: task.taskRequirement.gender || { male: 0, female: 0 },
    is_location_specific: task.taskRequirement.is_location_specific,
    location: task.taskRequirement.locations?.[0] || { name: "" },
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { data: languageData, isLoading: isLanguageLoading } = useBasedataall({
    servicename: "language",
  });
  const { data: sectorData, isLoading: isSectorLoading } = useBasedataall({
    servicename: "sector",
  });
  const { data: TaskTypeData, isLoading: isTaskTypeLoading } =
    useBasedataTaskType({
      servicename: "task-type",
    });

  const languageOptions =
    languageData?.data?.map((lang: Basedata) => ({
      id: lang.id,
      name: lang.name,
      code: lang.code,
      description: lang.description,
    })) || [];

  const { data: dialectResponseData, isLoading: regionsLoading } =
    useQuery<DialectResponse>({
      queryKey: ["dialect", task.language_id],
      queryFn: async () => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const response = await axios.get<DialectResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/dialect/language/${task.language_id}`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
        return response.data;
      },
      enabled: !!session?.access_token && !!task.language_id,
    });

  const sectorOptions =
    sectorData?.data?.map((sector: Basedata) => ({
      id: sector.id,
      name: sector.name,
    })) || [];

  const taskTypeOptions =
    TaskTypeData?.data?.map((taskType: BasedataTaskType) => ({
      id: taskType.id,
      name: taskType.task_type,
    })) || [];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else if (type === "number") {
      const numValue = value === "" ? null : Number(value);
      // Prevent negative values - allow positive, zero, and null
      if (numValue !== null && numValue < 0) {
        return; // Don't update state if value is negative
      }
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDialectToggle = (dialectId: string) => {
    setFormData((prev) => ({
      ...prev,
      dialects: prev.dialects.some((d) => d.id === dialectId)
        ? prev.dialects.filter((d) => d.id !== dialectId)
        : [...prev.dialects, { id: dialectId }],
    }));
    setErrors((prev) => ({ ...prev, dialects: "" }));
  };

  const handleNestedChange = (
    field: "age" | "gender",
    subField: string,
    value: number | null
  ) => {
    // Prevent negative values - allow positive, zero, and null
    if (value !== null && value < 0) {
      return; // Don't update state if value is negative
    }
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as { [key: string]: number | null }),
        [subField]: value,
      },
    }));
    setErrors((prev) => ({ ...prev, [`${field}.${subField}`]: "" }));
  };

  const handleArrayChange = (
    field: "dialects" | "sector" | "location",
    value: string
  ) => {
    if (field === "location") {
      setFormData((prev) => ({
        ...prev,
        location: { name: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].some((item) => item.id === value)
          ? prev[field]
          : [...prev[field], { id: value }],
      }));
    }
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        gender: {
          ...(prev.gender || { male: 0, female: 0 }),
          male: value === "Male" ? 100 : 0,
          female: value === "Female" ? 100 : 0,
        },
      }));
      setErrors((prev) => ({ ...prev, gender: "" }));
    }
  };

  const handleGenderPercentage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = Number(e.target.value);
    setFormData((prev) => {
      const isMaleSelected =
        prev.gender?.female === 100 ||
        (!prev.gender?.male && !prev.gender?.female);
      return {
        ...prev,
        gender: {
          ...(prev.gender || { female: 0, male: 0 }),
          female: isMaleSelected ? percentage : 100 - percentage,
          male: isMaleSelected ? 100 - percentage : percentage,
        },
      };
    });
    setErrors((prev) => ({ ...prev, gender: "" }));
  };

  const selectedTaskType = taskTypeOptions.find(
    (taskType: { id: string; name: string }) =>
      taskType.id === task.task_type_id
  );
  const isTextAudio = selectedTaskType?.name === "text-audio";

  const validateStep = (currentStep: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 1:
        if (formData.max_contributor_per_micro_task !== null && formData.max_contributor_per_micro_task < 0) {
          newErrors.max_contributor_per_micro_task = "Cannot be negative";
        } else if (!formData.max_contributor_per_micro_task || formData.max_contributor_per_micro_task <= 0) {
          newErrors.max_contributor_per_micro_task = "Must be greater than 0";
        }
        if (formData.max_contributor_per_facilitator !== null && formData.max_contributor_per_facilitator < 0) {
          newErrors.max_contributor_per_facilitator = "Cannot be negative";
        }
        if (formData.max_dataset_per_reviewer !== null && formData.max_dataset_per_reviewer < 0) {
          newErrors.max_dataset_per_reviewer = "Cannot be negative";
        }
        if (formData.contributor_completion_time_limit !== null && formData.contributor_completion_time_limit < 0) {
          newErrors.contributor_completion_time_limit = "Cannot be negative";
        }
        if (formData.reviewer_completion_time_limit !== null && formData.reviewer_completion_time_limit < 0) {
          newErrors.reviewer_completion_time_limit = "Cannot be negative";
        }
        if (formData.max_retry_per_task !== null && formData.max_retry_per_task < 0) {
          newErrors.max_retry_per_task = "Cannot be negative";
        }
        if (formData.appriximate_time_per_batch !== null && formData.appriximate_time_per_batch < 0) {
          newErrors.appriximate_time_per_batch = "Cannot be negative";
        } else if (!formData.appriximate_time_per_batch || formData.appriximate_time_per_batch <= 0) {
          newErrors.appriximate_time_per_batch = "Must be greater than 0";
        }
        if (formData.max_expected_no_of_contributors !== null && formData.max_expected_no_of_contributors < 0) {
          newErrors.max_expected_no_of_contributors = "Cannot be negative";
        }
        if (formData.max_micro_task_per_contributor !== null && formData.max_micro_task_per_contributor < 0) {
          newErrors.max_micro_task_per_contributor = "Cannot be negative";
        } else if (!formData.max_micro_task_per_contributor || formData.max_micro_task_per_contributor <= 0) {
          newErrors.max_micro_task_per_contributor = "Must be greater than 0";
        }
        if (formData.batch !== null && formData.batch < 0) {
          newErrors.batch = "Cannot be negative";
        }
      
        if (!isTextAudio) {
          if (formData.minimum_characters_length !== null && formData.minimum_characters_length < 0) {
            newErrors.minimum_characters_length = "Cannot be negative";
          } else if (
            (formData.minimum_characters_length
              ? formData.minimum_characters_length
              : 0) <= 0
          ) {
            newErrors.minimum_characters_length = "Must be greater than 0";
          }
          if (formData.maximum_characters_length !== null && formData.maximum_characters_length < 0) {
            newErrors.maximum_characters_length = "Cannot be negative";
          } else if (
            (formData.maximum_characters_length
              ? formData.maximum_characters_length
              : 0) <= 0
          ) {
            newErrors.maximum_characters_length = "Must be greater than 0";
          }
          if (
            (formData.minimum_characters_length
              ? formData.minimum_characters_length
              : 0) >=
            (formData.maximum_characters_length
              ? formData.maximum_characters_length
              : 0)
          ) {
            newErrors.minimum_characters_length =
              "Must be less than maximum characters length";
          }
        }
        if (isTextAudio) {
          if (formData.minimum_seconds !== null && formData.minimum_seconds !== undefined && formData.minimum_seconds < 0) {
            newErrors.minimum_seconds = "Cannot be negative";
          } else if ((formData.minimum_seconds ? formData.minimum_seconds : 0) <= 0) {
            newErrors.minimum_seconds = "Must be greater than 0";
          }
          if (formData.maximum_seconds !== null && formData.maximum_seconds !== undefined && formData.maximum_seconds < 0) {
            newErrors.maximum_seconds = "Cannot be negative";
          } else if ((formData.maximum_seconds ? formData.maximum_seconds : 0) <= 0) {
            newErrors.maximum_seconds = "Must be greater than 0";
          }
          if (
            formData.minimum_seconds !== null && 
            formData.minimum_seconds !== undefined &&
            formData.maximum_seconds !== null && 
            formData.maximum_seconds !== undefined &&
            formData.minimum_seconds >= formData.maximum_seconds
          ) {
            newErrors.minimum_seconds = "Must be less than maximum seconds";
          }
        }
        if (formData.batch && formData.max_micro_task_per_contributor && formData.batch > formData.max_micro_task_per_contributor) {
          newErrors.batch =
            "Must be less than maximum micro task per contributor";
        }
        break;
      case 2:
        if (formData.is_dialect_specific && !formData.dialects.length) {
          newErrors.dialects = "At least one dialect is required";
        }
        if (formData.is_age_specific) {
          if (formData.age?.min !== null && formData.age?.min !== undefined && formData.age.min < 0) {
            newErrors.age = "Age cannot be negative";
          } else if (formData.age?.max !== null && formData.age?.max !== undefined && formData.age.max < 0) {
            newErrors.age = "Age cannot be negative";
          } else if (!formData.age || !formData.age.min || !formData.age.max || formData.age.min <= 0 || formData.age.max <= 0) {
            newErrors.age = "Both min and max age must be greater than 0";
          } else if (formData.age.min >= formData.age.max) {
            newErrors.age = "Minimum age must be less than maximum age";
          }
        }
        if (formData.is_sector_specific && !formData.sector.length) {
          newErrors.sector = "At least one sector is required";
        }
        if (
          formData.is_gender_specific &&
          !formData.gender.male &&
          !formData.gender.female
        ) {
          newErrors.gender = "Please select a gender distribution";
        }
        if (formData.is_location_specific && !formData.location.name) {
          newErrors.location = "Location name is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const queryClient = useQueryClient();
  const updateTaskMutation = useMutation({
    mutationFn: async (taskData: UpdateTaskForm) => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/task/${taskData.id}/requirement`,
        {
          max_contributor_per_micro_task:
            taskData.max_contributor_per_micro_task,
          max_contributor_per_facilitator:
            taskData.max_contributor_per_facilitator,
          appriximate_time_per_batch: taskData.appriximate_time_per_batch,
          reviewer_payment_per_microtask:
            taskData.reviewer_payment_per_microtask,
          contributor_payment_per_microtask:
            taskData.contributor_payment_per_microtask,
          max_retry_per_task: taskData.max_retry_per_task,
          max_micro_task_per_contributor:
            taskData.max_micro_task_per_contributor,
          batch: taskData.batch,
          is_dialect_specific: taskData.is_dialect_specific,
          dialects: taskData.is_dialect_specific ? taskData.dialects : [],
          is_age_specific: taskData.is_age_specific,
          age: taskData.is_age_specific ? taskData.age : { min: 0, max: 0 },
          is_sector_specific: taskData.is_sector_specific,
          sector: taskData.is_sector_specific ? taskData.sector : [],
          maximum_characters_length: taskData.maximum_characters_length,
          minimum_characters_length: taskData.minimum_characters_length,
          contributor_completion_time_limit:
            taskData.contributor_completion_time_limit != null
              ? taskData.contributor_completion_time_limit * 24
              : null,
          reviewer_completion_time_limit:
            taskData.reviewer_completion_time_limit != null
              ? taskData.reviewer_completion_time_limit * 24
              : null,
          is_gender_specific: taskData.is_gender_specific,
          gender: taskData.is_gender_specific
            ? taskData.gender
            : { male: 0, female: 0 },
          is_location_specific: taskData.is_location_specific,
          location: taskData.is_location_specific
            ? taskData.location
            : { name: "" },
          ...(isTextAudio && {
            minimum_seconds: taskData.minimum_seconds,
            maximum_seconds: taskData.maximum_seconds,
          }),
        },
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Success", {
        description: "Task updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to update task";
        const errorDetails = error.response?.data?.errors
          ? JSON.stringify(error.response.data.errors)
          : "";
        toast.error("Error", {
          description: `${errorMessage}${errorDetails ? `: ${errorDetails}` : ""}`,
        });
      } else {
        toast.error("Error", {
          description: "An unexpected error occurred",
        });
      }
    },
  });

  const handleSubmit = async () => {
    if (validateStep(step)) {
      setIsSubmitting(true);
      try {
        await updateTaskMutation.mutateAsync(formData);
        setFormData({
          id: "",
          max_contributor_per_micro_task: 0,
          max_dataset_per_reviewer: 0,
          max_contributor_per_facilitator: null,
          appriximate_time_per_batch: 0,
          reviewer_payment_per_microtask: 0,
          contributor_payment_per_microtask: 0,
          max_retry_per_task: 0,
          max_expected_no_of_contributors: null,
          max_micro_task_per_contributor: 0,
          batch: 0,
          is_dialect_specific: false,
          maximum_characters_length: 0,
          minimum_characters_length: 0,
          reviewer_completion_time_limit: 0,
          contributor_completion_time_limit: 0,
          minimum_seconds: 0,
          maximum_seconds: 0,
          dialects: [],
          is_age_specific: false,
          age: { min: 0, max: 0 },
          is_sector_specific: false,
          sector: [],
          is_gender_specific: false,
          gender: { male: 0, female: 0 },
          is_location_specific: false,
          location: { name: "" },
        });
        onCancel();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep < step || validateStep(step)) {
      setStep(targetStep);
    }
  };

  const renderStep = () => {
    if (
      isLanguageLoading ||
      isSectorLoading ||
      isTaskTypeLoading ||
      regionsLoading
    ) {
      return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-4" />;
    }

    switch (step) {
      case 1:
        return (
          <div className="mb-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Task Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Maximum  Micro Task assignment per contributors {" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="max_contributor_per_micro_task"
                  type="number"
                  min="0"
                  value={formData.max_contributor_per_micro_task ?? ""}
                  onChange={handleChange}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.max_contributor_per_micro_task
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.max_contributor_per_micro_task && (
                  <p className="text-red-500 text-sm">
                    {errors.max_contributor_per_micro_task}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Maximum  contributors assignment per facilitator {" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="max_contributor_per_facilitator"
                  type="number"
                  min="0"
                  value={formData.max_contributor_per_facilitator ?? ""}
                  onChange={handleChange}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.max_contributor_per_facilitator
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.max_contributor_per_facilitator && (
                  <p className="text-red-500 text-sm">
                    {errors.max_contributor_per_facilitator}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Max dataset per reviewer{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="max_dataset_per_reviewer"
                  type="number"
                  min="0"
                  value={formData.max_dataset_per_reviewer ?? ""}
                  onChange={handleChange}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.max_dataset_per_reviewer
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.max_dataset_per_reviewer && (
                  <p className="text-red-500 text-sm">
                    {errors.max_dataset_per_reviewer}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contributors Completion Time in Days
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="contributor_completion_time_limit"
                  type="number"
                  min="0"
                  value={formData.contributor_completion_time_limit ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? null : Number(value);
                    // Prevent negative values - allow positive, zero, and null
                    if (numValue !== null && numValue < 0) {
                      return;
                    }
                    setFormData((prev) => ({
                      ...prev,
                      contributor_completion_time_limit: numValue,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      contributor_completion_time_limit: "",
                    }));
                  }}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.contributor_completion_time_limit
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.contributor_completion_time_limit && (
                  <p className="text-red-500 text-sm">
                    {errors.contributor_completion_time_limit}
                  </p>
                )}
                {errors.contributor_completion_time_limit && (
                  <p className="text-red-500 text-sm">
                    {errors.contributor_completion_time_limit}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Reviewer Completion time in Days
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="reviewer_completion_time_limit"
                  type="number"
                  min="0"
                  value={formData.reviewer_completion_time_limit ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? null : Number(value);
                    // Prevent negative values - allow positive, zero, and null
                    if (numValue !== null && numValue < 0) {
                      return;
                    }
                    setFormData((prev) => ({
                      ...prev,
                      reviewer_completion_time_limit: numValue,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      reviewer_completion_time_limit: "",
                    }));
                  }}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.reviewer_completion_time_limit
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.reviewer_completion_time_limit && (
                  <p className="text-red-500 text-sm">
                    {errors.reviewer_completion_time_limit}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Approximate time to finish task {" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="appriximate_time_per_batch"
                  type="number"
                  min="0"
                  value={formData.appriximate_time_per_batch ?? ""}
                  onChange={handleChange}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.appriximate_time_per_batch
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.appriximate_time_per_batch && (
                  <p className="text-red-500 text-sm">
                    {errors.appriximate_time_per_batch}
                  </p>
                )}
              </div>
              {!isTextAudio && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Characters Length{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="minimum_characters_length"
                      type="number"
                      min="0"
                      value={formData.minimum_characters_length ?? ""}
                      onChange={handleChange}
                      placeholder="Enter seconds"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.minimum_characters_length
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.minimum_characters_length && (
                      <p className="text-red-500 text-sm">
                        {errors.minimum_characters_length}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Maximum Characters Length{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="maximum_characters_length"
                      type="number"
                      min="0"
                      value={formData.maximum_characters_length ?? ""}
                      onChange={handleChange}
                      placeholder="Enter seconds"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.maximum_characters_length
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.maximum_characters_length && (
                      <p className="text-red-500 text-sm">
                        {errors.maximum_characters_length}
                      </p>
                    )}
                  </div>
                </>
              )}
              {isTextAudio && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Minimum Recording Length{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="minimum_seconds"
                      type="number"
                      min="0"
                      value={formData.minimum_seconds ?? ""}
                      onChange={handleChange}
                      placeholder="Enter seconds"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.minimum_seconds
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.minimum_seconds && (
                      <p className="text-red-500 text-sm">
                        {errors.minimum_seconds}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Maximum Audio Seconds{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="maximum_seconds"
                      type="number"
                      min="0"
                      value={formData.maximum_seconds ?? ""}
                      onChange={handleChange}
                      placeholder="Enter seconds"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.maximum_seconds
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.maximum_seconds && (
                      <p className="text-red-500 text-sm">
                        {errors.maximum_seconds}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Retry per mico Task <span className="text-red-500">*</span>
                </label>
                <input
                  name="max_retry_per_task"
                  type="number"
                  min="0"
                  required
                  value={formData.max_retry_per_task ?? ""}
                  onChange={handleChange}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.max_retry_per_task
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.max_retry_per_task && (
                  <p className="text-red-500 text-sm">
                    {errors.max_retry_per_task}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Expected Total contributors{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="max_expected_no_of_contributors"
                  type="number"
                  min="0"
                  value={formData.max_expected_no_of_contributors ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? null : Number(value);
                    // Prevent negative values - allow positive, zero, and null
                    if (numValue !== null && numValue < 0) {
                      return;
                    }
                    setFormData((prev) => ({
                      ...prev,
                      max_expected_no_of_contributors: numValue,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      max_expected_no_of_contributors: "",
                    }));
                  }}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.max_expected_no_of_contributors
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.max_expected_no_of_contributors && (
                  <p className="text-red-500 text-sm">
                    {errors.max_expected_no_of_contributors}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                 maximum assignment per contributor{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="max_micro_task_per_contributor"
                  type="number"
                  min="0"
                  required
                  value={formData.max_micro_task_per_contributor ?? ""}
                  onChange={handleChange}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.max_micro_task_per_contributor
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.max_micro_task_per_contributor && (
                  <p className="text-red-500 text-sm">
                    {errors.max_micro_task_per_contributor}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Batch Size <span className="text-red-500">*</span>
                </label>
                <input
                  name="batch"
                  type="number"
                  min="0"
                  required
                  value={formData.batch ?? ""}
                onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === "" ? null : Number(value);
                    // Prevent negative values - allow positive, zero, and null
                    if (numValue !== null && numValue < 0) {
                      return;
                    }
                    setFormData((prev) => ({
                      ...prev,
                      batch: numValue,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      batch: "",
                    }));
                  }}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.batch ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.batch && (
                  <p className="text-red-500 text-sm">{errors.batch}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="mb-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Contributor Requirements
            </h3>
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg border border-gray-100 ">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Dialect Specific <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_dialect_specific"
                        value="true"
                        checked={formData.is_dialect_specific === true}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            is_dialect_specific: true,
                          })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_dialect_specific"
                        value="false"
                        checked={formData.is_dialect_specific === false}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            is_dialect_specific: false,
                            dialects: [],
                          })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                {formData.is_dialect_specific && task.language_id && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Select Dialects <span className="text-red-500">*</span>
                    </label>
                    {dialectResponseData?.data?.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {dialectResponseData.data.map(
                          (dialect: { id: string; name: string }) => (
                            <label
                              key={dialect.id}
                              className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-100 hover:bg-blue-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.dialects.some(
                                  (d) => d.id === dialect.id
                                )}
                                onChange={() => handleDialectToggle(dialect.id)}
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">
                                {dialect.name}
                              </span>
                            </label>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No dialects available for this language
                      </p>
                    )}
                    {errors.dialects && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.dialects}
                      </p>
                    )}
                  </div>
                )}
                {formData.is_dialect_specific && !task.language_id && (
                  <p className="text-red-500 text-sm mt-2">
                    No language selected for this task. Please select a language
                    to view dialects.
                  </p>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100 ">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Gender Specific <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_gender_specific"
                        value="true"
                        checked={formData.is_gender_specific === true}
                        onChange={() =>
                          setFormData({ ...formData, is_gender_specific: true })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_gender_specific"
                        value="false"
                        checked={formData.is_gender_specific === false}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            is_gender_specific: false,
                          })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                {formData.is_gender_specific && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="mb-4">
                      <div className="flex items-center space-x-8 mb-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value="Male"
                            checked={formData.gender.male === 100}
                            onChange={handleGenderChange}
                            className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Male
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value="Female"
                            checked={formData.gender.female === 100}
                            onChange={handleGenderChange}
                            className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Female
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 31 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_1311_10918)">
                            <path
                              d="M11.1597 29.6402C11.1597 30.4047 11.6358 30.8802 12.3997 30.8802C13.1654 30.8802 13.6397 30.4047 13.6397 29.6402V17.8602H14.8797V29.6402C14.8797 30.4034 15.3552 30.8802 16.1197 30.8802C16.8841 30.8802 17.3597 30.4047 17.3597 29.6402V9.8002H17.9797V17.1249C17.9797 18.6098 19.8434 18.6098 19.8397 17.1249V9.59002C19.8397 7.9495 18.658 6.7002 16.7397 6.7002H11.7797C10.0313 6.7002 8.67969 7.76598 8.67969 9.54414V17.2402C8.67969 18.4802 10.5397 18.4802 10.5397 17.2402V9.8002H11.1597V29.6402Z"
                              fill="#2563EB"
                            />
                            <path
                              d="M14.1825 5.92481C15.595 5.92481 16.74 4.77978 16.74 3.36731C16.74 1.95485 15.595 0.809814 14.1825 0.809814C12.77 0.809814 11.625 1.95485 11.625 3.36731C11.625 4.77978 12.77 5.92481 14.1825 5.92481Z"
                              fill="#2563EB"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_1311_10918">
                              <rect
                                width="31"
                                height="31"
                                fill="white"
                                transform="translate(0 0.5)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                        <span className="text-sm text-gray-700">
                          Male {formData.gender?.male}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.gender?.male || 0}
                        onChange={handleGenderPercentage}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-center space-x-2">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 31 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_1311_10931)">
                            <path
                              d="M14.1825 5.92506C15.595 5.92506 16.74 4.78003 16.74 3.36756C16.74 1.95509 15.595 0.810059 14.1825 0.810059C12.77 0.810059 11.625 1.95509 11.625 3.36756C11.625 4.78003 12.77 5.92506 14.1825 5.92506Z"
                              fill="#2563EB"
                            />
                            <path
                              d="M20.4059 20.34L16.7424 10.273L16.7213 10.1695C16.7213 10.0225 16.8447 9.90349 16.9984 9.90349C17.1292 9.90349 17.239 9.99091 17.2681 10.1075L19.7587 16.62C19.9242 16.9926 20.605 17.24 21.0526 17.24C21.6509 17.24 21.7129 16.0651 21.6999 16L19.2093 9.57861C18.993 8.13959 17.5397 6.69995 15.8812 6.69995H12.6355C10.977 6.69995 9.41582 8.13959 9.19944 9.57861L6.8205 16C6.76656 16.1233 6.8205 17.24 7.46716 17.24C7.96998 17.24 8.63896 17.0645 8.7611 16.62L11.1636 10.0796C11.1843 10.0274 11.2203 9.98261 11.2669 9.95119C11.3135 9.91978 11.3684 9.90315 11.4246 9.90349C11.5778 9.90349 11.7011 10.0225 11.7011 10.1689L11.6838 10.2637L8.11444 20.34C8.10762 20.3697 8.11444 20.9296 8.11444 20.96C8.11444 21.1745 8.63214 21.58 8.8572 21.58H11.1599V29.6989C11.1599 30.3437 11.7278 30.88 12.3999 30.88C13.072 30.88 13.6399 30.343 13.6399 29.6989V21.5744C13.6399 21.3989 14.8799 21.4045 14.8799 21.58V29.64C14.8799 30.2848 15.4484 30.88 16.1199 30.88C16.7932 30.88 17.3599 30.2841 17.3599 29.64V21.58H19.7587C19.9831 21.58 20.4059 21.1745 20.4059 20.96C20.4059 20.9104 20.4239 20.3827 20.4059 20.34Z"
                              fill="#2563EB"
                            />
                          </g>
                          <defs>
                            <clipPath id="clip0_1311_10931">
                              <rect
                                width="31"
                                height="31"
                                fill="white"
                                transform="translate(0 0.5)"
                              />
                            </clipPath>
                          </defs>
                        </svg>
                        <span className="text-sm text-gray-700">
                          Female {formData.gender?.female}%
                        </span>
                      </div>
                    </div>
                    {errors.gender && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.gender}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100 ">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Age Specific <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_age_specific"
                        value="true"
                        checked={formData.is_age_specific === true}
                        onChange={() =>
                          setFormData({ 
                            ...formData, 
                            is_age_specific: true,
                            age: formData.age || { min: null, max: null }
                          })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_age_specific"
                        value="false"
                        checked={formData.is_age_specific === false}
                        onChange={() =>
                          setFormData({ ...formData, is_age_specific: false })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                {formData.is_age_specific && (
                  <div className="mt-3 p-4 rounded-lg border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Age Range
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Minimum Age
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.age?.min ?? ""}
                          onChange={(e) =>
                            handleNestedChange(
                              "age",
                              "min",
                              e.target.value === "" ? null : Number(e.target.value)
                            )
                          }
                          className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                            errors.age
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 hover:border-green-400"
                          }`}
                          placeholder=""
                        />
                      </div>
                      <div className="flex items-center justify-center px-2">
                        <span className="text-gray-400 font-medium">to</span>
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Maximum Age
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.age?.max ?? ""}
                          onChange={(e) =>
                            handleNestedChange(
                              "age",
                              "max",
                              e.target.value === "" ? null : Number(e.target.value)
                            )
                          }
                          className={`w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
                            errors.age
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 hover:border-green-400"
                          }`}
                          placeholder=""
                        />
                      </div>
                    </div>
                    {errors.age && (
                      <p className="text-red-500 text-sm mt-3 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.age}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100 ">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Sector Specific <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_sector_specific"
                        value="true"
                        checked={formData.is_sector_specific === true}
                        onChange={() =>
                          setFormData({ ...formData, is_sector_specific: true })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_sector_specific"
                        value="false"
                        checked={formData.is_sector_specific === false}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            is_sector_specific: false,
                            sector: [],
                          })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                {formData.is_sector_specific && (
                  <div className="mt-3 p-4 rounded-lg border w-2/4 border-gray-100">
                    <label className="block m-3 text-sm font-semibold text-gray-800 mb-3">
                      Select Sectors <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="sector"
                      multiple
                      value={formData.sector.map((s) => s.id)}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions
                        ).map((option) => option.value);
                        setFormData((prev) => ({
                          ...prev,
                          sector: selectedOptions.map((id) => ({ id })),
                        }));
                        setErrors((prev) => ({ ...prev, sector: "" }));
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.sector ? "border-red-500" : "border-gray-300"
                      }`}
                      style={{ minHeight: "100px", maxHeight: "150px" }}
                    >
                      {sectorOptions.map(
                        (sector: { id: string; name: string }) => (
                          <option
                            className="px-3 m-1 py-2 border border-gray-100 rounded-xl"
                            key={sector.id}
                            value={sector.id}
                          >
                            {sector.name}
                          </option>
                        )
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      Hold Ctrl/Cmd to select multiple sectors
                    </p>
                    {errors.sector && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.sector}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-100 ">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Location Specific <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_location_specific"
                        value="true"
                        checked={formData.is_location_specific === true}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            is_location_specific: true,
                          })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="is_location_specific"
                        value="false"
                        checked={formData.is_location_specific === false}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            is_location_specific: false,
                            location: { name: "" },
                          })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                {formData.is_location_specific && (
                  <div className="mt-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Location Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location.name}
                      onChange={(e) =>
                        handleArrayChange("location", e.target.value)
                      }
                      placeholder="Enter location name (e.g., New York, London, Tokyo)"
                      className={`w-full p-4 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white ${
                        errors.location
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 hover:border-orange-400"
                      }`}
                    />
                    {errors.location && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.location}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!session?.access_token) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Authentication required. Please sign in to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 mb-4 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.5 5L7.5 10L12.5 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm font-medium">  Back</span>
      </button>
      <h2 className="mt-3 mb-8 text-2xl font-semibold text-gray-800">
        Update Task
      </h2>
      <div className="flex items-center mb-8">
        <div className="flex-1 flex items-center space-x-4">
          <div className="flex items-center">
            <button
              onClick={() => handleStepClick(1)}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold transition-colors ${
                step >= 1
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              1
            </button>
            <span className="ml-2 text-sm text-gray-600">Task Details</span>
          </div>
          <div
            className={`h-1 w-24 ${step >= 2 ? "bg-green-500" : "bg-blue-500"}`}
          />
          <div className="flex items-center">
            <button
              onClick={() => handleStepClick(2)}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold transition-colors ${
                step >= 2
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              2
            </button>
            <span className="ml-2 text-sm text-gray-600">
              Task Configuration
            </span>
          </div>
        </div>
      </div>
      {renderStep()}
      <div className="flex justify-end gap-4 mt-8">
        {step >= 1 && (
          <Button
            onClick={() => onCancel()}
            className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors"
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
        {step < 2 && (
          <Button
            onClick={handleNextStep}
            className="bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            disabled={isSubmitting}
          >
            Continue
          </Button>
        )}
        {step === 2 && (
          <Button
            onClick={handleSubmit}
            className="bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              "Update Task"
            )}
          </Button>
        )}
        {step === 2 && (
          <Button
            className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default UpdateTask;
