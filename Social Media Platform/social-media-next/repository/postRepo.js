import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export async function createPost(userId, content) {
  return prisma.post.create({
    data: {
      userId: Number(userId),
      content,
    },
    include: {
      user: { select: { id: true, username: true } },
      _count: { select: { likes: true, retweets: true, comments: true } },
    },
  });
}

export async function addComment(userId, postId, content) {
  return prisma.comment.create({
    data: {
      userId: Number(userId),
      postId: Number(postId),
      content,
    },
    include: {
      user: { select: { id: true, username: true } },
    },
  });
}

export async function likePost(userId, postId) {
  return prisma.like.upsert({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
    update: {},
    create: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });
}

export async function unlikePost(userId, postId) {
  return prisma.like.delete({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
  });
}

export async function retweetPost(userId, postId) {
  return prisma.retweet.upsert({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
    update: {},
    create: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });
}

export async function unretweetPost(userId, postId) {
  return prisma.retweet.delete({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
  });
}

export async function getPostById(postId) {
  return prisma.post.findUnique({
    where: {
      id: Number(postId),
    },
    include: {
      user: { select: { id: true, username: true } },
      comments: {
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { likes: true, retweets: true, comments: true } },
    },
  });
}

export async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, username: true } },

      likes: true,
      retweets: true,

      comments: {
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: "desc" },
      },

      _count: {
        select: {
          likes: true,
          retweets: true,
          comments: true,
        },
      },
    },
  });
}

export async function deletePost(postId) {
  const id = Number(postId);

  await prisma.comment.deleteMany({
    where: { postId: id },
  });

  await prisma.like.deleteMany({
    where: { postId: id },
  });

  await prisma.retweet.deleteMany({
    where: { postId: id },
  });

  return prisma.post.delete({
    where: { id },
  });
}

export async function deleteComment(commentId) {
  return prisma.comment.delete({
    where: {
      id: Number(commentId),
    },
  });
}