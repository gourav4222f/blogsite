"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

interface PostActionsProps {
  postId: string;
  initialLikesCount: number;
  initialCommentsCount: number;
  initialRepostsCount: number;
  initialIsLiked: boolean;
  initialIsReposted: boolean;
}

export function PostActions({
  postId,
  initialLikesCount,
  initialCommentsCount,
  initialRepostsCount,
  initialIsLiked,
  initialIsReposted,
}: PostActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiking, setIsLiking] = useState(false);
  const [isReposted, setIsReposted] = useState(initialIsReposted);
  const [repostsCount, setRepostsCount] = useState(initialRepostsCount);
  const [isReposting, setIsReposting] = useState(false);

  const handleLike = async () => {
    if (!session) {
      alert("You must be logged in to like a post.");
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });
      if (!response.ok) {
        setIsLiked(initialIsLiked);
        setLikesCount(initialLikesCount);
        throw new Error("Failed to update like status");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      setIsLiked(initialIsLiked);
      setLikesCount(initialLikesCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = async () => {
    if (!session) {
      alert("You must be logged in to repost.");
      return;
    }
    if (isReposting) return;
    setIsReposting(true);
    setIsReposted((prev) => !prev);
    setRepostsCount((prev) => (isReposted ? prev - 1 : prev + 1));
    try {
      const response = await fetch(`/api/posts/${postId}/repost`, {
        method: "POST",
      });
      if (!response.ok) {
        setIsReposted(initialIsReposted);
        setRepostsCount(initialRepostsCount);
        throw new Error("Failed to update repost status");
      }
      router.refresh();
    } catch (error) {
      console.error(error);
      setIsReposted(initialIsReposted);
      setRepostsCount(initialRepostsCount);
    } finally {
      setIsReposting(false);
    }
  };

  return (
    <div className="p-4 pt-0 flex justify-between items-center">
      <div className="flex gap-1">
        <Link href={`/posts/${postId}`}>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5 text-gray-500" />
          </Button>
        </Link>
        <span className="self-center text-sm text-gray-600">
          {initialCommentsCount}
        </span>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRepost}
          disabled={isReposting}
        >
          <Repeat2
            className={clsx("h-5 w-5", {
              "text-emerald-600": isReposted,
              "text-gray-500": !isReposted,
            })}
          />
        </Button>
        <span
          className={clsx("self-center text-sm", {
            "text-emerald-600": isReposted,
            "text-gray-600": !isReposted,
          })}
        >
          {repostsCount}
        </span>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={handleLike} disabled={isLiking}>
          <Heart
            className={clsx("h-5 w-5", {
              "text-red-500 fill-current": isLiked,
              "text-gray-500": !isLiked,
            })}
          />
        </Button>
        <span
          className={clsx("self-center text-sm", {
            "text-red-500": isLiked,
            "text-gray-600": !isLiked,
          })}
        >
          {likesCount}
        </span>
      </div>
    </div>
  );
}
