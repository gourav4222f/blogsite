import { auth } from "@/auth";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { PostCard } from "@/components/app/PostCard";
import { CommentCard } from "@/components/app/CommentCard";
import { AddCommentForm } from "@/components/app/AddCommentForm";
import type { Post, User } from "@prisma/client";

interface PostPageProps {
  params: {
    postId: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  // 1) Fetch only scalar fields to avoid relation validation on inconsistent data
  const postScalars = await prisma.post.findUnique({
    where: { id: params.postId },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      content: true,
      authorId: true,
    },
  });

  if (!postScalars) {
    notFound();
  }

  // Load the author separately and bail if missing
  const author = await prisma.user.findUnique({ where: { id: postScalars.authorId } });
  if (!author) {
    // The post exists but its author was deleted -> treat as not found to avoid UI breakage
    notFound();
  }

  // 2) Compute counts separately
  const [likesCount, commentsCount, repostsCount] = await Promise.all([
    prisma.like.count({ where: { postId: postScalars.id } }),
    prisma.comment.count({ where: { postId: postScalars.id } }),
    prisma.repost.count({ where: { postId: postScalars.id } }),
  ]);

  // 3) Determine current user like/repost for PostCard UI state
  const [likedByMe, repostedByMe] = await Promise.all([
    currentUserId
      ? prisma.like.findFirst({ where: { postId: postScalars.id, userId: currentUserId }, select: { userId: true } })
      : Promise.resolve(null),
    currentUserId
      ? prisma.repost.findFirst({ where: { postId: postScalars.id, userId: currentUserId }, select: { userId: true } })
      : Promise.resolve(null),
  ]);

  type PostWithDetails = Post & {
    author: User;
    likes: { userId: string }[];
    reposts: { userId: string }[];
    _count: { likes: number; comments: number; reposts: number };
  };

  const postForCard: PostWithDetails = {
    id: postScalars.id,
    createdAt: postScalars.createdAt,
    updatedAt: postScalars.updatedAt,
    content: postScalars.content,
    authorId: postScalars.authorId,
    author,
    likes: likedByMe ? [{ userId: likedByMe.userId }] : [],
    reposts: repostedByMe ? [{ userId: repostedByMe.userId }] : [],
    _count: {
      likes: likesCount,
      comments: commentsCount,
      reposts: repostsCount,
    },
  };

  // 4) Fetch comments separately, include authors; filter any orphaned comments safely
  const comments = await prisma.comment.findMany({
    where: { postId: postScalars.id },
    orderBy: { createdAt: "asc" },
    include: { author: true },
  });
  const safeComments = comments.filter((c) => Boolean(c.author));

  return (
    <div className="container mx-auto max-w-2xl p-0 sm:p-4 md:p-8">
       {/* We can reuse our PostCard component to display the main post */}
      <PostCard post={postForCard} currentUserId={currentUserId} />
      
      <div className="my-6">
        <AddCommentForm postId={postScalars.id} />
      </div>

      <div className="space-y-0 sm:space-y-4">
        <h2 className="px-4 text-xl font-bold">Replies</h2>
        {safeComments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
        {safeComments.length === 0 && (
           <p className="px-4 text-gray-500">No replies yet.</p>
        )}
      </div>
    </div>
  );
}
