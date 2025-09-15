"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function GitHubIcon() {
  return <FaGithub className="w-5 h-5" />;
}

function GoogleIcon() {
  return <FcGoogle className="w-5 h-5" />;
}

export function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const loading = status === "loading";

  if (loading) {
    return (
      <button
        type="button"
        className="px-4 py-2 rounded-md bg-gray-100 text-gray-600 cursor-wait"
        disabled
      >
        Loading...
      </button>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => signIn("github")}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 transition"
        >
          <GitHubIcon />
          Sign in with GitHub
        </button>

        <button
          type="button"
          onClick={() => signIn("google")}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>
    );
  }

  const user = session.user;
  type UserWithUsername = typeof user & { username?: string | null };
  const userWithUsername = user as UserWithUsername;
  const needsUsername = userWithUsername?.username == null;

  // Open the dialog if needsUsername becomes true
  if (needsUsername && !showDialog) setShowDialog(true);

  const onSubmitUsername = async () => {
    if (!user?.id) return;
    const value = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(value)) {
      setError(
        "Username must be 3-20 characters and contain only letters, numbers, or underscores."
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${user.id}/username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to set username");
      }
      setShowDialog(false);
      router.refresh();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {user?.image && (
        <Image
          src={user.image}
          alt={user?.name ?? "User Avatar"}
          width={32}
          height={32}
          className="rounded-full"
        />
      )}

      <span className="text-sm text-gray-800 hidden sm:inline">
        {user?.name ?? user?.email}
      </span>

      <Button type="button" variant="secondary" onClick={() => signOut()}>
        Sign out
      </Button>

      <Dialog open={showDialog && needsUsername} onOpenChange={(open) => setShowDialog(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create your username</DialogTitle>
            <DialogDescription>
              Choose a unique username to complete your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="username">Username</Label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. johndoe"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
              disabled={submitting}
            />
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={onSubmitUsername} disabled={submitting}>
              {submitting ? "Saving..." : "Save username"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
