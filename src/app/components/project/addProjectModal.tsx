import React, { useRef, useState } from "react";
import { X, Calendar, Users, Loader2 } from "lucide-react";
import { userRoleProfiles } from "@/lib/hooks/useFetchUser";
import { useAddProject } from "@/lib/hooks/useProject";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface AddProjectModalProps {
  onClose: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    media: null as File | null,
    projectManagers: [] as string[],
  });

  // --- NEW: Tags State ---
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");
  const [dateError, setDateError] = useState("");
  const [nameError, setNameError] = useState("");
  const [imageError, setImageError] = useState("");
  const [managerError, setManagerError] = useState("");
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedTaskSearch = useDebounce(taskSearchQuery, 500);
  const [verificationStatus, setVerificationStatus] = useState<string>();

  const { data: usersData, isLoading: isUserLoading } = userRoleProfiles({
    page,
    pageSize,
    searchQuery: debouncedTaskSearch,
    verificationStatus,
    role: "project_manager",
  });

  const addProjectMutation = useAddProject();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "startDate" || name === "endDate") setDateError("");
    if (name === "name") setNameError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, media: e.target.files![0] }));
      setImageError("");
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddManualEmail = () => {
    if (validateEmail(manualEmail)) {
      setFormData((prev) => ({
        ...prev,
        projectManagers: [manualEmail],
      }));
      setManualEmail("");
      setShowUserDropdown(false);
      setManagerError("");
    } else {
      toast.error("Please enter a valid email address.");
    }
  };

  const handleAddManager = (user: { id: string; email: string }) => {
    setFormData((prev) => ({
      ...prev,
      projectManagers: [user.email],
    }));
    setManagerError("");
    setSearchQuery("");
    setShowUserDropdown(false);
  };

  const handleRemoveManager = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      projectManagers: prev.projectManagers.filter((mgr) => mgr !== email),
    }));
    if (formData.projectManagers.length === 1) {
      setManagerError("At least one project manager is required.");
    }
  };

  // --- NEW: Tag Handlers ---
  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    if (!formData.name.trim()) {
      setNameError("Project name is required.");
      hasError = true;
    }
    if (!formData.media) {
      setImageError("An image is required.");
      hasError = true;
    }
    if (!formData.projectManagers.length) {
      setManagerError("At least one project manager is required.");
      hasError = true;
    }
    if (new Date(formData.startDate) < new Date(new Date().toDateString())) {
      toast.error("Start date cannot be in the past.");
      hasError = true;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setDateError("End date must be on or after start date.");
      hasError = true;
    }

    if (hasError) return;

    try {
      if (process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      await addProjectMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        start_date: formData.startDate,
        end_date: formData.endDate,
        manager_email: formData.projectManagers[0],
        status: "active",
        image: formData.media,
        tags, // Send tags
      });
      onClose();
    } catch (error) {
      if ((error as any)?.response?.data?.message) {
        toast.error("Error", {
          description: (error as any).response.data.message,
        });
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-80 z-100 flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg sm:max-w-[700px] w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-200 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-20"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Add Project</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {addProjectMutation.isPending && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="mt-2 text-sm text-gray-700">Saving...</span>
              </div>
            </div>
          )}

          <form id="project-other-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  nameError ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-1">{nameError}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            {/* Dates */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                      dateError ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                      dateError ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            {dateError && (
              <p className="text-red-500 text-sm mt-1">{dateError}</p>
            )}

            {/* Media */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Media
              </label>
              <div
                className={`border border-dashed rounded-md p-4 text-center ${
                  imageError ? "border-red-500" : "border-gray-300"
                }`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="media-upload"
                  ref={mediaInputRef}
                  accept="image/*,video/*"
                  multiple={false}
                />
                <label
                  htmlFor="media-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <svg
                    className="h-6 w-6 text-gray-500 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16V12m0 0V8m0 4h4m0 0h4m-8 0H3m18 0h-4m-4 4v4m0-4v-4m4 0h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">
                    Drag & Drop a file
                  </span>
                  <span className="text-xs text-gray-400">
                    Minimum 1MB and MAX 10MB each file can be uploaded
                  </span>
                </label>
                {formData.media && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(formData.media)}
                      alt="Selected Media"
                      className="max-h-40 mx-auto rounded-md"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  className="mt-2 px-4 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Browse Files
                </button>
              </div>
              {imageError && (
                <p className="text-red-500 text-sm mt-1">{imageError}</p>
              )}
            </div>

            {/* --- NEW: Tags Input with Button --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Enter a tag..."
                  className="flex-1 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-l-md"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary text-white text-sm hover:bg-blue-700 rounded-r-md transition"
                >
                  Add Tag
                </button>
              </div>

              {/* Tags Display Below */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-1">
                Press Enter or click "Add Tag" to add.
              </p>
            </div>

            {/* Project Manager Section (unchanged) */}
            <div>
              <div className="flex justify-between items-center mb-2 border border-gray-200 rounded-2xl px-2 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#F0EFFF] flex items-center justify-center rounded-full">
                    <span className="text-primary font-medium text-sm">PM</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Invite Project Manager
                    </h3>
                    <p className="text-xs text-gray-500 mr-4 ">
                      Invite a project manager to oversee the project
                    </p>
                  </div>
                </div>
                <span className="text-sm border text-primary rounded-2xl border-gray-200 px-2 py-3">
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-1 text-primary hover:text-blue-800"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.774 18C21.5233 18 22.1193 17.5285 22.6544 16.8691C23.7499 15.5194 21.9513 14.4408 21.2653 13.9126C20.568 13.3756 19.7894 13.0714 19 13M18 11C19.3807 11 20.5 9.88071 20.5 8.5C20.5 7.11929 19.3807 6 18 6"
                        stroke="#095FAF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M3.22596 18C2.47665 18 1.88067 17.5285 1.34554 16.8691C0.250091 15.5194 2.04867 14.4408 2.73464 13.9126C3.43197 13.3756 4.21058 13.0714 5 13M5.5 11C4.11929 11 3 9.88071 3 8.5C3 7.11929 4.11929 6 5.5 6"
                        stroke="#095FAF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8.08356 15.1112C7.06178 15.743 4.38274 17.0331 6.01446 18.6474C6.81154 19.436 7.69928 20 8.81538 20H15.1842C16.3003 20 17.188 19.436 17.9851 18.6474C19.6168 17.0331 16.9378 15.743 15.916 15.1112C13.5199 13.6296 10.4796 13.6296 8.08356 15.1112Z"
                        stroke="#095FAF"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15.5 7.5C15.5 9.433 13.933 11 12 11C10.067 11 8.5 9.433 8.5 7.5C8.5 5.567 10.067 4 12 4C13.933 4 15.5 5.567 15.5 7.5Z"
                        stroke="#095FAF"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span>Invite Project Manager</span>
                  </button>
                </span>
              </div>

              {/* ... rest of manager dropdown (unchanged) ... */}
              {showUserDropdown && (
                <div className="mb-4 border border-gray-100 rounded-md p-3">
                  <div className="mb-3">
                    <input
                      type="email"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="Enter email manually..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      onClick={handleAddManualEmail}
                      className="mt-2 w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                    >
                      Add Email
                    </Button>
                    <div className="mt-4">
                      <input
                        type="text"
                        value={taskSearchQuery}
                        onChange={(e) => {
                          setTaskSearchQuery(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search project managers..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {isUserLoading ? (
                    <div className="text-center py-4">Loading users...</div>
                  ) : (usersData?.data?.result ?? []).length > 0 ? (
                    <div className="max-h-40 overflow-y-auto">
                      {usersData?.data?.result?.map((user: any) => (
                        <div
                          key={user.id}
                          onClick={() => handleAddManager(user)}
                          className={`flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer ${
                            formData.projectManagers.includes(user.email)
                              ? "bg-blue-50"
                              : ""
                          }`}
                        >
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {user.name?.charAt(0) || user.email?.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {user.first_name || "No name"}{" "}
                              {user.last_name || ""}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                          {formData.projectManagers.includes(user.email) && (
                            <div className="ml-auto text-blue-500">
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative flex flex-col items-center justify-center py-8">
                      <img 
                        src="/empty.svg" 
                        alt="No users found" 
                        className="w-32 h-32 opacity-50"
                      />
                    </div>
                  )}
                </div>
              )}

              {formData.projectManagers[0] && (
                <div className="space-y-2 mb-4">
                  {(() => {
                    const email = formData.projectManagers[0];
                    const user = usersData?.data?.result?.find(
                      (u: any) => u.email === email
                    );
                    return (
                      <div className="flex items-center justify-between bg-blue-50 p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                            {user?.email?.charAt(0) || email.charAt(0)}
                          </span>
                          <div>
                            <p className="text-sm text-gray-700">
                              {user?.email || email}
                            </p>
                            <p className="text-xs text-gray-500">{email}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveManager(email)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
              {managerError && (
                <p className="text-red-500 text-sm mt-1">{managerError}</p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={addProjectMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="project-other-form"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                addProjectMutation.isPending ||
                !!dateError ||
                !!nameError ||
                !!imageError ||
                !!managerError
              }
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;