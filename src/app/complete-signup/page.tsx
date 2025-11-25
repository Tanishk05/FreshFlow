"use client";

import { useSession } from "next-auth/react";
import { completeSignup, FormState } from "@/actions/completeSignup";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import React, { useActionState } from "react";

// --- Styled UI Components ---

const Label = ({ children, ...props }: React.ComponentProps<"label">) => (
  <label className="block text-sm font-semibold text-gray-700 mb-1" {...props}>
    {children}
  </label>
);

const Input = (props: React.ComponentProps<"input">) => (
  <input
    className="block w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 ease-in-out sm:text-sm"
    {...props}
  />
);

const Select = (props: React.ComponentProps<"select">) => (
  <div className="relative">
    <select
      className="block w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 appearance-none transition-all duration-200 ease-in-out sm:text-sm"
      {...props}
    />
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    </div>
  </div>
);

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
    >
      {pending ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Completing...
        </span>
      ) : (
        "Complete Signup"
      )}
    </button>
  );
}

export default function CompleteSignupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const initialState: FormState = { error: null, details: undefined };
  const [state, formAction] = useActionState(completeSignup, initialState);

  // Redirect if user already has a role
  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      router.push(`/dashboard/${session.user.role}`);
    }
  }, [status, session?.user?.role, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-green-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (session?.user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Redirecting to dashboard...
          </h2>
          <p className="mt-2 text-gray-500">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  // Check if user *needs* to fill in name/username
  const needsProfileData =
    session?.user?.provider === "nodemailer" || !session?.user?.name;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-white/50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 transform rotate-3">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Help us personalize your experience on FreshFlow
          </p>
        </div>

        <form className="mt-8 space-y-6" action={formAction}>
          {state?.error && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start">
              <svg
                className="h-5 w-5 text-red-400 mt-0.5 mr-3 shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-800 font-medium">{state.error}</p>
            </div>
          )}

          <div>
            <Label htmlFor="role">I am a...</Label>
            <Select id="role" name="role" required defaultValue="">
              <option value="" disabled>
                Select your role
              </option>
              <option value="farmer">Farmer</option>
              <option value="distributor">Distributor</option>
              <option value="retailer">Retailer</option>
            </Select>
            {state.details?.fieldErrors?.role && (
              <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center">
                <span className="w-1 h-1 rounded-full bg-red-600 mr-1.5"></span>
                {state.details.fieldErrors.role.join(", ")}
              </p>
            )}
          </div>

          {needsProfileData && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                />
                {state.details?.fieldErrors?.name && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center">
                    <span className="w-1 h-1 rounded-full bg-red-600 mr-1.5"></span>
                    {state.details.fieldErrors.name.join(", ")}
                  </p>
                )}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="johndoe"
                />
                {state.details?.fieldErrors?.username && (
                  <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center">
                    <span className="w-1 h-1 rounded-full bg-red-600 mr-1.5"></span>
                    {state.details.fieldErrors.username.join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="phone">
              Phone Number{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
            />
            {state.details?.fieldErrors?.phone && (
              <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center">
                <span className="w-1 h-1 rounded-full bg-red-600 mr-1.5"></span>
                {state.details.fieldErrors.phone.join(", ")}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Address Details
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Optional
              </span>
            </div>

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
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="text"
                  placeholder="19.0760"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="text"
                  placeholder="72.8777"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500 flex items-center">
              <svg
                className="h-4 w-4 mr-1.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Tip: Use Google Maps to find your coordinates
            </p>
          </div>

          <div className="pt-2">
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
