"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function CreatePostForm() {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      setContent("");
      // In a real app, you'd invalidate a cache or refetch posts here.
      // For now, we can just reload the page to see the new post.
      window.location.reload();
    } catch (error) {
      console.error(error);
      // You could show an error toast to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) return null; // Don't render the form if the user is not logged in

  return (
    <Card className="max-w-2xl mx-auto border-x-0 rounded-none sm:border sm:rounded-lg">
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
              placeholder="What's happening?"
              className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end p-4 pt-0">
          <Button type="submit" disabled={!content.trim() || isSubmitting}>
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
