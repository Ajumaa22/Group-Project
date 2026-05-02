import prisma from "@/repository/prisma";

export async function POST(request) {
  const { email, password } = await request.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.password !== password) {
    return Response.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  return Response.json(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
    { status: 200 }
  );
}