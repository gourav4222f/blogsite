import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { followUserSchema } from '@/lib/validations';
import { auth } from '@/auth';

/**
 * POST /api/users/[userId]/follow
 * Allows a user to follow or unfollow another user.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ userId: string }> }) {
  try {
    const session = await auth();
    const followerId = session?.user?.id;

    if (!followerId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await ctx.params;
    const validation = followUserSchema.safeParse({
      followingId: userId,
    });
    
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request', issues: validation.error.issues }, { status: 400 });
    }
    
    const { followingId } = validation.data;

    // Check if the follow relationship already exists
    const existingFollow = await prisma.relation.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existingFollow) {
      // If it exists, unfollow
      await prisma.relation.delete({ where: { followerId_followingId: { followerId, followingId } } });
      return NextResponse.json({ message: 'User unfollowed successfully.' });
    } else {
      // If it doesn't exist, follow
      await prisma.relation.create({ data: { followerId, followingId } });
      return NextResponse.json({ message: 'User followed successfully.' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
