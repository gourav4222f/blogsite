"use client";

import { useState, useEffect, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "./PostCard";
import { UserList } from "./UserList";

import type { Post, User } from "@prisma/client";

type PostWithDetails = Post & {
  author: User;
  likes: { userId: string }[];
  reposts: { userId: string }[];
  _count: {
    likes: number;
    comments: number;
    reposts: number;
  };
  // For reposts, the post will contain the original post
  post?: Post & {
    author: User;
    likes: { userId: string }[];
    reposts: { userId: string }[];
    _count: {
      likes: number;
      comments: number;
      reposts: number;
    };
  };
};

// Matches shape of a repost record loaded in ProfilePage (includes repost metadata and nested post)
type RepostWithDetails = {
  id: string;
  createdAt: Date;
  postId: string;
  userId: string;
  user: User; // reposter
  post: PostWithDetails; // original post with details
};

// Discriminated union to accurately represent posts vs reposts
type TimelineItem =
  | {
      type: 'post';
      item: PostWithDetails;
    }
  | {
      type: 'repost';
      item: RepostWithDetails;
      reposter: User;
    };

interface ProfileTabsProps {
  initialTimeline: TimelineItem[];
  userId: string;
  currentUserId?: string;
}

export function ProfileTabs({
  initialTimeline,
  userId,
  currentUserId,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("posts");
  interface FollowerUser {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
    bio: string | null;
    isFollowing: boolean;
  }

  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [following, setFollowing] = useState<FollowerUser[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "followers") {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/users/${userId}/followers`);
          if (!res.ok) throw new Error("Failed to fetch followers");
          const data = await res.json();
          setFollowers(data);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'An unknown error occurred');
        }
      });
    } else if (activeTab === "following") {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/users/${userId}/following`);
          if (!res.ok) throw new Error("Failed to fetch following");
          const data = await res.json();
          setFollowing(data);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'An unknown error occurred');
        }
      });
    }
  }, [activeTab, userId]);

  return (
    <Tabs
      defaultValue="posts"
      onValueChange={(value) => setActiveTab(value)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger className="px-2" value="posts">Posts</TabsTrigger>
        <TabsTrigger className="px-2" value="followers">Followers</TabsTrigger>
        <TabsTrigger className="px-2" value="following">Following</TabsTrigger>
      </TabsList>

      <TabsContent value="posts">
        <div className="space-y-0 sm:space-y-4 mt-4">
          {initialTimeline.map((timelineItem) => {
            if (timelineItem.type === "post") {
              return (
                <PostCard
                  key={`post-${timelineItem.item.id}`}
                  post={timelineItem.item}
                  currentUserId={currentUserId}
                />
              );
            } else {
              return (
                <PostCard
                  key={`repost-${timelineItem.item.id}`}
                  post={timelineItem.item.post}
                  currentUserId={currentUserId}
                  repostedBy={timelineItem.reposter}
                />
              );
            }
          })}
          {initialTimeline.length === 0 && (
            <p className="p-4 text-center text-gray-500">
              This user hasn&apos;t posted or reposted anything yet.
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="followers">
        {isPending && <p className="p-4 text-center">Loading...</p>}
        {error && <p className="p-4 text-center text-red-500">{error}</p>}
        {!isPending && !error && <UserList users={followers} />}
      </TabsContent>

      <TabsContent value="following">
        {isPending && <p className="p-4 text-center">Loading...</p>}
        {error && <p className="p-4 text-center text-red-500">{error}</p>}
        {!isPending && !error && <UserList users={following} />}
      </TabsContent>
    </Tabs>
  );
}
