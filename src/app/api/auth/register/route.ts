import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (
    !email ||
    !password ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  try {
    const usersCollection = await getUsersCollection();
    const existing = await usersCollection.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }
    const hashed = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await usersCollection.insertOne({
      _id: new (await import("mongodb")).ObjectId(),
      email,
      password: hashed,
      emailVerified: null,
      verifyToken,
      verifyTokenExpires,
      name: undefined,
      username: undefined,
      image: undefined,
      phone: undefined,
      role: undefined,
      address: undefined,
      isAdmin: false,
    });

    // Send verification email with error handling
    try {
      await sendVerificationEmail(email, verifyToken);
      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Still return success since user is created, they can request resend
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
