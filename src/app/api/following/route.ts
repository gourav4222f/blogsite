import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const following = await prisma.relation.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    return NextResponse.json(following);
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching following' },
      { status: 500 }
    );
  }
}
