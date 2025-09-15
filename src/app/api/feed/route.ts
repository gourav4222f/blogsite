import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * GET /api/feed
 * Fetches the personalized feed for a user.
 */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Find all users the current user is following.
    const following = await prisma.relation.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f: { followingId: string }) => f.followingId);

    // 2. Fetch posts from those followed users.
    const feed = await prisma.post.findMany({
      where: {
        authorId: {
          in: [...followingIds, userId], // Include user's own posts in the feed
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        _count: { // Get counts of likes and comments
          select: { likes: true, comments: true },
        },
      },
      take: 20, // Simple pagination
    });

    return NextResponse.json(feed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
