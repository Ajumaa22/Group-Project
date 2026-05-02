export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import {
  createUser,
  getAllUsers
} from '@/repository/userRepo';

// GET all users
export async function GET() {
  const users = await getAllUsers();
  return NextResponse.json(users);
}

// CREATE user
export async function POST(req) {
  const { username, email, password } = await req.json();
  const user = await createUser(username, email, password);
  return NextResponse.json(user, { status: 201 });
}