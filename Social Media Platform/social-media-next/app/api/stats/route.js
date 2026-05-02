export const dynamic = "force-dynamic";
import { getStats } from "@/repository/statsRepo";

export async function GET() {
  try {
    const stats = await getStats();
    return Response.json(stats);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to load statistics" },
      { status: 500 }
    );
  }
}