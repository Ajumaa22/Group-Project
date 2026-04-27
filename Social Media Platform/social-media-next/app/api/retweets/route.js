import { NextResponse } from 'next/server';
import { retweetPost, unretweetPost } from '@/repository/postRepo';

export async function POST(req) {
  const { userId, postId } = await req.json();
  const retweet = await retweetPost(userId, postId);
  return NextResponse.json(retweet, { status: 201 });
}

export async function DELETE(req) {
  const { userId, postId } = await req.json();
  await unretweetPost(userId, postId);
  return NextResponse.json({ message: 'Unretweet successful' });
}