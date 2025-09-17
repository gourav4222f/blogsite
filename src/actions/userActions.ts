"use server";

import { z } from "zod";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const UpdateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
});

type UpdateProfileState =
  {
    error: string | { name?: string[] };
    message?: string;
  }
  | { message: string; error?: undefined }
  | null;

export async function updateProfile(
  prevState: UpdateProfileState,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated." };
  }

  const validatedFields = UpdateProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedFields.data.name,
      },
    });

    // Revalidate the user's profile page and settings page to show new data
    const updated = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });
    if (updated?.username) {
      revalidatePath(`/${updated.username}`);
    }
    revalidatePath("/settings");

    return { message: "Profile updated successfully!" };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "Something went wrong. Could not update profile." };
  }
}
