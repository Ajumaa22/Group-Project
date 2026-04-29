import { NextResponse } from 'next/server';
import { createPost, getAllPosts, deletePost  } from '@/repository/postRepo';

export async function GET() {
  const posts = await getAllPosts();
  return NextResponse.json(posts);
}

export async function POST(req) {
  const { userId, content } = await req.json();
  const post = await createPost(userId, content);
  return NextResponse.json(post, { status: 201 });
}

export async function DELETE(req) {
  const { postId } = await req.json();

  await deletePost(postId);

  return NextResponse.json({ message: "Post deleted" });
}