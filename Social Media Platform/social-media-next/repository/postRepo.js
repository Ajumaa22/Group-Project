const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// create a new post for a user
async function createPost(userId, content) {
  return prisma.post.create({
    data: { userId, content },
    include: { user: { select: { id: true, username: true } } },
  });
}

// add a comment to a post
async function addComment(userId, postId, content) {
  return prisma.comment.create({
    data: { userId, postId, content },
    include: { user: { select: { id: true, username: true } } },
  });
}

// like a post, upsert so the same user cant like twice
async function likePost(userId, postId) {
  return prisma.like.upsert({
    where:  { userId_postId: { userId, postId } },
    update: {},
    create: { userId, postId },
  });
}

// remove a like from a post
async function unlikePost(userId, postId) {
  return prisma.like.delete({
    where: { userId_postId: { userId, postId } },
  });
}

// retweet a post, same user cant retweet the same post twice
async function retweetPost(userId, postId) {
  return prisma.retweet.upsert({
    where:  { userId_postId: { userId, postId } },
    update: {},
    create: { userId, postId },
  });
}

// undo a retweet
async function unretweetPost(userId, postId) {
  return prisma.retweet.delete({
    where: { userId_postId: { userId, postId } },
  });
}

// get one post by id with its comments and like/retweet counts
async function getPostById(postId) {
  return prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: { select: { id: true, username: true } },
      comments: {
        include: { user: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { likes: true, retweets: true } },
    },
  });
}

// get all posts sorted by newest first
async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user:   { select: { id: true, username: true } },
      _count: { select: { likes: true, retweets: true, comments: true } },
    },
  });
}

module.exports = {
  createPost,
  addComment,
  likePost,
  unlikePost,
  retweetPost,
  unretweetPost,
  getPostById,
  getAllPosts,
};