import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { likePostSchema } from '@/lib/validations';
import { auth } from '@/auth';

/**
 * POST /api/posts/[postId]/like
 * Toggles a like on a post for a given user.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const validation = likePostSchema.safeParse({
      postId: (await params).postId,
    });

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request', issues: validation.error.issues }, { status: 400 });
    }

    const { postId } = validation.data;
    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
      return NextResponse.json({ message: 'Post unliked.' });
    } else {
      await prisma.like.create({ data: { userId, postId } });
      return NextResponse.json({ message: 'Post liked.' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
