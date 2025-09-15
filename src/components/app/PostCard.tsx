import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Post, User } from "@prisma/client";
import { PostActions } from "./PostActions";
import Link from "next/link";
import { Repeat } from "lucide-react"; // Using lucide-react for a nice icon

type PostWithDetails = Post & {
  author: User;
  likes: { userId: string }[];
  reposts: { userId: string }[];
  _count: {
    likes: number;
    comments: number;
    reposts: number;
  };
};

interface PostCardProps {
  post: PostWithDetails;
  currentUserId?: string;
  repostedBy?: User; // This is the new optional prop
}

export function PostCard({ post, currentUserId, repostedBy }: PostCardProps) {
  const isLikedByCurrentUser = !!currentUserId && !!post.likes?.find(
    (like) => like.userId === currentUserId
  );


  const isRepostedByCurrentUser = !!currentUserId && !!post.reposts?.find(
    (repost) => repost.userId === currentUserId
  );

  return (
    <Card className="max-w-2xl mx-auto border-x-0 border-t-0 rounded-none sm:border sm:rounded-lg">
      {repostedBy && (
        <div className="flex items-center gap-2 px-4 pt-3 text-sm text-gray-500">
          <Repeat className="w-4 h-4" />
          <Link
            href={`/${repostedBy.username}`}
            className="font-semibold hover:underline"
          >
            {repostedBy.id === currentUserId ? "You" : repostedBy.name} reposted
          </Link>
        </div>
      )}
      <CardHeader className="p-4">
        <Link
          href={`/${post.author.username}`}
          className="flex items-center gap-4 group"
        >
          <Avatar>
            <AvatarImage
              src={post.author.image ?? undefined}
              alt={`@${post.author.username}`}
            />
            <AvatarFallback>
              {post.author.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 group-hover:underline">
              {post.author.name}
            </span>
            <span className="text-sm text-gray-500">
              @{post.author.username}
            </span>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <PostActions
        postId={post.id}
        initialLikesCount={post._count.likes}
        initialCommentsCount={post._count.comments}
        initialRepostsCount={post._count.reposts}
        initialIsLiked={isLikedByCurrentUser}
        initialIsReposted={isRepostedByCurrentUser}
      />
    </Card>
  );
}

