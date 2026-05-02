import prisma from "@/repository/prisma";

export async function createUser(username, email, password) {
  return prisma.user.create({
    data: { username, email, password },
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      bio: true,
      avatar: true,
      createdAt: true,
    },
  });
}

export async function getUserById(userId) {
  return prisma.user.findUnique({
    where: { id: Number(userId) },
    include: {
      followers: {
        include: {
          follower: {
            select: { id: true, username: true },
          },
        },
      },
      following: {
        include: {
          following: {
            select: { id: true, username: true },
          },
        },
      },
    },
  });
}

export async function updateUser(userId, data) {
  return prisma.user.update({
    where: { id: Number(userId) },
    data,
  });
}

export async function deleteUser(userId) {
  return prisma.user.delete({
    where: { id: Number(userId) },
  });
}

export async function followUser(followerId, followingId) {
  return prisma.follow.create({
    data: {
      followerId: Number(followerId),
      followingId: Number(followingId),
    },
  });
}

export async function unfollowUser(followerId, followingId) {
  return prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: Number(followerId),
        followingId: Number(followingId),
      },
    },
  });
}

export async function getFollowers(userId) {
  return prisma.follow.findMany({
    where: { followingId: Number(userId) },
    include: {
      follower: {
        select: { id: true, username: true },
      },
    },
  });
}

export async function getFollowing(userId) {
  return prisma.follow.findMany({
    where: { followerId: Number(userId) },
    include: {
      following: {
        select: { id: true, username: true },
      },
    },
  });
}