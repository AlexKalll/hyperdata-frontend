import { Button } from "@/components/ui/button";
import { useAddBasedata } from "@/lib/hooks/useBasedata";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
interface basedataDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicename?: string;
  coloumn_name?: string;
  foriegnData?: string;
}
type DynamicFormData = {
  name: string;
  description: string;
  relationId: string;
};
interface dynamicResponse {
  id: string;
  name: string;
  code: string;
  continent: string;
  created_by: string;
  updated_by: string;
  created_date: string;
  updated_date: string;
}
interface dynamicResponsedata {
  message: string;
  code: number;
  data: dynamicResponse[];
}

export default function AddBasedataFormDynamic({
  onClose,
  servicename,
  coloumn_name,
  foriegnData,
}: basedataDetailsModalProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<DynamicFormData>({
    name: "",
    description: "",
    relationId: "",
  });
  const relationServices = ["annotation", "dialect", "region", "zone"];
  const hasRelation = Boolean(
    coloumn_name &&
      foriegnData &&
      servicename &&
      relationServices.includes(servicename),
  );
  const hasDescription = servicename !== "zone";

  const { data: dynamicResponsedata, isLoading: rolesLoading } =
    useQuery<dynamicResponsedata>({
      queryKey: ["base-data-reference", foriegnData],
      queryFn: async () => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const response = await axios.get<dynamicResponsedata>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/${foriegnData}/${servicename === "annotation" ? "" : "all"}`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
        return response.data;
      },
      enabled: Boolean(session?.access_token && hasRelation),
    });

  const addbasedataMutation = useAddBasedata(servicename || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Record<string, string> = { name: formData.name };
      if (hasDescription) payload.description = formData.description;
      if (hasRelation && coloumn_name) {
        payload[coloumn_name] = formData.relationId;
      }
      await addbasedataMutation.mutateAsync(payload);
      onClose();
    } catch (error) {
      // Error handling is done in useAddbasedata hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block font-bold text-gray-700 mb-2"> Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            required
          />
        </div>

        {hasDescription && (
            <div>
            <label className="block font-bold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              required
            />
            </div>
        )}
        {hasRelation && (
          <div>
            <label className="block font-bold text-gray-700 mb-2">{foriegnData}*</label>
            <select
              value={formData.relationId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  relationId: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
              required
              disabled={rolesLoading}
            >
              <option value="">Select {foriegnData}</option>
              {Array.isArray(dynamicResponsedata?.data) &&
                dynamicResponsedata.data.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
            {rolesLoading && (
              <p className="text-sm text-gray-500">Loading ...</p>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 right-0 p-4 flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={addbasedataMutation.isPending}>
          {addbasedataMutation.isPending
            ? "Creating..."
            : ` Create `}
        </Button>
      </div>
    </form>
  );
}
