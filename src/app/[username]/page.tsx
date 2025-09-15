import { auth } from "@/auth";
import { FollowButton } from "@/components/app/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProfileTabs } from "@/components/app/ProfileTabs"; // Import the new component

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      posts: {
        include: {
          author: true,
          _count: { select: { likes: true, comments: true, reposts: true } },
          likes: currentUserId ? { where: { userId: currentUserId } } : false,
          reposts: currentUserId ? { where: { userId: currentUserId } } : false,
        },
      },
      reposts: {
        include: {
          user: true, // The user who did the reposting
          post: {
            include: {
              author: true,
              _count: { select: { likes: true, comments: true, reposts: true } },
              likes: currentUserId
                ? { where: { userId: currentUserId } }
                : false,
              reposts: currentUserId
                ? { where: { userId: currentUserId } }
                : false,
            },
          },
        },
      },
      followers: currentUserId
        ? { where: { followerId: currentUserId } }
        : false,
      _count: {
        select: { followers: true, following: true },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Combine posts and reposts for the initial timeline
  const timeline = [
    ...user.posts.map((post) => ({ type: "post" as const, item: post })),
    ...user.reposts.map((repost) => ({
      type: "repost" as const,
      item: repost,
      reposter: repost.user,
    })),
  ].sort(
    (a, b) =>
      new Date(b.item.createdAt).getTime() -
      new Date(a.item.createdAt).getTime()
  );

  const isFollowing = !!user.followers.length;

  return (
    <div>
      <div className="border-b bg-white p-8">
        <div className="container mx-auto max-w-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-gray-500">@{user.username}</p>
                <div className="mt-4 flex gap-4 text-gray-700">
                  <span>
                    <span className="font-bold">{user._count.following}</span>{" "}
                    Following
                  </span>
                  <span>
                    <span className="font-bold">{user._count.followers}</span>{" "}
                    Followers
                  </span>
                </div>
              </div>
            </div>
            {currentUserId && currentUserId !== user.id && (
              <FollowButton
                targetUserId={user.id}
                initialIsFollowing={isFollowing}
              />
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto p-0 sm:p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <ProfileTabs
            userId={user.id}
            initialTimeline={timeline}
            currentUserId={currentUserId}
          />
        </div>
      </main>
    </div>
  );
}

