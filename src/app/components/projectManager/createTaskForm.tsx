import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Basedata, BasedataTaskType } from "@/app/types/basedate";
import axios from "axios";
import {
  useBasedataall,
  useBasedataTaskType,
} from "@/lib/hooks/useBasedata";

interface CreateTaskFormProps {
  onSubmit: (formData: CreateTaskForm) => void;
  onCancel: () => void;
  projectId: string;
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

interface CreateTaskForm {
  name: string;
  description: string;
  project_id: string;
  task_type_id: string;
  language_id: string;
  is_public: boolean;
  require_contributor_test: boolean;
  max_contributor_per_micro_task: number | null;
  max_expected_no_of_contributors: number | null;
  max_dataset_per_reviewer: number | null;
  max_contributor_per_facilitator: number | null;
  max_micro_task_per_contributor: number | null;
  minimum_seconds?: number | null;
  maximum_seconds?: number | null;
  appriximate_time_per_batch: number | null;
  minimum_characters_length: number | null;
  maximum_characters_length: number | null;
  contributor_completion_time_limit: number | null;
  reviewer_completion_time_limit: number | null;
  reviewer_payment_per_microtask: number | null;
  contributor_payment_per_microtask: number | null;
  max_retry_per_task: number | null;
  batch: number | null;
  is_dialect_specific: boolean;
  dialects?: string[];
  is_age_specific: boolean;
  age?: { min: number; max: number };
  is_sector_specific: boolean;
  sectors?: string[];
  is_gender_specific: boolean;
  gender?: { male: number; female: number };
  is_location_specific: boolean;
  locations?: { name: string }[];
}
const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  onSubmit,
  onCancel,
  projectId,
}) => {
  const [step, setStep] = useState(1);
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAudioInput, setIsAudioInput] = useState(false);
  const [formData, setFormData] = useState<CreateTaskForm>({
    name: "",
    description: "",
    project_id: projectId,
    max_expected_no_of_contributors: null,
    task_type_id: "",
    language_id: "",
    is_public: false,
    reviewer_completion_time_limit: null,
    contributor_completion_time_limit: null,
    minimum_characters_length: null,
    maximum_characters_length: null,
    max_dataset_per_reviewer: null,
    max_contributor_per_micro_task: null,
    max_contributor_per_facilitator: null,
    require_contributor_test: false,
    appriximate_time_per_batch: null,
    reviewer_payment_per_microtask: null,
    contributor_payment_per_microtask: null,
    max_retry_per_task: null,
    max_micro_task_per_contributor: null,
    batch: null,
    is_dialect_specific: false,
    dialects: [],
    is_age_specific: false,
    age: undefined,
    is_sector_specific: false,
    sectors: [],
    is_gender_specific: false,
    gender: { male: 0, female: 0 },
    is_location_specific: false,
    locations: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { data: languageData, isLoading: isLanguageLoading } = useBasedataall({
    servicename: "language",
  });
  // Always call the hook, but disable it unless language_id is set and is_dialect_specific is true

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

  const dialectOptions: DialectOption[] = [];
  const { data: dialectResponseData, isLoading: regionsLoading } =
    useQuery<DialectResponse>({
      queryKey: ["dialect", formData.language_id],
      queryFn: async () => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const response = await axios.get<DialectResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/dialect/language/${formData.language_id}`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
        return response.data;
      },
      enabled: !!session?.access_token && !!formData.language_id, // Only fetch when country_id is set
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
      dialects: prev.dialects?.includes(dialectId)
        ? prev.dialects.filter((id) => id !== dialectId)
        : [...(prev.dialects || []), dialectId],
    }));
    setErrors((prev) => ({ ...prev, dialects: "" }));
  };

  const handleNestedChange = (
    field: "age" | "gender",
    subField: string,
    value: number
  ) => {
    // Prevent negative values - allow positive, zero, and null
    if (value < 0) {
      return; // Don't update state if value is negative
    }
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as { [key: string]: number }),
        [subField]: value,
      },
    }));
    setErrors((prev) => ({ ...prev, [`${field}.${subField}`]: "" }));
  };

  const handleArrayChange = (
    field: "dialects" | "sectors" | "locations",
    value: string
  ) => {
    if (field === "locations") {
      const values = value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
      const newLocations = values.map((name) => ({ name }));
      setFormData((prev) => ({
        ...prev,
        locations: newLocations,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: formData[field]?.includes(value)
          ? formData[field]
          : [...(formData[field] || []), value],
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
      taskType.id === formData.task_type_id
  );
  const isTextAudio = selectedTaskType?.name === "text-audio";
  const validateStep = (currentStep: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = "Task name is required";
        }
        if (!formData.task_type_id) {
          newErrors.task_type_id = "Task type is required";
        }
        if (!formData.language_id) {
          newErrors.language_id = "Language is required";
        }
        break;
      case 2:
        if (!formData.max_contributor_per_micro_task || formData.max_contributor_per_micro_task <= 0) {
          newErrors.max_contributor_per_micro_task = "Must be greater than 0";
        }

        if (!formData.max_dataset_per_reviewer || formData.max_dataset_per_reviewer <= 0) {
          newErrors.max_dataset_per_reviewer = "Must be greater than 0";
        }
        if (formData.max_retry_per_task === null || formData.max_retry_per_task < 0) {
          newErrors.max_retry_per_task = "Cannot be negative";
        }
        if (!formData.appriximate_time_per_batch || formData.appriximate_time_per_batch <= 0) {
          newErrors.approximate_time_per_batch = "Must be greater than 0";
        }
        if (isTextAudio) {
          if ((formData.minimum_seconds ? formData.minimum_seconds : 0) <= 0) {
            newErrors.minimum_seconds = "Must be greater than 0";
          }
          if ((formData.maximum_seconds ? formData.maximum_seconds : 0) <= 0) {
            newErrors.maximum_seconds = "Must be greater than 0";
          }
          if (
            (formData.minimum_seconds ? formData.minimum_seconds : 0) >=
            (formData.maximum_seconds ? formData.maximum_seconds : 0)
          ) {
            newErrors.minimum_seconds = "Must be less than maximum seconds";
          }
        }
        if (!isTextAudio) {
          if (
            (formData.minimum_characters_length
              ? formData.minimum_characters_length
              : 0) <= 0
          ) {
            newErrors.minimum_characters_length = "Must be greater than 0";
          }
          if (
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
        if (!formData.max_micro_task_per_contributor || formData.max_micro_task_per_contributor <= 0) {
          newErrors.max_micro_task_per_contributor = "Must be greater than 0";
        }

        if (formData.batch !== null && formData.batch <= 0) {
          newErrors.batch = "Must be greater than 0";
        }
        if (formData.batch !== null && formData.max_micro_task_per_contributor && formData.batch > formData.max_micro_task_per_contributor) {
          newErrors.batch =
            "Must be less than or equals to maximum micro task per contributor";
        }
        break;
      case 3:
        if (formData.is_dialect_specific && !formData.dialects?.length) {
          newErrors.dialects = "At least one dialect is required";
        }
        if (formData.is_age_specific) {
          if (!formData.age || !formData.age.min || !formData.age.max || formData.age.min <= 0 || formData.age.max <= 0) {
            newErrors.age = "Both min and max age must be greater than 0";
          } else if (formData.age.min >= formData.age.max) {
            newErrors.age = "Minimum age must be less than maximum age";
          }
        }
        if (formData.is_sector_specific && !formData.sectors?.length) {
          newErrors.sectors = "At least one sector is required";
        }
        if (
          formData.is_gender_specific &&
          !formData.gender?.male &&
          !formData.gender?.female
        ) {
          newErrors.gender = "Please select a gender distribution";
        }
        if (formData.is_location_specific && !formData.locations?.length) {
          newErrors.locations = "At least one location is required";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateStep(3)) {
      setIsSubmitting(true);
      try {
        await onSubmit({
          ...formData,
          contributor_completion_time_limit:
            (formData.contributor_completion_time_limit ?? 0) * 24,
        });
        setFormData({
          name: "",
          description: "",
          project_id: projectId,
          reviewer_completion_time_limit: null,
          contributor_completion_time_limit: null,
          max_expected_no_of_contributors: null,
          task_type_id: "",
          language_id: "",
          is_public: false,
          max_dataset_per_reviewer: null,
          max_contributor_per_micro_task: 1,
          maximum_characters_length: null,
          minimum_characters_length: null,
          require_contributor_test: false,
          max_contributor_per_facilitator: null,
          appriximate_time_per_batch: null,
          reviewer_payment_per_microtask: null,
          contributor_payment_per_microtask: null,
          max_retry_per_task: 0,
          max_micro_task_per_contributor: null,
          batch: null,
          is_dialect_specific: false,
          dialects: [],
          is_age_specific: false,
          age: undefined,
          is_sector_specific: false,
          sectors: [],
          is_gender_specific: false,
          gender: { male: 0, female: 0 },
          is_location_specific: false,
          locations: [],
        });
        setErrors({});
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
    if (isLanguageLoading || isSectorLoading || isTaskTypeLoading) {
      return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-4" />;
    }

    switch (step) {
      case 1:
        return (
          <div className="mb-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Task Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter task name"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Task Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="task_type_id"
                  value={formData.task_type_id}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.task_type_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select task type</option>
                  {taskTypeOptions.map(
                    (task_type: { id: string; name: string }) => (
                      <option key={task_type.id} value={task_type.id}>
                        {task_type.name}
                      </option>
                    )
                  )}
                </select>
                {errors.task_type_id && (
                  <p className="text-red-500 text-sm">{errors.task_type_id}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  name="language_id"
                  required
                  value={formData.language_id}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.language_id ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select language</option>
                  {languageOptions.map((lang: Basedata) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                {errors.language_id && (
                  <p className="text-red-500 text-sm">{errors.language_id}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="mb-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Task Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Public (any contributor can join)
                  </span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    name="require_contributor_test"
                    type="checkbox"
                    checked={formData.require_contributor_test}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Require contributor test
                  </span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  maximum submission per microtask {" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
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
                  Maximum assignment per reviewer{" "}
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
                  Maximum  contributors assignment per facilitator  {" "}
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
                  Reviewer payment  per review{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="reviewer_payment_per_microtask"
                  type="number"
                  min="0"
                  value={formData.reviewer_payment_per_microtask ?? ""}
                  onChange={handleChange}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.reviewer_payment_per_microtask
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.reviewer_payment_per_microtask && (
                  <p className="text-red-500 text-sm">
                    {errors.reviewer_payment_per_microtask}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contributor payment per approved contribution{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="contributor_payment_per_microtask"
                  type="number"
                  min="0"
                  value={formData.contributor_payment_per_microtask ?? ""}
                  onChange={handleChange}
                  placeholder="Enter number"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.contributor_payment_per_microtask
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.contributor_payment_per_microtask && (
                  <p className="text-red-500 text-sm">
                    {errors.contributor_payment_per_microtask}
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
                  Maximum microtasks per contributor{" "}
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
      case 3:
        return (
          <div className="mb-6 space-y-8">
            <h3 className="text-lg font-semibold text-gray-800">
              Contributor Requirements
            </h3>
            <div className="space-y-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Dialect Specific <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-8 mt-2 mb-10 gap-50">
                    <label className="flex items-center">
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
                    <label className="flex items-center">
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
                {formData.is_dialect_specific && formData.language_id && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Dialects <span className="text-red-500">*</span>
                    </label>
                    {formData.language_id && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-100">
                        {dialectResponseData?.data.map(
                          (dialect: { id: string; name: string }) => (
                            <label
                              key={dialect.id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={formData.dialects?.includes(
                                  dialect.id
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
                    )}
                    {errors.dialects && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.dialects}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender Specific <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-8 mt-2 gap-50">
                    <label className="flex items-center">
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
                    <label className="flex items-center">
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
                  <div className="space-y-4">
                    <div className="flex items-center space-x-8">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender?.male === 100}
                          onChange={handleGenderChange}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Male</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender?.female === 100}
                          onChange={handleGenderChange}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Female
                        </span>
                      </label>
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
                      <p className="text-red-500 text-sm">{errors.gender}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Age Specific <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-8 mt-2 gap-50">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_age_specific"
                        value="true"
                        checked={formData.is_age_specific === true}
                        onChange={() =>
                          setFormData({ 
                            ...formData, 
                            is_age_specific: true,
                            age: formData.age && formData.age.min > 0 ? formData.age : undefined
                          })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_age_specific"
                        value="false"
                        checked={formData.is_age_specific === false}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            is_age_specific: false,
                          })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                {formData.is_age_specific && (
                  <div className="flex items-center space-x-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Min Age
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.age?.min ?? ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "age",
                            "min",
                            Number(e.target.value)
                          )
                        }
                        className={`w-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.age ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Max Age
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.age?.max ?? ""}
                        onChange={(e) =>
                          handleNestedChange(
                            "age",
                            "max",
                            Number(e.target.value)
                          )
                        }
                        className={`w-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.age ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.age && (
                      <p className="text-red-500 text-sm">{errors.age}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sector Specific <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-8 mt-2 gap-50">
                    <label className="flex items-center">
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
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_sector_specific"
                        value="false"
                        checked={formData.is_sector_specific === false}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            is_sector_specific: false,
                          })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                {formData.is_sector_specific && (
                  <div className="space-y-2">
                    <select
                      name="sectors"
                      multiple
                      value={formData.sectors || []}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions
                        ).map((option) => option.value);
                        setFormData((prev) => ({
                          ...prev,
                          sectors: selectedOptions,
                        }));
                        setErrors((prev) => ({ ...prev, sectors: "" }));
                      }}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.sectors ? "border-red-500" : "border-gray-300"
                      }`}
                      style={{ minHeight: "100px" }}
                    >
                      {sectorOptions.map(
                        (sector: { id: string; name: string }) => (
                          <option key={sector.id} value={sector.id}>
                            {sector.name}
                          </option>
                        )
                      )}
                    </select>
                    {errors.sectors && (
                      <p className="text-red-500 text-sm">{errors.sectors}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Location Specific <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-8 mt-2 gap-50">
                    <label className="flex items-center">
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
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="is_location_specific"
                        value="false"
                        checked={formData.is_location_specific === false}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            is_location_specific: false,
                          })
                        }
                        className="h-4 w-4 text-primary border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
                {formData.is_location_specific && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={
                        formData.locations?.map((l) => l.name).join(", ") || ""
                      }
                      onChange={(e) =>
                        handleArrayChange("locations", e.target.value)
                      }
                      placeholder="Enter locations (comma-separated)"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.locations ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.locations && (
                      <p className="text-red-500 text-sm">{errors.locations}</p>
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

  return (
    <div className="p-6">
      <button
        onClick={onCancel}
        className="flex items-center gap-2 -mt-14 mb-4 px-1 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
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
        <span className="text-sm font-medium">Back to Tasks</span>
      </button>
      <h2 className="mt-3 mb-8 text-2xl font-semibold text-gray-800">
        Create Task
      </h2>
      <div className="flex items-center mb-8">
        <div className="flex-1 flex items-center space-x-4">
          <div className="flex items-center">
            <button
              onClick={() => handleStepClick(1)}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold transition-colors ${
                step === 1
                  ? "bg-primary hover:bg-primary-dark" // Active step
                  : step > 1
                    ? "bg-green-500 hover:bg-green-600" // Completed step
                    : "bg-gray-300 hover:bg-gray-600" // Inactive step or step < 1
              }`}
            >
              1
            </button>
            <span className="ml-2 text-sm text-gray-600">Task Details</span>
          </div>
          <div
            className={`h-1 w-26 ${step === 2 ? "bg-primary" : step > 2 ? "bg-green-500" : "bg-gray-300"}`}
          />
          <div className="flex items-center">
            <button
              onClick={() => handleStepClick(2)}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold transition-colors ${
                step === 2
                  ? "bg-primary hover:bg-primary-dark" // Active step
                  : step > 2
                    ? "bg-green-500 hover:bg-green-600" // Completed step
                    : "bg-gray-300 hover:bg-gray-600" // Inactive step or step < 2
              }`}
            >
              2
            </button>
            <span className="ml-2 text-sm text-gray-600">
              Task Configuration
            </span>
          </div>
          <div
            className={`h-1 w-26 ${step === 3 ? "bg-primary" : step > 3 ? "bg-green-500" : "bg-gray-300"}`}
          />
          <div className="flex items-center">
            <button
              onClick={() => handleStepClick(3)}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold transition-colors ${
                step === 3
                  ? "bg-primary hover:bg-primary-dark" // Active step
                  : step > 3
                    ? "bg-green-500 hover:bg-green-600" // Completed step
                    : "bg-gray-300 hover:bg-gray-600" // Inactive step or step < 3
              }`}
            >
              3
            </button>
            <span className="ml-2 text-sm text-gray-600">
              Contributor Requirements
            </span>
          </div>
        </div>
      </div>
      {renderStep()}
      <div className="flex justify-end gap-4 mt-8">
        {step > 1 && (
          <Button
            onClick={() => setStep(step - 1)}
            className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors"
            disabled={isSubmitting}
          >
            Back
          </Button>
        )}
        {step < 3 ? (
          <Button
            onClick={handleNextStep}
            className="bg-primary text-white hover:bg-blue-600 transition-colors"
            disabled={isSubmitting}
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="bg-primary text-white hover:bg-blue-600 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              "Create Task"
            )}
          </Button>
        )}
        {step === 3 && (
          <Button
            onClick={onCancel}
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

export default CreateTaskForm;
