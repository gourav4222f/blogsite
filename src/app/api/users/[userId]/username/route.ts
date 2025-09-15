import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// POST /api/users/[userId]/username
// body: { username: string }
export async function POST(
  req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await ctx.params;
    if (session.user.id !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { username } = await req.json().catch(() => ({}));

    if (typeof username !== "string") {
      return NextResponse.json({ message: "Username is required" }, { status: 400 });
    }

    const normalized = username.trim().toLowerCase();

    // Basic validation: 3-20 chars, letters, numbers, underscores only
    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
      return NextResponse.json(
        { message: "Username must be 3-20 characters and contain only letters, numbers, or underscores." },
        { status: 400 }
      );
    }

    // Check uniqueness (case-insensitive)
    const existing = await prisma.user.findFirst({
      where: { username: { equals: normalized, mode: "insensitive" } },
      select: { id: true },
    });

    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { username: normalized },
      select: { id: true, username: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}
