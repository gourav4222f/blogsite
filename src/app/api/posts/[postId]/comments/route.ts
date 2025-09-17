import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createCommentSchema } from '@/lib/validations';
import { auth } from '@/auth';

/**
 * GET /api/posts/[postId]/comments
 * Fetches comments for a specific post.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    try {
        const { postId } = await params;
        const comments = await prisma.comment.findMany({
            where: { 
                postId,
                parentId: null // Only fetch top-level comments
            },
            orderBy: { createdAt: 'asc' },
            include: {
                author: { select: { id: true, name: true, username: true, image: true }},
                replies: { // Nested replies
                    include: {
                        author: { select: { id: true, name: true, username: true, image: true }}
                    }
                }
            }
        });
        return NextResponse.json(comments);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
    }
}


/**
 * POST /api/posts/[postId]/comments
 * Creates a new comment or a reply on a post.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { postId } = await params;
    const validation = createCommentSchema.safeParse({ ...body, postId });

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request', issues: validation.error.issues }, { status: 400 });
    }

    const newComment = await prisma.comment.create({
      data: {
        content: validation.data.content,
        postId: validation.data.postId,
        parentId: validation.data.parentId ?? null,
        authorId: userId,
      },
    });
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
