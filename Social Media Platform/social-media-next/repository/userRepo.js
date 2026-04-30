const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



// create user
async function createUser(username, email, password) {
  return prisma.user.create({
    data: { username, email, password }
  });
}

// get all users
async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      bio: true,
      avatar: true,
      createdAt: true
    }
  });
}

// get user by id (with followers/following)
async function getUserById(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      followers: {
        include: {
          follower: {
            select: { id: true, username: true }
          }
        }
      },
      following: {
        include: {
          following: {
            select: { id: true, username: true }
          }
        }
      }
    }
  });
}

// update user
async function updateUser(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data
  });
}

// delete user
async function deleteUser(userId) {
  return prisma.user.delete({
    where: { id: userId }
  });
}

//
//  FOLLOW FUNCTIONS
//

async function followUser(followerId, followingId) {
  return prisma.follow.create({
    data: { followerId, followingId }
  });
}

async function unfollowUser(followerId, followingId) {
  return prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId
      }
    }
  });
}

async function getFollowers(userId) {
  return prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: { id: true, username: true }
      }
    }
  });
}

async function getFollowing(userId) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: { id: true, username: true }
      }
    }
  });
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,

  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};