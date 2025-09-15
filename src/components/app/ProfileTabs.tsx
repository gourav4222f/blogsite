"use client";

import { useState, useEffect, useTransition } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "./PostCard";
import { UserList } from "./UserList";

type TimelineItem =
  | { type: "post"; item: any }
  | { type: "repost"; item: any; reposter: any };

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
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
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
        } catch (e: any) {
          setError(e.message);
        }
      });
    } else if (activeTab === "following") {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/users/${userId}/following`);
          if (!res.ok) throw new Error("Failed to fetch following");
          const data = await res.json();
          setFollowing(data);
        } catch (e: any) {
          setError(e.message);
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
        <TabsTrigger value="posts">Posts & Reposts</TabsTrigger>
        <TabsTrigger value="followers">Followers</TabsTrigger>
        <TabsTrigger value="following">Following</TabsTrigger>
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
