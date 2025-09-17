import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { postId } = await params;

  try {
    const existingRepost = await prisma.repost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingRepost) {
      // User has already reposted, so we "un-repost"
      await prisma.repost.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      return NextResponse.json({ message: "Repost removed" }, { status: 200 });
    } else {
      // Create a new repost
      await prisma.repost.create({
        data: {
          userId,
          postId,
        },
      });
      return NextResponse.json({ message: "Post reposted" }, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
