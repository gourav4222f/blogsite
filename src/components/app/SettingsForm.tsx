"use client";

import { useFormState } from "react-dom";
import { useEffect, useState, useTransition } from "react";
import { updateProfile } from "@/actions/userActions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SettingsFormProps {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [state, formAction] = useFormState(updateProfile, null);
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (state?.message) {
      setSuccessMessage(state.message);
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Narrow potential string | { name?: string[] } to only the object case
  const fieldErrors =
    state && typeof state.error !== "string" ? state.error : null;
  // Capture general (non-field) error messages
  const generalError =
    state && typeof state.error === "string" ? state.error : null;

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          formAction(formData);
        });
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={user.name ?? ""} />
        {fieldErrors?.name && (
          <p className="text-sm text-red-500">{fieldErrors.name[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" defaultValue={user.username ?? ""} disabled />
        <p className="text-sm text-gray-500 mt-1">
          Usernames cannot be changed.
        </p>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" defaultValue={user.email ?? ""} disabled />
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
        {successMessage && (
          <p className="text-sm text-green-600">{successMessage}</p>
        )}
        {generalError && (
          <p className="text-sm text-red-500">{generalError}</p>
        )}
      </div>
    </form>
  );
}
