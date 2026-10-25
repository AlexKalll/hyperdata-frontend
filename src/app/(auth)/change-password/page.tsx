"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChangeTemporaryPasswordPage() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmation) {
      toast.error("The new passwords do not match.");
      return;
    }
    if (password === currentPassword) {
      toast.error("Choose a different password from your temporary password.");
      return;
    }
    if (!session?.access_token) {
      await signOut({ callbackUrl: "/login" });
      return;
    }
    setSaving(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/iam/users/change-password`, {
        current_password: currentPassword,
        new_password: password,
      }, { headers: { Authorization: `Bearer ${session.access_token}` } });
      toast.success("Password changed. Sign in with your new password.");
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      toast.error(axios.isAxiosError(error)
        ? error.response?.data?.message || "Unable to change password. Please sign in again if your session expired."
        : "Unable to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Choose your password</h1>
        <p className="text-sm text-gray-600">Welcome to Data Mahder. Replace the temporary password from your email before continuing.</p>
        <div className="space-y-2">
          <label htmlFor="temporary-password">Temporary password</label>
          <Input id="temporary-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label htmlFor="new-password">New password</label>
          <Input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-xs text-gray-500">Use at least 8 characters.</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirm-password">Confirm new password</label>
          <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
        </div>
        <Button className="w-full" type="submit" disabled={saving || !session?.access_token}>{saving ? "Saving…" : "Save password"}</Button>
        <Button className="w-full" type="button" variant="outline" disabled={saving} onClick={() => signOut({ callbackUrl: "/login" })}>Back to sign in</Button>
      </form>
    </main>
  );
}
