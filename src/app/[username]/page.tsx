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
          likes: {
            where: currentUserId ? { userId: currentUserId } : undefined,
            select: { userId: true },
          },
          reposts: {
            where: currentUserId ? { userId: currentUserId } : undefined,
            select: { userId: true },
          },
        },
      },
      reposts: {
        include: {
          user: true, // The user who did the reposting
          post: {
            include: {
              author: true,
              _count: { select: { likes: true, comments: true, reposts: true } },
              likes: {
                where: currentUserId ? { userId: currentUserId } : undefined,
                select: { userId: true },
              },
              reposts: {
                where: currentUserId ? { userId: currentUserId } : undefined,
                select: { userId: true },
              },
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

  // Combine posts and reposts for the initial timeline with explicit/narrowed shapes
  const timeline = [
    ...user.posts.map((p) => ({
      type: "post" as const,
      item: {
        id: p.id,
        content: p.content,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        authorId: p.authorId,
        author: {
          id: p.author.id,
          name: p.author.name,
          username: p.author.username,
          email: p.author.email,
          image: p.author.image,
          createdAt: p.author.createdAt,
          updatedAt: p.author.updatedAt,
          emailVerified: p.author.emailVerified,
        },
        likes: (p.likes ?? []).map((l) => ({ userId: l.userId })),
        reposts: (p.reposts ?? []).map((r) => ({ userId: r.userId })),
        _count: p._count,
      },
    })),
    ...user.reposts.map((r) => ({
      type: "repost" as const,
      item: {
        id: r.id,
        createdAt: r.createdAt,
        postId: r.postId,
        userId: r.userId,
        user: {
          id: r.user.id,
          name: r.user.name,
          username: r.user.username,
          email: r.user.email,
          image: r.user.image,
          createdAt: r.user.createdAt,
          updatedAt: r.user.updatedAt,
          emailVerified: r.user.emailVerified,
        },
        post: {
          id: r.post.id,
          content: r.post.content,
          createdAt: r.post.createdAt,
          updatedAt: r.post.updatedAt,
          authorId: r.post.authorId,
          author: {
            id: r.post.author.id,
            name: r.post.author.name,
            username: r.post.author.username,
            email: r.post.author.email,
            image: r.post.author.image,
            createdAt: r.post.author.createdAt,
            updatedAt: r.post.author.updatedAt,
            emailVerified: r.post.author.emailVerified,
          },
          likes: (r.post.likes ?? []).map((l) => ({ userId: l.userId })),
          reposts: (r.post.reposts ?? []).map((x) => ({ userId: x.userId })),
          _count: r.post._count,
        },
      },
      reposter: {
        id: r.user.id,
        name: r.user.name,
        username: r.user.username,
        email: r.user.email,
        image: r.user.image,
        createdAt: r.user.createdAt,
        updatedAt: r.user.updatedAt,
        emailVerified: r.user.emailVerified,
      },
    })),
  ].sort(
    (a, b) =>
      new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime()
  );

  const isFollowing = !!user.followers.length;

  return (
    <div className="bg-white text-black">
      <div className="border-b bg-white py-8 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 max-w-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 md:h-28 md:w-28">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-xl text-gray-600">@{user.username}</p>
                <div className="mt-4 flex gap-6 text-gray-700">
                  <span>
                    <span className="font-semibold">{user._count.following}</span>{" "}
                    Following
                  </span>
                  <span>
                    <span className="font-semibold">{user._count.followers}</span>{" "}
                    Followers
                  </span>
                </div>
              </div>
            </div>
            {currentUserId && currentUserId !== user.id && (
              <FollowButton
                targetUserId={user.id}
                initialIsFollowing={isFollowing}
                className="mt-4 md:mt-0 text-white bg-black hover:bg-gray-800 py-3 px-6 rounded-lg transition-all duration-300 text-lg md:text-xl"
              />
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 md:px-8">
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
