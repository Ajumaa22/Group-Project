import { NextResponse } from 'next/server';
import {
  getUserById,
  updateUser,
  deleteUser
} from '@/repository/userRepo';

// GET user
export async function GET(_, { params }) {
  const user = await getUserById(Number(params.id));
  return NextResponse.json(user);
}

// UPDATE user
export async function PUT(req, { params }) {
  const data = await req.json();
  const updated = await updateUser(Number(params.id), data);
  return NextResponse.json(updated);
}

// DELETE user
export async function DELETE(_, { params }) {
  await deleteUser(Number(params.id));
  return NextResponse.json({ message: 'User deleted' });
}