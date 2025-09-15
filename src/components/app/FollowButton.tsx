"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
}: FollowButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFollow = async () => {
    if (!session) return alert("Please sign in to follow users.");
    setIsSubmitting(true);

    // Optimistic update
    setIsFollowing((prev) => !prev);

    try {
      const response = await fetch(`/api/users/${targetUserId}/follow`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Follow request failed");
      router.refresh();
    } catch (error) {
      console.error(error);
      // Revert on error
      setIsFollowing(initialIsFollowing);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session || session.user?.id === targetUserId) {
    return null; // Don't show follow button on your own profile
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={isSubmitting}
      variant={isFollowing ? "secondary" : "default"}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
