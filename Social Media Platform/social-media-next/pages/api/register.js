import prisma from "@/repos/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    return res.status(409).json({ error: "Username or email already exists" });
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });

  return res.status(201).json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  });
}