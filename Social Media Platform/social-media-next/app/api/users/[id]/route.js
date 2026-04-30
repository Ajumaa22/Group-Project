import { NextResponse } from 'next/server';
import {
  getUserById,
  updateUser,
  deleteUser
} from '@/repository/userRepo';

// GET user
export async function GET(_, context) {
  const { id } = await context.params;

  const user = await getUserById(Number(id));

  return NextResponse.json(user);
}

// UPDATE user
export async function PUT(req, context) {
  const { id } = await context.params;

  const data = await req.json();
  const updated = await updateUser(Number(id), data);

  return NextResponse.json(updated);
}

// DELETE user
export async function DELETE(_, context) {
  const { id } = await context.params;

  await deleteUser(Number(id));

  return NextResponse.json({ message: 'User deleted' });
}