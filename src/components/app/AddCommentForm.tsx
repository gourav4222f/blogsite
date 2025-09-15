"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface AddCommentFormProps {
  postId: string;
}

export function AddCommentForm({ postId }: AddCommentFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      setContent("");
      // Refresh the page to show the new comment
      router.refresh();
    } catch (error) {
      console.error(error);
      // Show an error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return null;

  return (
    <Card className="border-x-0 rounded-none sm:border sm:rounded-lg">
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src={session.user?.image ?? undefined} />
              <AvatarFallback>
                {session.user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post your reply"
              className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0"
              rows={2}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end p-4 pt-0">
          <Button type="submit" disabled={!content.trim() || isSubmitting}>
            {isSubmitting ? "Replying..." : "Reply"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
