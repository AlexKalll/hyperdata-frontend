import React, { useRef, useState, useEffect } from "react";
import { X, Calendar, Upload, Image as ImageIcon } from "lucide-react";
import { usePutProject } from "@/lib/hooks/useProject";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UpdateProjectModalProps {
  onClose: () => void;
  projectData: {
    id: string;
    name: string;
    status: string;
    start_date: string | undefined;
    end_date: string | undefined;
    description: string;
    manager_id: string;
    image: string | null;
    created_by: string;
    updated_by: string | null;
    created_date: string | undefined;
    updated_date: string | undefined;
    tags?: string[] | null; // <-- NEW: Incoming tags
    manager: {
      id: string;
      first_name: string;
      middle_name: string;
      last_name: string;
      email: string;
      phone_number: string;
      profile_picture: string;
      birth_date: string;
      gender: string;
      is_active: true;
      created_by: string;
      updated_by: string;
      created_date: string;
      updated_date: string;
      language_id: string;
      dialect_id: string;
      role_id: string;
      woreda: string;
      city: string;
      zone_id: string;
      region_id: string;
    };
  };
}

const UpdateProjectModal: React.FC<UpdateProjectModalProps> = ({
  onClose,
  projectData,
}) => {
  const [formData, setFormData] = useState({
    name: projectData.name,
    description: projectData.description,
    startDate: projectData.start_date
      ? projectData.start_date.split("T")[0]
      : "",
    endDate: projectData.end_date ? projectData.end_date.split("T")[0] : "",
    image: null as File | null,
  });

  // --- NEW: Tags State ---
  const [tags, setTags] = useState<string[]>(projectData.tags || []);
  const [tagInput, setTagInput] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(
    projectData.image || null
  );
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // --- Sync tags on mount ---
  useEffect(() => {
    setTags(projectData.tags || []);
  }, [projectData.tags]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(projectData.image);
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

  const updateProjectMutation = usePutProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      await updateProjectMutation.mutateAsync({
        id: projectData.id,
        status: projectData.status,
        name: formData.name,
        description: formData.description,
        start_date: formData.startDate || "",
        end_date: formData.endDate || "",
        image: formData.image,
        tags,
      });
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 bg-opacity-80 z-50 flex justify-end overflow-y-scroll"
      onClick={onClose}
    >
      <div
        className="bg-white h-[150vh] rounded-lg shadow-lg w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Update Project
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
              required
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
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
                  min={formData.startDate || undefined}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* --- NEW: Tags Input --- */}
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
                className="flex-1 px-3 py-2 text-sm focus:outline-none rounded-l-md"
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

          {/* Project Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Image
            </label>

            {imagePreview && (
              <div className="mb-4 relative">
                <img
                  src={imagePreview}
                  alt="Project preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-100"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
                ref={imageInputRef}
                accept="image/*"
                multiple={false}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="bg-gray-100 rounded-full p-3 mb-3">
                  {imagePreview ? (
                    <ImageIcon className="h-6 w-6 text-gray-600" />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 mb-1">
                  {imagePreview
                    ? "Change project image"
                    : "Upload single project image"}
                </span>
                <span className="text-xs text-gray-500">
                  Single image only • PNG, JPG, GIF up to 10MB
                </span>
              </label>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="mt-3 inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Browse File
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={updateProjectMutation.isPending}
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Project"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProjectModal;
