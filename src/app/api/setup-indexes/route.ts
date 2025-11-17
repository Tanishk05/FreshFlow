import { NextResponse } from "next/server";
import { createUserIndexes } from "@/lib/createIndexes";

export async function POST() {
  try {
    await createUserIndexes();
    return NextResponse.json({
      success: true,
      message: "Database indexes created successfully",
    });
  } catch (error) {
    console.error("Failed to create indexes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create indexes",
      },
      { status: 500 }
    );
  }
}
