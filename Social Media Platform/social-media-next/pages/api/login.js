import prisma from "@/repos/prisma";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  return res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  });
}