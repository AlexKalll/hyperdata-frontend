import { Button } from "@/components/ui/button";
import { useAddBasedata } from "@/lib/hooks/useBasedata";
import { useState } from "react";
interface basedataDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicename?: string;
}

export default function AddBasedataForm({
  onClose,
  servicename,
}: basedataDetailsModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    continent: "",
  });

  // Fetch roles from API

  const addbasedataMutation = useAddBasedata(servicename || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addbasedataMutation.mutateAsync(
        servicename === "country"
          ? {
              name: formData.name,
              code: formData.code,
              continent: formData.continent,
            }
          : {
              name: formData.name,
              code: formData.code,
            },
      );
      onClose();
    } catch (error) {
      // Error handling is done in useAddbasedata hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-gray-700 mb-2 font-bold "> Name</label>
          
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 font-bold">Code</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            required
          />
        </div>
      </div>

      {servicename === "country" ? (
        <div>
          <label className="block text-gray-700 mb-2">Continent</label>
          <input
            type="text"
            value={formData.continent}
            onChange={(e) =>
              setFormData({ ...formData, continent: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            required
          />
        </div>
      ) : (
        <></>
      )}

      <div className="fixed bottom-0 right-0 p-4 flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={addbasedataMutation.isPending}>
          {addbasedataMutation.isPending
            ? "Creating..."
            : `create `}
        </Button>
      </div>
    </form>
  );
}
