// src/actions/completeSignup.ts

"use server";

import { z, ZodFlattenedError } from "zod";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

// --- Import our new helper and types ---
import { getUsersCollection, User, UserRole } from "@/models/User";

// Define the schema
const signupSchema = z.object({
  role: z.enum(["farmer", "distributor", "retailer"], {
    message: "Please select a role.",
  }),
  name: z.string().min(2, "Name is required").optional(),
  username: z.string().min(3, "Username is required").optional(),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

// --- DEFINE THE STATE SHAPE ---
// This interface will be used by both the action and the page component
export interface FormState {
  error: string | null;
  details?: ZodFlattenedError<typeof signupSchema.shape>;
}

// --- UPDATE THE FUNCTION SIGNATURE ---
export async function completeSignup(
  prevState: FormState, // <-- 1. Add prevState
  formData: FormData // <-- 2. formData is now second
): Promise<FormState> {
  // <-- 3. Return type is FormState
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated.", details: undefined };
  }

  const data = Object.fromEntries(formData);
  const result = signupSchema.safeParse(data);

  if (!result.success) {
    return {
      error: "Invalid data. Please check your inputs.",
      details: result.error.flatten(),
    };
  }

  // --- Type-safe data ---
  const {
    role,
    name,
    username,
    phone,
    street,
    city,
    state,
    pincode,
    latitude,
    longitude,
  } = result.data;

  const needsProfileData =
    session.user.provider === "nodemailer" || !session.user.name;

  if (needsProfileData && (!name || !username)) {
    return {
      error: "Name and username are required for email sign-up.",
      details: undefined,
    };
  }

  try {
    // --- Use the new helper ---
    const usersCollection = await getUsersCollection();

    // Check if username is already taken
    if (username) {
      const existingUsername = await usersCollection.findOne({
        username,
        _id: { $ne: new ObjectId(session.user.id) },
      });
      if (existingUsername) {
        return {
          error: "Username already taken. Please choose another.",
          details: undefined,
        };
      }
    }

    // Check if phone is already in use
    if (phone) {
      const existingPhone = await usersCollection.findOne({
        phone,
        _id: { $ne: new ObjectId(session.user.id) },
      });
      if (existingPhone) {
        return {
          error: "Phone number already in use.",
          details: undefined,
        };
      }
    }

    // Note: Email uniqueness is already handled by NextAuth/MongoDB adapter
    // during the initial login/signup process

    // --- Type-safe update object ---
    const updateData: Partial<User> = {
      role: role as UserRole, // Cast to our defined type
    };

    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;

    // Build address object if any address field is provided
    if (street || city || state || pincode || latitude || longitude) {
      updateData.address = {
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        pincode: pincode || undefined,
        country: "India", // Default country
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      };
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updateData }
    );
  } catch (e) {
    console.error(e);
    return {
      error: "Database error. Could not complete signup.",
      details: undefined,
    };
  }

  // Successful update, redirect to the new dashboard route
  redirect(`/dashboard/${role}`);
}
