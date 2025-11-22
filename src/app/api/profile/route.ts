import { auth } from "@/auth";
import { getUsersCollection } from "@/models/User";
import { ObjectId } from "mongodb";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  username: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(), // Can be URL or base64
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const users = await getUsersCollection();
    const userId = new ObjectId(session.user.id);

    const user = await users.findOne({ _id: userId });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Return user profile data
    return Response.json({
      name: user.name || "",
      email: user.email || "",
      username: user.username || "",
      phone: user.phone || "",
      image: user.image || "",
      role: user.role || "",
      isAdmin: user.isAdmin || false,
    });
  } catch (err) {
    console.error("Profile fetch error", err);
    return new Response("Server error", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, username, phone, image } = validation.data;

    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (username) updates.username = username;
    if (phone) updates.phone = phone;
    if (image) updates.image = image;

    // Never allow role changes from this endpoint

    const users = await getUsersCollection();
    const userId = new ObjectId(session.user.id);

    // Check if email is being changed and if it's already in use
    if (email && email !== session.user.email) {
      const existingUser = await users.findOne({
        email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return Response.json(
          { error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    // Check if username is being changed and if it's already in use
    if (username) {
      const existingUser = await users.findOne({
        username,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return Response.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }
    }

    // Check if phone is being changed and if it's already in use
    if (phone) {
      const existingUser = await users.findOne({
        phone,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return Response.json(
          { error: "Phone number already in use" },
          { status: 409 }
        );
      }
    }

    const result = await users.updateOne({ _id: userId }, { $set: updates });

    if (result.matchedCount === 0) {
      return new Response("User not found", { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Profile update error", err);
    return new Response("Server error", { status: 500 });
  }
}
