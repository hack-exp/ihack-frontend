"use client";

import React from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@clerk/clerk-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
}

const { getToken } = useAuth();

async function callBackend() {
  const token = await getToken();
  await fetch(
    `${process.env.BACK_END_URL}/45714289-adc03465-590e-4494-abe0-b65f497b3113?action=share&creator=45714289`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        /* your data */
      }),
    }
  );
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode,
  onModeChange,
}) => {
  return (
    // Use Dialog instead of Sheet
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "signin" ? "Sign In" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin"
              ? "Welcome back! Sign in to continue your conversations."
              : "Join Stellar AI to start your personalized AI experience."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {mode === "signin" ? (
            <SignIn
              routing="hash" // Add hash-based routing
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
            />
          ) : (
            <SignUp
              routing="hash" // Add hash-based routing
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
      </DialogContent>
    </Dialog>
  );
};
