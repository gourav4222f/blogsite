import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty'),
});

export const createCommentSchema = z.object({
  postId: z.string().cuid('Invalid post ID'),
  content: z.string().min(1, 'Comment cannot be empty'),
  parentId: z.string().cuid('Invalid parent ID').nullable().optional(),
});

export const likePostSchema = z.object({
  postId: z.string().cuid('Invalid post ID'),
});

export const followUserSchema = z.object({
  followingId: z.string().cuid('Invalid user ID to follow'),
});
