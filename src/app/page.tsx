import { auth } from "@/auth";
import { CreatePostForm } from "@/components/app/CreatePostForm";
import { PostCard } from "@/components/app/PostCard";
import prisma from "@/lib/prisma";
import { AuthButton } from "@/components/AuthButton";
import { UserSearch } from "@/components/app/UserSearch";

// A type for our combined timeline items
type TimelineItem =
  | { type: "post"; item: any; author: any }
  | { type: "repost"; item: any; author: any };

export default async function Home() {
  const session = await auth();
  const currentUserId = session?.user?.id;

  let timeline: TimelineItem[] = [];

  if (currentUserId) {
    // Find who the current user is following
    const following = await prisma.relation.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    // Fetch original posts from followed users
    const posts = await prisma.post.findMany({
      where: { authorId: { in: followingIds } },
      include: {
        author: true,
        _count: { select: { likes: true, comments: true, reposts: true } },
        likes: { where: { userId: currentUserId } },
        reposts: { where: { userId: currentUserId } },
      },
    });

    // Fetch reposts from followed users
    const reposts = await prisma.repost.findMany({
      where: { userId: { in: followingIds } },
      include: {
        user: true, // The user who did the reposting
        post: {
          include: {
            author: true,
            _count: { select: { likes: true, comments: true, reposts: true } },
            likes: { where: { userId: currentUserId } },
            reposts: { where: { userId: currentUserId } },
          },
        },
      },
    });

    // Combine and sort the timeline
    timeline = [
      ...posts.map((post) => ({
        type: "post" as const,
        item: post,
        author: post.author,
      })),
      ...reposts.map((repost) => ({
        type: "repost" as const,
        item: repost,
        author: repost.user,
      })),
    ];

    timeline.sort(
      (a, b) =>
        new Date(b.item.createdAt).getTime() -
        new Date(a.item.createdAt).getTime()
    );
  }

  return (
    <main>
      <div className="mx-auto max-w-2xl">
        <header className="p-4 flex justify-between items-center">          
           <div className="hidden md:block w-full"> <UserSearch/>                  </div>
          <AuthButton />
        </header>
        <div className="border-b p-4">
          {session ? (
            <CreatePostForm userImage={session.user?.image} />
          ) : (
            <p className="text-center text-gray-500">
              Sign in to post and see your feed.
            </p>
          )}
        </div>
        <div className="space-y-0 sm:space-y-4 mt-8">
          {timeline.map((timelineItem) => {
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
                  repostedBy={timelineItem.author}
                />
              );
            }
          })}
        </div>
      </div>
    </main>
  );
}


