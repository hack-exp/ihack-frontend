"use client";

import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { isSignedIn } = useUser();
  const router = useRouter();

  // Redirect if already signed in
  if (isSignedIn) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {isSignUp ? (
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-indigo-600 hover:bg-indigo-700 text-sm normal-case",
                  card: "shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "bg-white border-gray-300 hover:bg-gray-50 text-gray-900",
                  formFieldInput:
                    "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
                },
              }}
              redirectUrl="/dashboard"
              signInUrl="/auth"
            />
          ) : (
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-indigo-600 hover:bg-indigo-700 text-sm normal-case",
                  card: "shadow-none",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "bg-white border-gray-300 hover:bg-gray-50 text-gray-900",
                  formFieldInput:
                    "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
                },
              }}
              redirectUrl="/dashboard"
              signUpUrl="/auth"
            />
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
