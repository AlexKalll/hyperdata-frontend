"use client";

import { useState, useEffect } from "react";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ResetPassword } from "@/app/types/global";
import axios from "axios";
import { Eye, EyeClosed } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");
  const [newpassword, setnewpassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForget, setShowForget] = useState(false);
  const [showUpdatenewpassword, setShowUpdatenewpassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/superadmin";
  const validateNewPassword = (newpassword: string) => {
    const minLength = newpassword.length >= 8;
    const hasUpperCase = /[A-Z]/.test(newpassword);
    const hasLowerCase = /[a-z]/.test(newpassword);
    const hasNumber = /[0-9]/.test(newpassword);
    const hasSpecialChar = /[!@#$%^&*]/.test(newpassword);

    const isStrong =
      minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    let message = "";
    if (!minLength) {
      message = "password must be at least 8 characters long.";
    } else if (!hasUpperCase) {
      message = "password must contain at least one uppercase letter.";
    } else if (!hasLowerCase) {
      message = "password must contain at least one lowercase letter.";
    } else if (!hasNumber) {
      message = "password must contain at least one number.";
    } else if (!hasSpecialChar) {
      message =
        "password must contain at least one special character (!@#$%^&*).";
    }

    return { isStrong, message };
  };
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmitNewnewpassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { isStrong, message } = validateNewPassword(newpassword);
    if (!isStrong) {
      toast.error(message || "Please provide a stronger password.");
      return;
    }
    const userData = {
      username: email,
      password: newpassword,
      code: code,
    };

    try {
      const response = await axios.post<ResetPassword>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/auth/reset-password`,
        userData
      );

      toast.success("Success", {
        description: "Password reset successfully",
      });
      setShowForget(false);
      setShowUpdatenewpassword(false);
      setLoading(false);
      router.push(callbackUrl);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to send code";
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        setError("An unexpected error occurred");
        toast.error("Error", {
          description: "An unexpected error occurred",
        });
      }
      throw error;
    } finally {
    }
  };
  const [newPasswordStrength, setNewPasswordStrength] = useState({
    isStrong: false,
    message: "",
  });

  const handlenewpasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newpassword = e.target.value;
    setnewpassword(newpassword);
    const { isStrong, message } = validateNewPassword(newpassword);
    setNewPasswordStrength({ isStrong, message });
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userData = {
      username: email,
    };

    if (!userData.username) {
      toast.error("Email is required");
      return;
    }
    try {
      const response = await axios.post<ResetPassword>(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/auth/forgot-password`,
        userData
      );

      toast.success("Success", {
        description: "Code sent to your email",
      });
      setShowUpdatenewpassword(true);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message || "Failed to send code";
        setError(errorMessage);
        toast.error("Error", {
          description: errorMessage,
        });
      } else {
        setError("An unexpected error occurred");
        toast.error("Error", {
          description: "An unexpected error occurred",
        });
      }
      throw error;
    } finally {
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        toast.error("Invalid email or password.");
      } else {
        const authenticatedSession = await getSession();
        if (!authenticatedSession?.user?.role) {
          throw new Error("No authenticated role available");
        }
        toast.success("Login successful. Redirecting...");
        redirectBasedOnRole(authenticatedSession.user.role);
      }

      // Handle routing based on role
    } catch (error) {
     
      toast.error("Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case "SuperAdmin":
        router.push("/superadmin");
        break;
      case "ProjectManager":
        router.push("/projectmanager");
        break;
      case "Facilitator":
        router.push("/facilitator");
        break;
      case "Reviewer":
        router.push("/reviewer");
        break;
      default:
        router.push("/dashboard");
    }
  };
  return (
    <div className="min-h-screen flex">
      {/* Image Section - Takes 2.4/6 of width as requested */}
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
            <p className="text-lg">Log in to your account</p>
          </div>
        </div>
      </div>

      {/* Form Section - Centered in the middle */}
      <div className="w-full md:w-3/5 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-white min-h-screen">
        <div className="w-full max-w-md">
          <div className="w-full py-5">
            <div className="flex justify-center mb-7">
              <div className="relative mx-auto h-24 w-full max-w-[280px] overflow-hidden">
                <Image
                  src="/Mahder Logo.png"
                  alt="Mahder logo"
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>
            </div>

            {showForget ? (
              <>
                <div className="text-center font-bold mb-2 text-black">
                  <p className="text-3xl">Forget Password</p>
                </div>
                <div className="text-center mb-2 text-gray-500">
                  Enter your Credentials to log in and access your account
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-2 text-black">
                  <p className="font-bold text-3xl">Login to your Account</p>
                </div>
                <div className="text-center mb-2 text-gray-500">
                  <p className="text-1xl">
                    Enter your Credentials to log in and access your account
                  </p>
                </div>
              </>
            )}
          </div>

          {showForget ? (
            <div>
              {showUpdatenewpassword ? (
                <form
                  onSubmit={handleSubmitNewnewpassword}
                  className="space-y-6"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full placeholder-white bg-white h-12"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="newpassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newpassword}
                        onChange={handlenewpasswordChange}
                        className={`h-12 w-full p-2 pr-10 placeholder-white bg-white border rounded focus:outline-none focus:border-primary ${
                          newpassword && !newPasswordStrength.isStrong
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 top-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-800"
                      >
                        {showNewPassword ? (
                          <EyeClosed className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {newpassword && (
                      <p
                        className={`text-sm mt-1 ${
                          newPasswordStrength.isStrong
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {newPasswordStrength.isStrong
                          ? "Strong password"
                          : newPasswordStrength.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="code"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Code
                    </label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="Enter your code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-12"
                      required
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => {
                        setShowForget(false);
                        setShowUpdatenewpassword(false);
                        setEmail("");
                        setnewpassword("");
                        setCode("");
                        setError("");
                      }}
                      className="w-1/3 h-12"
                      disabled={!newPasswordStrength.isStrong}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="w-1/3 h-12"
                      disabled={!newPasswordStrength.isStrong}
                    >
                      Reset Password
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmitEmail} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12"
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <label
                        htmlFor="remember-me"
                        className="ml-2 block text-sm text-gray-700"
                      ></label>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-1/3 h-12"
                    disabled={loading}
                  >
                    Send Code
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 placeholder-white bg-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative max-w-full">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setpassword(e.target.value)}
                    required
                    className="h-12 w-full placeholder-white bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 top-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? (
                      <EyeClosed className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    onClick={() => {
                      setShowForget(true);
                    }}
                    className="font-medium text-primary hover:text-indigo-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <Button
                type="submit"
                className="bg-primary w-full h-12"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
