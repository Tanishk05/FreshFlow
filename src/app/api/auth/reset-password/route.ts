import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/models/User";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (
    !token ||
    !password ||
    typeof token !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  try {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ resetToken: token });
    if (
      !user ||
      !user.resetTokenExpires ||
      new Date(user.resetTokenExpires) < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }
    const hashed = await bcrypt.hash(password, 10);
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { password: hashed },
        $unset: { resetToken: "", resetTokenExpires: "" },
      }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
