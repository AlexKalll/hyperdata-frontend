"use client";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import axios from "axios";

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

interface Language {
  id: string;
  name: string;
  description: string;
}

interface LanguageResponse {
  message: string;
  code: number;
  data: Language[];
}

interface Dialect {
  id: string;
  name: string;
  description: string;
}

interface DialectResponse {
  message: string;
  code: number;
  data: Dialect[];
}

const submitRegistration = async ({
  invitationLinkId,
  data,
}: {
  invitationLinkId: string;
  data: any;
}) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/project-mgmt/invitation-link/accept-invite/${invitationLinkId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to register");
  }
  return response.json();
};

const LinkFormPage: React.FC = () => {
  const router = useRouter();
  const { invitation_link_id } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birth_date: "",
    gender: "",
    city: "",
    woreda: "",
    dialect_id: "",
    language_id: "",
    country_id: "",
    region_id: "",
    zone_id: "",
    educational_background: "",
    organization: "",
    phone: "",
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: submitRegistration,
    onSuccess: () => {
      toast.success("Registration successful");
      router.push("/login");
    },
    onError: (err: Error) => {
      setError(err.message || "Invalid or expired invitation link");
      toast.error(err.message || "Invalid or expired invitation link");
    },
  });

  // Fetch countries
  const { data: countryResponseData, isLoading: countriesLoading } = useQuery<CountryResponse>({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await axios.get<CountryResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/country/all`
      );
      return response.data;
    },
  });

  // Fetch regions
  const { data: regionResponseData, isLoading: regionsLoading } = useQuery<RegionResponse>({
    queryKey: ["regions", formData.country_id],
    queryFn: async () => {
   
      const response = await axios.get<RegionResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/region/country/${formData.country_id}`
      );
      
      return response.data;
    },
    enabled: !!formData.country_id,
  });

  // Fetch zones
  const { data: zoneResponseData, isLoading: zonesLoading, error: zonesError } = useQuery<ZoneResponse>({
    queryKey: ["zones", formData.region_id],
    queryFn: async () => {
   
      const response = await axios.get<ZoneResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/zone/region/${formData.region_id}`
      );
     
      return response.data;
    },
    enabled: !!formData.region_id,
  });

  // Fetch languages
  const { data: languageResponseData, isLoading: languagesLoading } = useQuery<LanguageResponse>({
    queryKey: ["languages"],
    queryFn: async () => {
      const response = await axios.get<LanguageResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/language/all`
      );
      return response.data;
    },
  });

  // Fetch dialects
  const { data: dialectResponseData, isLoading: dialectsLoading } = useQuery<DialectResponse>({
    queryKey: ["dialects", formData.language_id],
    queryFn: async () => {
      const response = await axios.get<DialectResponse>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/setting/dialect/language/${formData.language_id}`
      );
      return response.data;
    },
    enabled: !!formData.language_id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
 
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
      ...(name === "country_id" ? { region_id: "", zone_id: "" } : {}),
      ...(name === "region_id" ? { zone_id: "" } : {}),
      ...(name === "language_id" ? { dialect_id: "" } : {}),
    }));
    if (name === "password" || name === "confirmPassword") {
      setError(null);
    }
  };

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name ||!formData.middle_name) {
      setError("First ,middele and Last Name are required");
      return false;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    // Strong password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
    const trimmedPassword = formData.password.trim();
    const trimmedConfirmPassword = formData.confirmPassword.trim();

  

    if (!trimmedPassword || !passwordRegex.test(trimmedPassword)) {
      setError(
        "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (!@#$%^&*)"
      );
      return false;
    }
    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city || !formData.woreda) {
      setError("City and Woreda are required");
      return;
    }
    setError(null);
    mutation.mutate({
      invitationLinkId: invitation_link_id as string,
      data: {
        ...formData,
        confirmPassword: undefined,
      },
    });
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:block w-2/5 relative">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/logo/backgroundimage.png"
            alt="Login Illustration"
            fill
            priority={true}
            className="object-cover"
            quality={100}
            sizes="(max-width: 768px) 100vw, 40vw"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              Welcome to Mahder
            </h1>
            <p className="text-lg">Create your account</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="relative mx-auto h-24 w-full max-w-[280px] overflow-hidden">
              <Image
                src="/Mahder Logo.png"
                alt="Mahder logo"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            <h2 className="text-2xl font-bold mt-4">Create Your Account</h2>
            <p className="text-sm text-gray-600">Step {step} of 2</p>
          </div>
          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <Input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full h-10"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name (Father Name)</label>
                  <Input
                    type="text"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    placeholder="Middle Name"
                    className="w-full h-10"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name (Grandfather Name)</label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full h-10"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full h-10"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
                <Input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded focus:outline-none focus:border-primary"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+251"
                  className="w-full h-10"
                />
              </div>
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
              <Button
                type="submit"
                className="w-full h-12 bg-primary text-white py-2 rounded"
              >
                Next
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select
                  name="country_id"
                  value={formData.country_id}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded focus:outline-none focus:border-primary"
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
              {formData.country_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <select
                    name="region_id"
                    value={formData.region_id}
                    onChange={handleChange}
                    className="w-full h-10 border border-gray-300 rounded focus:outline-none focus:border-primary"
                    disabled={regionsLoading || !regionResponseData?.data.length}
                  >
                    <option value="">Select Region</option>
                    {regionResponseData?.data.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  {formData.country_id && !regionsLoading && regionResponseData?.data.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">No regions available for this country.</p>
                  )}
                </div>
              )}
              {formData.region_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zone</label>
                  <select
                    name="zone_id"
                    value={formData.zone_id}
                    onChange={handleChange}
                    className="w-full h-10 border border-gray-300 rounded focus:outline-none focus:border-primary"
                    disabled={zonesLoading || !zoneResponseData?.data.length}
                  >
                    <option value="">Select Zone</option>
                    {zoneResponseData?.data.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                  {formData.region_id && !zonesLoading && zoneResponseData?.data.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">No zones available for this region.</p>
                  )}
                  {zonesError && (
                    <p className="text-sm text-red-500 mt-1">Error fetching zones: {zonesError.message}</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Woreda</label>
                <Input
                  type="text"
                  name="woreda"
                  value={formData.woreda}
                  onChange={handleChange}
                  placeholder="Enter woreda"
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  name="language_id"
                  value={formData.language_id}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded focus:outline-none focus:border-primary"
                  disabled={languagesLoading}
                >
                  <option value="">Select Language</option>
                  {languageResponseData?.data.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>
              {formData.language_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dialect</label>
                  <select
                    name="dialect_id"
                    value={formData.dialect_id}
                    onChange={handleChange}
                    className="w-full h-10 border border-gray-300 rounded focus:outline-none focus:border-primary"
                    disabled={dialectsLoading || !dialectResponseData?.data.length}
                  >
                    <option value="">Select Dialect</option>
                    {dialectResponseData?.data.map((dialect) => (
                      <option key={dialect.id} value={dialect.id}>
                        {dialect.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Educational Background</label>
                <Input
                  type="text"
                  name="educational_background"
                  value={formData.educational_background}
                  onChange={handleChange}
                  placeholder="Enter educational background"
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                <Input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Enter organization"
                  className="w-full h-10"
                />
              </div>
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
              <div className="flex space-x-4">
                <Button
                  type="button"
                  className="w-1/2 h-12 bg-gray-300 text-gray-700 py-2 rounded"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="w-1/2 h-12 bg-primary text-white py-2 rounded"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Registering..." : "Register"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkFormPage;
