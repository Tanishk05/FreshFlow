"use client";

import { useSession } from "next-auth/react";
// --- IMPORT THE FormState INTERFACE FROM THE ACTION ---
import { completeSignup, FormState } from "@/actions/completeSignup";
import { useRouter } from "next/navigation";
// --- IMPORT useFormStatus from react-dom ---
import { useFormStatus } from "react-dom";
// --- IMPORT useActionState from react ---
import React, { useActionState } from "react"; // Make sure React is imported

// Simple UI components (replace with your own)
const Label = ({ children, ...props }: React.ComponentProps<"label">) => (
  <label className="block text-sm font-medium text-gray-700" {...props}>
    {children}
  </label>
);
const Input = (props: React.ComponentProps<"input">) => (
  <input
    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
    {...props}
  />
);

// --- UPDATED BUTTON COMPONENT ---
// We create a new component for the button so it can use useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus(); // This hook gets the form's pending state

  return (
    <button
      type="submit"
      disabled={pending} // Disable button when form is submitting
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {pending ? "Completing..." : "Complete Signup"}
    </button>
  );
}

// --- REMOVED: FormState is now imported from the action ---

export default function CompleteSignupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- UPDATED useActionState HOOK ---
  // The initial state now perfectly matches the FormState interface
  const initialState: FormState = { error: null, details: undefined };
  // --- Changed from useFormState to useActionState ---
  const [state, formAction] = useActionState(completeSignup, initialState);

  // Redirect if user already has a role
  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      router.push(`/dashboard/${session.user.role}`);
    }
  }, [status, session?.user?.role, router]);

  if (status === "loading") {
    return <div className="p-8">Loading session...</div>;
  }

  if (status === "unauthenticated") {
    router.push("/"); // Send them home
    return null;
  }

  // If user already has a role, show loading while redirecting
  if (session?.user?.role) {
    return <div className="p-8">Redirecting to dashboard...</div>;
  }

  // Check if user *needs* to fill in name/username
  const needsProfileData =
    session?.user?.provider === "nodemailer" || !session?.user?.name;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Signup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Just one more step to get started!
          </p>
        </div>
        {/* --- UPDATE THE <form> TAG --- */}
        <form className="mt-8 space-y-6" action={formAction}>
          {/* --- ADDED ERROR DISPLAY --- */}
          {state?.error && (
            <div className="p-3 text-center text-sm text-red-800 bg-red-100 border border-red-300 rounded-md">
              {state.error}
            </div>
          )}

          {/* --- Role Selection (Always Shown) --- */}
          <div>
            <Label htmlFor="role">I am a...</Label>
            <select
              id="role"
              name="role"
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              defaultValue=""
            >
              <option value="" disabled>
                Select your role
              </option>
              <option value="farmer">Farmer</option>
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
            </select>
            {/* --- ADDED FIELD-SPECIFIC ERROR --- */}
            {state.details?.fieldErrors?.role && (
              <p className="mt-1 text-xs text-red-600">
                {state.details.fieldErrors.role.join(", ")}
              </p>
            )}
          </div>

          {/* --- Conditional Fields --- */}
          {needsProfileData && (
            <>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                />
                {/* --- ADDED FIELD-SPECIFIC ERROR --- */}
                {state.details?.fieldErrors?.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {state.details.fieldErrors.name.join(", ")}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="johndoe"
                />
                {/* --- ADDED FIELD-SPECIFIC ERROR --- */}
                {state.details?.fieldErrors?.username && (
                  <p className="mt-1 text-xs text-red-600">
                    {state.details.fieldErrors.username.join(", ")}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Phone is optional for everyone */}
          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
            />
            {/* --- ADDED FIELD-SPECIFIC ERROR --- */}
            {state.details?.fieldErrors?.phone && (
              <p className="mt-1 text-xs text-red-600">
                {state.details.fieldErrors.phone.join(", ")}
              </p>
            )}
          </div>

          {/* Address Fields (Optional) */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Address (Optional - helps calculate delivery distance)
            </h3>

            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                name="street"
                type="text"
                placeholder="123 Main St"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" type="text" placeholder="Mumbai" />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                name="pincode"
                type="text"
                placeholder="400001"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude (Optional)</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="text"
                  placeholder="19.0760"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude (Optional)</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="text"
                  placeholder="72.8777"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              💡 Tip: You can find your coordinates using Google Maps or your
              GPS location
            </p>
          </div>

          <div>
            {/* --- USE THE NEW SUBMIT BUTTON --- */}
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
