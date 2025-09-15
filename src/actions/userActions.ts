"use server";

import { z } from "zod";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const UpdateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
});

export async function updateProfile(formData: FormData) {
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
    if (session.user.username) {
      revalidatePath(`/${session.user.username}`);
    }
    revalidatePath("/settings");

    return { message: "Profile updated successfully!" };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "Something went wrong. Could not update profile." };
  }
}
