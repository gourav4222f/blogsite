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
      where: { followingId: params.userId },
      include: {
        follower: {
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

    const followers = follows.map((f) => {
      type FollowerWithOptionalFollowers = typeof f.follower & {
        followers?: { followerId: string }[];
      };
      const follower = f.follower as FollowerWithOptionalFollowers;
      return {
        id: follower.id,
        name: follower.name,
        username: follower.username,
        image: follower.image,
        isFollowing: currentUserId ? (follower.followers?.length ?? 0) > 0 : false,
      };
    });

    return NextResponse.json(followers);
  } catch (error) {
    console.error("Failed to fetch followers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
