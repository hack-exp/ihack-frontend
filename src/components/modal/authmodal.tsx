"use client";

import React from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  onModeChange,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {mode === "signin" ? "Sign In" : "Create Account"}
          </SheetTitle>
          <SheetDescription>
            {mode === "signin"
              ? "Welcome back! Sign in to continue your conversations."
              : "Join Stellar AI to start your personalized AI experience."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {mode === "signin" ? (
            <SignIn
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                  card: "shadow-none border-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "bg-white border-gray-300 hover:bg-gray-50 text-gray-900",
                  formFieldInput:
                    "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                  footer: "hidden",
                },
              }}
              redirectUrl="/dashboard"
              signUpUrl="#"
              signUpForceRedirectUrl="/dashboard"
            />
          ) : (
            <SignUp
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                  card: "shadow-none border-0",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton:
                    "bg-white border-gray-300 hover:bg-gray-50 text-gray-900",
                  formFieldInput:
                    "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                  footer: "hidden",
                },
              }}
              redirectUrl="/dashboard"
              signInUrl="#"
              signInForceRedirectUrl="/dashboard"
            />
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                onClick={() =>
                  onModeChange(mode === "signin" ? "signup" : "signin")
                }
                className="font-medium text-blue-600 hover:text-blue-500 underline"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
