export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req) {
  const { addComment } = await import("@/repository/postRepo");

  const { userId, postId, content } = await req.json();
  const comment = await addComment(userId, postId, content);

  return NextResponse.json(comment, { status: 201 });
}

export async function DELETE(req) {
  const { deleteComment } = await import("@/repository/postRepo");

  const { commentId } = await req.json();
  await deleteComment(commentId);

  return NextResponse.json({ message: "Comment deleted" });
}