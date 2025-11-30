import { NextResponse } from "next/server";
import { getUsersCollection } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json({ exists: false, verified: false });
    }
    return NextResponse.json({ exists: true, verified: !!user.emailVerified });
  } catch (error) {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
