import { NextResponse } from 'next/server';
import {
  followUser,
  unfollowUser
} from '@/repository/userRepo';

// FOLLOW
export async function POST(req) {
  const { followerId, followingId } = await req.json();

  if (followerId === followingId) {
    return NextResponse.json(
      { error: "Cannot follow yourself" },
      { status: 400 }
    );
  }

  const result = await followUser(followerId, followingId);
  return NextResponse.json(result, { status: 201 });
}

// UNFOLLOW
export async function DELETE(req) {
  const { followerId, followingId } = await req.json();

  await unfollowUser(followerId, followingId);
  return NextResponse.json({ message: 'Unfollowed' });
}