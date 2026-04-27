import { NextResponse } from 'next/server';
import { addComment } from '@/repository/postRepo';

export async function POST(req) {
  const { userId, postId, content } = await req.json();
  const comment = await addComment(userId, postId, content);
  return NextResponse.json(comment, { status: 201 });
}