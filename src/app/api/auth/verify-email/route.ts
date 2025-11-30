import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/models/User";

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
  try {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ verifyToken: token });
    if (
      !user ||
      !user.verifyTokenExpires ||
      new Date(user.verifyTokenExpires) < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { emailVerified: new Date() },
        $unset: { verifyToken: "", verifyTokenExpires: "" },
      }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
