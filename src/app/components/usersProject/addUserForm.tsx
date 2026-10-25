import { Button } from "@/components/ui/button";
import { useAddUser } from "@/lib/hooks/useFetchUser";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

interface Role {
  id: string;
  name: string;
  description: string;
}
interface RolesResponse {
  message: string;
  code: number;
  data: Role[];
}

export default function AddUserForm({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    birth_date: "",
    gender: "",
    role_id: "",
  });

  // Fetch roles from API
  const { data: rolesResponse, isLoading: rolesLoading } =
    useQuery<RolesResponse>({
      queryKey: ["roles"],
      queryFn: async () => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const response = await axios.get<RolesResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/auth/roles`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
        return response.data;
      },
      enabled: !!session?.access_token,
    });

  const addUserMutation = useAddUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUserMutation.mutateAsync({
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim() || undefined,
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        birth_date: formData.birth_date,
        gender: formData.gender,
        role_id: formData.role_id,
        phone_number: formData.phone_number.trim(),
      });
      onClose();
    } catch (error) {
      // Error handling is done in useAddUser hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">
            First Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-gray-700 mb-2">
          Middle Name (Father Name)
        </label>
        <input
          type="text"
          value={formData.middle_name}
          onChange={(e) =>
            setFormData({ ...formData, middle_name: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-gray-700 mb-2">
          Last Name (Grandfather Name)<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.last_name}
          onChange={(e) =>
            setFormData({ ...formData, last_name: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">
          Email<span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">
          Phone number<span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          placeholder="+251900000000"
          value={formData.phone_number}
          onChange={(e) =>
            setFormData({ ...formData, phone_number: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
          required
          minLength={9}
        />
      </div>

      <p className="text-sm text-gray-600">Mahder will email a temporary password. The user must change it on first sign-in.</p>

      <div>
        <label className="block text-gray-700 mb-2">
          Birth Date<span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.birth_date}
          onChange={(e) =>
            setFormData({ ...formData, birth_date: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">
          Gender<span className="text-red-500">*</span>
        </label>
        <select
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700 mb-2">
          Role<span className="text-red-500">*</span>
        </label>
        <select
          value={formData.role_id}
          onChange={(e) =>
            setFormData({ ...formData, role_id: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
          required
          disabled={rolesLoading}
        >
          <option value="">Select Role</option>
          {rolesResponse?.data?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} - {role.description}
            </option>
          ))}
        </select>
        {rolesLoading && (
          <p className="text-sm text-gray-500">Loading roles...</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={addUserMutation.isPending || rolesLoading}
        >
          {addUserMutation.isPending ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}
