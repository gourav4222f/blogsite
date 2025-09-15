'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { createPostSchema } from '@/lib/validations';
import { z } from 'zod';

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
    const data = Object.fromEntries(formData);
    const validation = createPostSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        message: 'Validation failed.',
        errors: validation.error.issues,
      };
    }

    const { title, content, authorId } = validation.data;
    
    // Same logic as before: ensure user exists
    await prisma.user.upsert({
        where: { id: authorId },
        update: {},
        create: { id: authorId, email: `${authorId}@example.com`, name: 'Test User' }
    });

    await prisma.post.create({
      data: { title, content, authorId },
    });
    
    // Revalidate the path to update the UI with the new post.
    revalidatePath('/');

    return {
      success: true,
      message: `Successfully created post: ${title}`,
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while creating the post.',
    };
  }
}
