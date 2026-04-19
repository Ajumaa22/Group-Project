export const mockStats = {
  avgFollowersPerUser: 100,
  avgPostsPerUser: 12,
  mostActiveUserLast3Months: {
    id: 1,
    username: "john",
    postsCount: 18
  },
  mostLikedPost: {
    id: 101,
    content: "Hello world",
    authorUsername: "john",
    likesCount: 95
  },
  mostCommentedPost: {
    id: 102,
    content: "My second post",
    authorUsername: "sara",
    commentsCount: 24
  },
  totalEngagementPerUser: [
    {
      id: 1,
      username: "john",
      totalEngagement: 140
    },
    {
      id: 2,
      username: "sara",
      totalEngagement: 98
    },
    {
      id: 3,
      username: "ali",
      totalEngagement: 76
    }
  ]
};