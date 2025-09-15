import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createPostSchema } from '@/lib/validations';
import { auth } from '@/auth';

/**
 * GET /api/posts
 * Fetches all posts from the database.
 * @returns {NextResponse} A JSON response with the posts or an error message.
 */
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true, username: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(posts);
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
