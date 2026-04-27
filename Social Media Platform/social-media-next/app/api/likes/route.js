import { NextResponse } from 'next/server';
import { likePost, unlikePost } from '@/repository/postRepo';

export async function POST(req) {
  const { userId, postId } = await req.json();
  const like = await likePost(userId, postId);
  return NextResponse.json(like, { status: 201 });
}

export async function DELETE(req) {
  const { userId, postId } = await req.json();
  await unlikePost(userId, postId);
  return NextResponse.json({ message: 'Unliked' });
}