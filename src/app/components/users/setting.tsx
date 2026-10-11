"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/app/context/auth-context";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { countryCodes } from "@/app/types/countryCodes";
import { MeResponse, UserMeResponse } from "@/app/types/global";
import { useChangePassword, useMeData } from "@/lib/hooks/useFetchUser";
import { toast } from "sonner";
import axios from "axios";
import { Eye, EyeClosed } from "lucide-react";

interface Country {
  id: string;
  name: string;
  description: string;
}

interface CountryResponse {
  message: string;
  code: number;
  data: Country[];
}

interface Region {
  id: string;
  name: string;
  description: string;
}

interface RegionResponse {
  message: string;
  code: number;
  data: Region[];
}

interface Zone {
  id: string;
  name: string;
  description: string;
}

interface ZoneResponse {
  message: string;
  code: number;
  data: Zone[];
}

export default function SettingsDetailPage() {
  const { data: session, status, update } = useSession();
  const { data: usersData } = useMeData(session?.access_token ?? "");
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch user data from /iam/users/me endpoint
  const { data: meData, isLoading: isMeLoading } = useQuery<UserMeResponse>({
    queryKey: ["userMe", session?.access_token],
    queryFn: async () => {
      if (!session?.access_token) {
        throw new Error("No authentication token available");
      }
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/users/me`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      return response.data.data;
    },
    enabled: !!session?.access_token,
  });

  // Find Ethiopia's country code as default
  const defaultCountryCode =
    countryCodes.find((country) => country.code === "ET")?.dial_code || "+251";
  const [selectedCountryCode, setSelectedCountryCode] =
    useState(defaultCountryCode);

  const [localUserdata, setLocalUserdata] = useState<UserMeResponse | MeResponse>(() => {
    const defaultUserData: MeResponse = {
      id: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      phone_number: null,
      profile_picture: null,
      birth_date: "",
      gender: "",
      is_active: false,
      created_by: null,
      updated_by: null,
      created_date: "",
      updated_date: "",
      language_id: null,
      dialect_id: null,
      role_id: "",
      woreda: null,
      city: null,
      zone_id: null,
      region_id: null,
      sectors: null,
      role: {
        id: "",
        name: "",
        description: "",
        created_by: null,
        updated_by: null,
        created_date: "",
        updated_date: "",
      },
      wallet: null,
      dialect: null,
      language: null,
      score: null,
    };

    if (typeof window !== "undefined") {
      const storedData = localStorage.getItem("userData");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (
            typeof parsedData === "object" &&
            "id" in parsedData &&
            "first_name" in parsedData &&
            "middle_name" in parsedData &&
            "last_name" in parsedData &&
            "email" in parsedData &&
            "role" in parsedData
          ) {
            return parsedData as MeResponse;
          }
        } catch (error) {
          console.error("Failed to parse userData from localStorage:", error);
        }
      }
    }

    return defaultUserData;
  });

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [profile, setProfile] = useState({
    first_name: session?.user?.first_name || "",
    last_name: session?.user?.last_name || "",
    middle_name: session?.user?.middle_name || "",
    email: session?.user?.email || "",
    country: "",
    region: "",
    zone: "",
    phone: "",
    city: "",
    subCity: "",
    country_id: "",
    region_id: "",
    zone_id: "",
    woreda: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Populate form with data from API
  useEffect(() => {
    if (meData) {
      // Extract phone number without country code if it exists
      let phoneWithoutCode = "";
      let countryCode = defaultCountryCode;
      
      if (meData.phone_number) {
        // Try to match country code from the phone number
        const matchedCountry = countryCodes.find(code => 
          meData.phone_number?.startsWith(code.dial_code)
        );
        
        if (matchedCountry) {
          countryCode = matchedCountry.dial_code;
          phoneWithoutCode = meData.phone_number.substring(matchedCountry.dial_code.length);
        } else {
          phoneWithoutCode = meData.phone_number;
        }
      }

      setSelectedCountryCode(countryCode);
      setProfile({
        first_name: meData.first_name || "",
        last_name: meData.last_name || "",
        middle_name: meData.middle_name || "",
        email: meData.email || "",
        phone: phoneWithoutCode,
        country_id: "",
        region_id: meData.region_id || "",
        zone_id: meData.zone_id || "",
        country: "",
        region: ("region" in meData ? meData.region : "") || "",
        zone: ("zone" in meData ? meData.zone : "") || "",
        city: meData.city || "",
        subCity: "",
        woreda: meData.woreda || "",
      });

      // Update local user data
      setLocalUserdata(meData);
    }
  }, [meData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image (JPEG, PNG, or GIF).");
        return;
      }
      if (file.size > maxSize) {
        toast.error("Image size must be less than 10MB.");
        return;
      }
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setIsModalOpen(true);
    }
  };

  const { data: countryResponseData, isLoading: countriesLoading } =
    useQuery<CountryResponse>({
      queryKey: ["countries"],
      queryFn: async () => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const response = await axios.get<CountryResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/country/all`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
        return response.data;
      },
      enabled: !!session?.access_token,
    });

  const { data: regionResponseData, isLoading: regionsLoading } =
    useQuery<RegionResponse>({
      queryKey: ["regions", profile.country_id],
      queryFn: async () => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const response = await axios.get<RegionResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/region/country/${profile.country_id}`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
        return response.data;
      },
      enabled: !!session?.access_token && !!profile.country_id,
    });

  const { data: zoneResponseData, isLoading: zonesLoading } =
    useQuery<ZoneResponse>({
      queryKey: ["zones", profile.region_id],
      queryFn: async () => {
        if (!session?.access_token) {
          throw new Error("No authentication token available");
        }
        const response = await axios.get<ZoneResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/zone/region/${profile.region_id}`,
          {
            headers: { Authorization: `Bearer ${session.access_token}` },
          }
        );
        return response.data;
      },
      enabled: !!session?.access_token && !!profile.region_id,
    });

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = e.target.value;
    setProfile((prev) => ({
      ...prev,
      country_id: countryId,
      region_id: "",
      zone_id: "",
      country: countryId,
      region: "",
      zone: "",
      woreda: "",
    }));
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    setProfile((prev) => ({
      ...prev,
      region_id: regionId,
      zone_id: "",
      region: regionId,
      zone: "",
      woreda: "",
    }));
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zoneId = e.target.value;
    setProfile((prev) => ({
      ...prev,
      zone_id: zoneId,
      zone: zoneId,
      woreda: "",
    }));
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image to upload.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/users/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        toast.success("Image uploaded successfully!");
        const updatedUserData = {
          ...localUserdata,
          profile_picture: responseData.data.profile_picture,
        };
        setLocalUserdata(updatedUserData);
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        await update({
          ...session,
          user: {
            ...session?.user,
            profile_picture: responseData.data.profile_picture,
          },
        });
        queryClient.invalidateQueries({
          queryKey: ["me", session?.access_token],
        });
        setIsModalOpen(false);
        setSelectedImage(null);
        setPreviewImage(null);
      } else {
        toast.error("Failed to upload image.");
      }
    } catch (error) {
      toast.error("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const updatePasswordMutation = useChangePassword();
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (security.newPassword !== security.confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }
    try {
      await updatePasswordMutation.mutateAsync({
        current_password: security.currentPassword,
        new_password: security.newPassword,
      });
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error("Failed to update password.");
    }
  };

  const validateProfileForm = () => {
    const errors: string[] = [];
    if (!profile.first_name.trim()) {
      errors.push("First name is required.");
    }
    if (!profile.last_name.trim()) {
      errors.push("Last name is required.");
    }
    // if (!profile.country_id.trim()) {
    //   errors.push("Country is required.");
    // }
    // if (!profile.phone.trim()) {
    //   errors.push("Phone number is required.");
    // }
    // if (!profile.city.trim()) {
    //   errors.push("City is required.");
    // }
     return errors;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateProfileForm();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    const phone = profile.phone.trim();

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/users/me`,
        {
          first_name: profile.first_name.trim(),
          last_name: profile.last_name.trim(),
          middle_name: profile.middle_name.trim() || null,
          email: profile.email.trim() || null,
          phone_number: phone ? `${selectedCountryCode}${phone}` : null,
          region_id: profile.region_id || null,
          zone_id: profile.zone_id || null,
          city: profile.city.trim() || null,
          woreda: profile.woreda.trim() || null,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Profile updated successfully!");
        const updatedUserData: UserMeResponse = response.data.data;
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        setLocalUserdata(updatedUserData);
        await update({
          ...session,
          user: {
            ...session?.user,
            first_name:
              response.data.data.first_name ?? session?.user?.first_name,
            last_name: response.data.data.last_name ?? session?.user?.last_name,
            middle_name:
              response.data.data.middle_name ?? session?.user?.middle_name,
            email: response.data.data.email ?? session?.user?.email,
            profile_picture:
              response.data.data.profile_picture ??
              session?.user?.profile_picture,
          },
        });

        queryClient.invalidateQueries({
          queryKey: ["me", session?.access_token],
        });
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(
        Array.isArray(message)
          ? message.join(", ")
          : typeof message === "string"
            ? message
            : "Failed to update profile.",
      );
    }
  };

  return (
    <div className="p-6 font-sans">
      <div className="flex border-b border-gray-100 mb-6">
        <button
          className={`pb-2 px-4 font-semibold ${
            activeTab === "profile"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          My Profile
        </button>
        <button
          className={`pb-2 px-4 font-semibold ${
            activeTab === "security"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>
      </div>

      {activeTab === "profile" ? (
        <div className="bg-white p-6 rounded-lg ">
          <div className="flex items-center mb-6">
            <img
              src={
                localUserdata.profile_picture
                  ? localUserdata.profile_picture
                  : "/default-avatar.png"
              }
              alt="User"
              width={80}
              height={80}
              className="w-28 h-28 rounded-full mr-3"
            />
            <div>
              <h2 className="text-lg font-semibold">{session?.user?.name}</h2>
              <p className="text-gray-600 mb-4 ">{session?.user?.email}</p>
              <input
                type="file"
                accept="image/*"
                multiple={false}
                id="imageUpload"
                className="hidden m-4"
                onChange={handleImageChange}
              />
              {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-lg w-96">
                    <h3 className="text-lg font-semibold mb-4">
                      Preview Image
                    </h3>
                    {previewImage && (
                      <div className="mb-4">
                        <Image
                          src={previewImage}
                          alt="Preview"
                          width={200}
                          height={200}
                          className="rounded"
                        />
                      </div>
                    )}
                    <div className="flex justify-end space-x-4">
                      <button
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setIsModalOpen(false);
                          setSelectedImage(null);
                          setPreviewImage(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        onClick={handleImageUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? "Uploading..." : "Confirm"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <label
                htmlFor="imageUpload"
                className="mt-2 mtext-primary border border-primary rounded-full px-4 py-1 hover:bg-blue-50 cursor-pointer"
              >
                Change Image
              </label>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300  rounded-md focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">
                  Middle Name (Father Name)
                </label>
                <input
                  type="text"
                  name="middle_name"
                  value={profile.middle_name}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <div className="flex">
                  <select
                    className="p-2 border border-gray-300 mr-2 rounded-l focus:outline-none focus:border-primary"
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                  >
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
                        {country.flag} {country.dial_code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded-r focus:outline-none focus:border-primary"
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Address Information</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Country</label>
                <select
                  name="country"
                  value={profile.country_id}
                  onChange={handleCountryChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                  disabled={countriesLoading}
                >
                  <option value="">Select Country</option>
                  {countryResponseData?.data.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              {profile.country_id && (
                <div>
                  <label className="block text-gray-700 mb-2">Region</label>
                  <select
                    name="region"
                    value={profile.region_id}
                    onChange={handleRegionChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                    disabled={
                      regionsLoading || !regionResponseData?.data.length
                    }
                  >
                    <option value="">Select Region</option>
                    {regionResponseData?.data.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {profile.region_id && (
                <div>
                  <label className="block text-gray-700 mb-2">Zone</label>
                  <select
                    name="zone"
                    value={profile.zone_id}
                    onChange={handleZoneChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                    disabled={zonesLoading || !zoneResponseData?.data.length}
                  >
                    <option value="">Select Zone</option>
                    {zoneResponseData?.data.map((zone) => (
                      <option key={zone.id} value={zone.id}>
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
                  value={profile.city}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Sub City</label>
                <input
                  type="text"
                  name="subCity"
                  value={profile.subCity}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Woreda</label>
                <input
                  type="text"
                  name="woreda"
                  value={profile.woreda}
                  onChange={handleProfileChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() =>
                  setProfile({
                    first_name: session?.user?.name?.split(" ")[0] || "",
                    last_name: session?.user?.name?.split(" ")[1] || "",
                    middle_name: "",
                    email: session?.user?.email || "",
                    country: "",
                    region: "",
                    zone: "",
                    phone: "",
                    city: "",
                    subCity: "",
                    country_id: "",
                    region_id: "",
                    zone_id: "",
                    woreda: "",
                  })
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
              >
                Update Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg ">
          <h3 className="text-lg font-semibold mb-1">Change Password</h3>
          <p className="text-gray-600 mb-6">
            Ensure your account’s security by regularly updating your password.
            Use the form below to create a strong and unique password.
          </p>
          <form onSubmit={handleSecuritySubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <div className="relative">
                  <label className="block font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="currentPassword"
                    value={security.currentPassword}
                    onChange={(e) =>
                      setSecurity({
                        ...security,
                        currentPassword: e.target.value,
                      })
                    }
                    className="h-12 w-full p-2 pr-10 placeholder-white bg-white border rounded focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute mt-5 inset-y-0 right-0 top-0 pr-5 flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showNewPassword ? (
                      <EyeClosed className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={security.newPassword}
                  onChange={(e) =>
                    setSecurity({ ...security, newPassword: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-semibold">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={security.confirmPassword}
                  onChange={(e) =>
                    setSecurity({
                      ...security,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                onClick={() =>
                  setSecurity({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  })
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700"
              >
                Update Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
