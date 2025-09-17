'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { createPostSchema } from '@/lib/validations';
import { z } from 'zod';
import { auth } from '@/auth';

// We define a return type for our action for better type safety.
export type FormState = {
  success: boolean;
  message: string;
  errors?: z.ZodIssue[];
};

export async function createPostAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return {
        success: false,
        message: 'Unauthorized.',
      };
    }
    const data = Object.fromEntries(formData);
    const validation = createPostSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        message: 'Validation failed.',
        errors: validation.error.issues,
      };
    }
    const { content } = validation.data;

    await prisma.post.create({
      data: { content, authorId: userId },
    });
    
    // Revalidate the path to update the UI with the new post.
    revalidatePath('/');

    return {
      success: true,
      message: `Successfully created post`,
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while creating the post.',
    };
  }
}
