import prisma from "@/repos/prisma";

export async function getStats() {
  const userCount = await prisma.user.count();
  const followCount = await prisma.follow.count();
  const postCount = await prisma.post.count();

  const avgFollowersPerUser =
    userCount === 0 ? 0 : Math.round(followCount / userCount);

  const avgPostsPerUser =
    userCount === 0 ? 0 : Math.round(postCount / userCount);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const mostActiveGroup = await prisma.post.groupBy({
    by: ["userId"],
    where: {
      createdAt: {
        gte: threeMonthsAgo,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 1,
  });

  const mostActiveUser = mostActiveGroup[0]
    ? await prisma.user.findUnique({
        where: { id: mostActiveGroup[0].userId },
      })
    : null;

  const mostLikedGroup = await prisma.like.groupBy({
    by: ["postId"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 1,
  });

  const mostLikedPost = mostLikedGroup[0]
    ? await prisma.post.findUnique({
        where: { id: mostLikedGroup[0].postId },
        include: { user: true },
      })
    : null;

  const mostCommentedGroup = await prisma.comment.groupBy({
    by: ["postId"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 1,
  });

  const mostCommentedPost = mostCommentedGroup[0]
    ? await prisma.post.findUnique({
        where: { id: mostCommentedGroup[0].postId },
        include: { user: true },
      })
    : null;

  const totalEngagementPerUser = await prisma.$queryRaw`
    SELECT 
      User.username,
      COUNT(DISTINCT Like.id) + COUNT(DISTINCT Comment.id) AS totalEngagement
    FROM User
    LEFT JOIN Post ON Post.userId = User.id
    LEFT JOIN Like ON Like.postId = Post.id
    LEFT JOIN Comment ON Comment.postId = Post.id
    GROUP BY User.id
    ORDER BY totalEngagement DESC
    LIMIT 5
  `;

  return {
    avgFollowersPerUser,
    avgPostsPerUser,

    mostActiveUserLast3Months: {
      username: mostActiveUser?.username || "No user",
      postsCount: mostActiveGroup[0]?._count.id || 0,
    },

    mostLikedPost: {
      likesCount: mostLikedGroup[0]?._count.id || 0,
      content: mostLikedPost?.content || "No post",
      authorUsername: mostLikedPost?.user?.username || "No author",
    },

    mostCommentedPost: {
      commentsCount: mostCommentedGroup[0]?._count.id || 0,
      content: mostCommentedPost?.content || "No post",
      authorUsername: mostCommentedPost?.user?.username || "No author",
    },

    totalEngagementPerUser: totalEngagementPerUser.map((user) => ({
      username: user.username,
      totalEngagement: Number(user.totalEngagement),
    })),
  };
}