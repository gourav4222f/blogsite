import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Comment, User } from "@prisma/client";
import Link from "next/link";

type CommentWithAuthor = Comment & {
  author: User;
};

interface CommentCardProps {
  comment: CommentWithAuthor;
}

export function CommentCard({ comment }: CommentCardProps) {
  return (
    <Card className="border-x-0 border-t-0 rounded-none">
      <CardHeader className="p-4">
      <Link href={`/${comment.author.username}`} className="flex items-center gap-4 group">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage
              src={comment.author.image ?? undefined}
              alt={`@${comment.author.username}`}
            />
            <AvatarFallback>
              {comment.author.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">
              {comment.author.name}
            </span>
            <span className="text-sm text-gray-500">
              @{comment.author.username}
            </span>
          </div>
        </div>
      </Link>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
      </CardContent>
    </Card>
  );
}
