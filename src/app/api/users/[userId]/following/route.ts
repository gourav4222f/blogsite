import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  try {
    const follows = await prisma.relation.findMany({
      where: { followerId: params.userId },
      include: {
        following: {
          include: {
            followers: currentUserId
              ? {
                  where: {
                    followerId: currentUserId,
                  },
                }
              : false,
          },
        },
      },
    });

    const following = follows.map((f) => ({
      id: f.following.id,
      name: f.following.name,
      username: f.following.username,
      image: f.following.image,
      isFollowing: currentUserId ? f.following.followers.length > 0 : false,
    }));

    return NextResponse.json(following);
  } catch (error) {
    console.error("Failed to fetch following:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
