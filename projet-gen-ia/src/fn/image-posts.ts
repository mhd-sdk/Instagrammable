import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authenticatedMiddleware } from "./middleware";
import {
  createImagePost,
  findImagePostById,
  findImagePostsByUserId,
  findImagePostByIdWithUser,
  updateImagePost,
  deleteImagePost,
} from "~/data-access/image-posts";

// ============================================
// Zod Validation Schemas
// ============================================

const createImagePostSchema = z.object({
  title: z.string().max(200, "Title must be under 200 characters").optional().or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL"),
  prompt: z.string().min(1, "Prompt is required").max(2000, "Prompt must be under 2000 characters"),
  status: z.enum(["draft", "published", "archived"]).optional().default("draft"),
});

const updateImagePostSchema = z.object({
  id: z.string(),
  title: z.string().max(200, "Title must be under 200 characters").optional().or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL").optional(),
  prompt: z.string().min(1, "Prompt is required").max(2000, "Prompt must be under 2000 characters").optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

// ============================================
// Server Functions
// ============================================

/**
 * Create a new image post
 */
export const createImagePostFn = createServerFn({
  method: "POST",
})
  .inputValidator(createImagePostSchema)
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const postData = {
      id: crypto.randomUUID(),
      userId: context.userId,
      title: data.title || null,
      imageUrl: data.imageUrl,
      prompt: data.prompt,
      status: data.status || "draft",
    };

    const newPost = await createImagePost(postData);
    return newPost;
  });

/**
 * Get a single image post by ID
 */
export const getImagePostFn = createServerFn({
  method: "GET",
})
  .inputValidator(z.object({ id: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const imagePost = await findImagePostByIdWithUser(data.id);

    if (!imagePost) {
      throw new Error("Post not found");
    }

    // Authorization check: verify the post belongs to the user
    if (imagePost.userId !== context.userId) {
      throw new Error("Unauthorized: You can only view your own posts");
    }

    return imagePost;
  });

/**
 * Get all image posts for the authenticated user
 */
export const getUserImagePostsFn = createServerFn({
  method: "GET",
})
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const posts = await findImagePostsByUserId(context.userId);
    return posts;
  });

/**
 * Update an existing image post
 */
export const updateImagePostFn = createServerFn({
  method: "POST",
})
  .inputValidator(updateImagePostSchema)
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { id, ...updateData } = data;

    // Authorization check: verify the post exists and belongs to the user
    const existingPost = await findImagePostById(id);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.userId !== context.userId) {
      throw new Error("Unauthorized: You can only edit your own posts");
    }

    const updatedPost = await updateImagePost(id, {
      title: updateData.title !== undefined ? (updateData.title || null) : undefined,
      imageUrl: updateData.imageUrl,
      prompt: updateData.prompt,
      status: updateData.status,
    });

    if (!updatedPost) {
      throw new Error("Failed to update post");
    }

    return updatedPost;
  });

/**
 * Delete an image post
 */
export const deleteImagePostFn = createServerFn({
  method: "POST",
})
  .inputValidator(z.object({ id: z.string() }))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { id } = data;

    // Authorization check: verify the post exists and belongs to the user
    const existingPost = await findImagePostById(id);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.userId !== context.userId) {
      throw new Error("Unauthorized: You can only delete your own posts");
    }

    const deleted = await deleteImagePost(id);

    if (!deleted) {
      throw new Error("Failed to delete post");
    }

    return { success: true };
  });

/**
 * Update post status (publish, archive, etc.)
 */
export const updateImagePostStatusFn = createServerFn({
  method: "POST",
})
  .inputValidator(
    z.object({
      id: z.string(),
      status: z.enum(["draft", "published", "archived"]),
    })
  )
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { id, status } = data;

    // Authorization check: verify the post exists and belongs to the user
    const existingPost = await findImagePostById(id);
    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.userId !== context.userId) {
      throw new Error("Unauthorized: You can only modify your own posts");
    }

    const updatedPost = await updateImagePost(id, { status });

    if (!updatedPost) {
      throw new Error("Failed to update post status");
    }

    return updatedPost;
  });
