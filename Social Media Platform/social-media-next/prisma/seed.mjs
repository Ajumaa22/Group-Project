import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  }),
});

// 🔀 Helpers
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomUsername = () => {
  const names = ["alex", "mona", "leo", "sara", "noor", "zayd", "lina", "omar", "maya", "yara"];
  const suffix = Math.floor(Math.random() * 1000);
  return names[Math.floor(Math.random() * names.length)] + suffix;
};

const randomPost = () => {
  const texts = [
    "Enjoying the day 🌞",
    "Working on my project 💻",
    "Just finished a workout 💪",
    "Coffee time ☕",
    "Learning something new 📚",
    "Life is good ✨",
    "Building something cool 🚀",
    "Any recommendations?",
    "Feeling productive today!",
    "What a busy day!"
  ];
  return random(texts);
};

async function main() {
  // 🧹 Clean DB
  await prisma.retweet.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 👤 Test user (for login)
  await prisma.user.create({
    data: {
      username: "test",
      email: "test@test.com",
      password: "1234",
    },
  });

  // 👥 Create users
  const users = [];
  for (let i = 0; i < 25; i++) {
    const username = randomUsername();

    const user = await prisma.user.create({
      data: {
        username,
        email: `${username}@test.com`,
        password: "1234",
      },
    });

    users.push(user);
  }

  // 📝 Create posts
  const posts = [];
  for (let i = 0; i < 80; i++) {
    const post = await prisma.post.create({
      data: {
        content: randomPost(),
        userId: random(users).id,
      },
    });

    posts.push(post);
  }

  // 🔗 Follows
  const followSet = new Set();

  for (let i = 0; i < 120; i++) {
    const a = random(users);
    const b = random(users);

    if (a.id !== b.id) {
      const key = `${a.id}-${b.id}`;
      if (!followSet.has(key)) {
        followSet.add(key);

        try {
          await prisma.follow.create({
            data: {
              followerId: a.id,
              followingId: b.id,
            },
          });
        } catch {}
      }
    }
  }

  // ❤️ Likes
  const likeSet = new Set();

  for (let i = 0; i < 250; i++) {
    const user = random(users);
    const post = random(posts);
    const key = `${user.id}-${post.id}`;

    if (!likeSet.has(key)) {
      likeSet.add(key);

      try {
        await prisma.like.create({
          data: {
            userId: user.id,
            postId: post.id,
          },
        });
      } catch {}
    }
  }

  // 💬 Comments
  const comments = [
    "Nice post!",
    "Love this!",
    "Interesting!",
    "Great idea!",
    "So true!",
    "Thanks for sharing!",
    "Amazing 🔥",
    "Helpful 👌",
  ];

  for (let i = 0; i < 150; i++) {
    await prisma.comment.create({
      data: {
        content: random(comments),
        userId: random(users).id,
        postId: random(posts).id,
      },
    });
  }

  // 🔁 Retweets
  const retweetSet = new Set();

  for (let i = 0; i < 120; i++) {
    const user = random(users);
    const post = random(posts);
    const key = `${user.id}-${post.id}`;

    if (!retweetSet.has(key)) {
      retweetSet.add(key);

      try {
        await prisma.retweet.create({
          data: {
            userId: user.id,
            postId: post.id,
          },
        });
      } catch {}
    }
  }

  console.log("Database seeded with realistic data!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });