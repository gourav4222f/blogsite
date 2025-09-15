import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: q,
              mode: "insensitive", // Case-insensitive search
            },
          },
          {
            username: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
        // Exclude the current user from the search results
        NOT: {
          id: currentUserId,
        },
      },
      take: 10, // Limit the number of results for performance
      include: {
        // Include followers to check if the current user is following them
        followers: {
          where: {
            followerId: currentUserId,
          },
        },
      },
    });

    // Map the Prisma user object to the simpler structure your frontend expects
    const results = users.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      isFollowing: user.followers.length > 0, // isFollowing is true if the relation exists
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("User search failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
