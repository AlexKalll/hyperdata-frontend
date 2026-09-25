import { Button } from "@/components/ui/button";
import { useAddBasedataOrganization } from "@/lib/hooks/useBasedata";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { countryCodes } from "@/app/types/countryCodes";
import axios from "axios";
import { useSession } from "next-auth/react";
interface basedataDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicename?: string;
  coloumn_name?: string;
  foriegnData?: string;
}

interface country {
  id: string;
  name: string;
  description: string;
}
interface countryResponse {
  message: string;
  code: number;
  data: country[];
}
interface region {
  id: string;
  name: string;
  description: string;
}
interface regionResponse {
  message: string;
  code: number;
  data: region[];
}
interface zone {
  id: string;
  name: string;
  description: string;
}
interface zoneResponse {
  message: string;
  code: number;
  data: zone[];
}
interface dynamicResponse {
  id: string;
  name: string;
  code: string;
  continent: string;
  email: string;
  phone: string;
  address: string;
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
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    email: "",
    city: "",
    country: "",
    region: "",
    zone: "",
    subCity: "",
    phone: "",
    address: "",
    description: "",
    [coloumn_name || ""]: "",
  });
  const { data: countryResponseData } = useQuery<countryResponse>({
    queryKey: ["roles"],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }
      const response = await axios.get<countryResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/country/all`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    enabled: !!session?.access_token,
  });
  const { data: regionResponseData } = useQuery<regionResponse>({
    queryKey: ["region"],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }
      const response = await axios.get<regionResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/region/all`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    enabled: !!session?.access_token,
  });
  const { data: zoneRponseData } = useQuery<zoneResponse>({
    queryKey: ["zone"],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }
      const response = await axios.get<zoneResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/zone/all`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data;
    },
    enabled: !!session?.access_token,
  });

  const addbasedataMutation = useAddBasedataOrganization(servicename || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addbasedataMutation.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: `${formData.subCity},${formData.city},${formData.zone}, ${formData.region}, ${formData.country}`,
      });
      onClose();
    } catch (error) {}
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-gray-700 mb-2"> Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-gray-700 mb-2"> Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-0 flex-row">
        <div>
          <label className="block text-gray-700 mb-2">Contact number</label>
          <div className="flex">
            <select
              className="p-2 border border-gray-300 rounded-l focus:outline-none focus:border-primary"
              style={{ minWidth: "120px" }}
            >
              <option disabled value="">
                Search country code...
              </option>
              {countryCodes.map((country) => (
                <option
                  key={country.code}
                  value={country.dial_code}
                  style={{
                    background: "white",
                    border: "1px solid #D1D5DB",
                    color: "black",
                  }}
                >
                  {country.name}, {country.dial_code}, {country.flag}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-r focus:outline-none focus:border-primary"
              required
            />
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-4">Address Information</h3>
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 mb-2">Country</label>
          <select
            name="country"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
          >
            <option disabled value="">
              Select country
            </option>
            {countryResponseData?.data.map((country) => (
              <option key={country.id} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        {formData.country && (
          <div>
            <label className="block text-gray-700 mb-2">Region</label>
            <option disabled value="">
              Select region
            </option>
            <select
              name="region"
              value={formData.region}
              onChange={(e) =>
                setFormData({ ...formData, region: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            >
              {regionResponseData?.data.map((region) => (
                <option key={region.id} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {formData.region && (
          <div>
            <label className="block text-gray-700 mb-2">Zone</label>
            <select
              name="zone"
              value={formData.zone}
              onChange={(e) =>
                setFormData({ ...formData, zone: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
            >
              <option disabled value="">
                Select zone
              </option>
              {zoneRponseData?.data.map((zone) => (
                <option key={zone.id} value={zone.name}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-gray-700 mb-2">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Sub City</label>
          <input
            type="text"
            name="subCity"
            value={formData.subCity}
            onChange={(e) =>
              setFormData({ ...formData, subCity: e.target.value })
            }
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
          />
        </div>
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
