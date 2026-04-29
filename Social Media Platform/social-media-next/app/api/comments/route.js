import { NextResponse } from "next/server";
import { addComment, deleteComment } from "@/repository/postRepo";

export async function POST(req) {
  const { userId, postId, content } = await req.json();
  const comment = await addComment(userId, postId, content);
  return NextResponse.json(comment, { status: 201 });
}

export async function DELETE(req) {
  const { commentId } = await req.json();

  await deleteComment(commentId);

  return NextResponse.json({ message: "Comment deleted" });
}