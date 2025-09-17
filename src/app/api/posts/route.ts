import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createPostSchema } from '@/lib/validations';
import { auth } from '@/auth';

/**
 * GET /api/posts
 * Fetches posts with pagination and optional sorting
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Number of posts per page (default: 10)
 * - sortBy: Sort field (default: 'createdAt')
 * - order: Sort order ('asc' or 'desc', default: 'desc')
 * - followingIds: Comma-separated list of user IDs to filter by (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const followingIds = searchParams.get('followingIds');

    // Validate pagination
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { message: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;
    const orderBy = sortBy === 'likes' 
      ? { likes: { _count: order as 'asc' | 'desc' } }
      : { [sortBy]: order };

    const where = followingIds 
      ? { authorId: { in: followingIds.split(',') } }
      : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true, username: true },
          },
          _count: {
            select: { likes: true, comments: true, reposts: true },
          },
          likes: {
            select: { userId: true },
            where: { userId: searchParams.get('userId') || undefined },
          },
        },
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

/**
 * POST /api/posts
 * Creates a new post.
 * @param {NextRequest} req The incoming request object.
 * @returns {NextResponse} A JSON response with the created post or an error message.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const validation = createPostSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request data', issues: validation.error.issues }, { status: 400 });
    }

    const { content } = validation.data;

    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: userId,
      },
    });

    return NextResponse.json(newPost, { status: 201 });

  } catch (error) {
    console.error('Error creating post:', error);
    // Handle specific Prisma errors if necessary
    // e.g., if (error instanceof Prisma.PrismaClientKnownRequestError) { ... }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
