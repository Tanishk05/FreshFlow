// src/actions/completeSignup.ts

"use server";

import { z, ZodFlattenedError } from "zod";
import { requireAuth } from "@/services/auth.service";
import { userRepository } from "@/repositories/user.repository";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import type { User, UserRole } from "@/models/User";
import { ValidationChains } from "@/services/validation-chain.service";

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
  latitude: z.string().min(1, "Latitude is required for delivery calculations"),
  longitude: z
    .string()
    .min(1, "Longitude is required for delivery calculations"),
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
  let userId: string;
  try {
    const authResult = await requireAuth();
    userId = authResult.userId;
  } catch (error) {
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

  // Note: Provider check would need to be done via session if needed
  // For now, we'll check if name/username are provided
  if (!name || !username) {
    return {
      error: "Name and username are required.",
      details: undefined,
    };
  }

  try {
    // Use Chain of Responsibility for validation
    const validationChain = ValidationChains.signupValidation();
    const validationResult = await validationChain.handle({
      role,
      name,
      username,
      phone,
      latitude,
      longitude,
      email: data.email, // If available
    });

    if (!validationResult.valid) {
      return {
        error: validationResult.error || "Validation failed",
        details: undefined,
      };
    }

    // Check if username is already taken
    if (username) {
      const existingUsers = await userRepository.findMany(
        { search: username },
        { page: 1, limit: 10 }
      );
      const existingUsername = existingUsers.data.find(
        (u) => u.username === username && u._id.toString() !== userId
      );
      if (existingUsername) {
        return {
          error: "Username already taken. Please choose another.",
          details: undefined,
        };
      }
    }

    // Check if phone is already in use
    if (phone) {
      const existingUsers = await userRepository.findMany(
        { search: phone },
        { page: 1, limit: 10 }
      );
      const existingPhone = existingUsers.data.find(
        (u) => u.phone === phone && u._id.toString() !== userId
      );
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
      isAdmin: false, // Set isAdmin to false by default for new users
    };

    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;

    // Parse coordinates (already validated by chain)
    const parsedLat = parseFloat(latitude);
    const parsedLon = parseFloat(longitude);

    updateData.address = {
      street: street || undefined,
      city: city || undefined,
      state: state || undefined,
      pincode: pincode || undefined,
      country: "India", // Default country
      latitude: parsedLat,
      longitude: parsedLon,
    };

    // Update user with all the data
    await userRepository.update(userId, updateData);
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
