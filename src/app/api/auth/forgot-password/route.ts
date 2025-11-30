import { NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  try {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({ ok: true });
    }
    // Generate a reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await usersCollection.updateOne(
      { email },
      { $set: { resetToken: token, resetTokenExpires: expires } }
    );
    await sendPasswordResetEmail(email, token);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
