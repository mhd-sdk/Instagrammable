import { eq, desc, and } from "drizzle-orm";
import { database } from "~/db";
import {
  post,
  user,
  type Post,
  type CreatePostData,
  type UpdatePostData,
  type User,
} from "~/db/schema";

export type PostWithUser = Post & {
  user: Pick<User, "id" | "name" | "image">;
};

/**
 * Create a new image post
 */
export async function createImagePost(
  postData: CreatePostData
): Promise<Post> {
  const [newPost] = await database
    .insert(post)
    .values({
      ...postData,
      updatedAt: new Date(),
    })
    .returning();

  return newPost;
}

/**
 * Find a post by its ID
 */
export async function findImagePostById(id: string): Promise<Post | null> {
  const [result] = await database
    .select()
    .from(post)
    .where(eq(post.id, id))
    .limit(1);

  return result || null;
}

/**
 * Find a post by ID with user information
 */
export async function findImagePostByIdWithUser(
  id: string
): Promise<PostWithUser | null> {
  const [result] = await database
    .select({
      id: post.id,
      userId: post.userId,
      title: post.title,
      imageUrl: post.imageUrl,
      prompt: post.prompt,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(post)
    .innerJoin(user, eq(post.userId, user.id))
    .where(eq(post.id, id))
    .limit(1);

  return result || null;
}

/**
 * Find all posts for a specific user
 */
export async function findImagePostsByUserId(userId: string): Promise<Post[]> {
  return await database
    .select()
    .from(post)
    .where(eq(post.userId, userId))
    .orderBy(desc(post.createdAt));
}

/**
 * Find posts by user ID with user information
 */
export async function findImagePostsByUserIdWithUser(
  userId: string
): Promise<PostWithUser[]> {
  const results = await database
    .select({
      id: post.id,
      userId: post.userId,
      title: post.title,
      imageUrl: post.imageUrl,
      prompt: post.prompt,
      status: post.status,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(post)
    .innerJoin(user, eq(post.userId, user.id))
    .where(eq(post.userId, userId))
    .orderBy(desc(post.createdAt));

  return results;
}

/**
 * Update an existing post
 */
export async function updateImagePost(
  postId: string,
  data: UpdatePostData
): Promise<Post | null> {
  const [updated] = await database
    .update(post)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(post.id, postId))
    .returning();

  return updated || null;
}

/**
 * Delete a post
 */
export async function deleteImagePost(postId: string): Promise<boolean> {
  const [deleted] = await database
    .delete(post)
    .where(eq(post.id, postId))
    .returning();

  return deleted !== undefined;
}

/**
 * Get posts count for a user
 */
export async function getImagePostsCountByUserId(userId: string): Promise<number> {
  const result = await database
    .select()
    .from(post)
    .where(eq(post.userId, userId));

  return result.length;
}
