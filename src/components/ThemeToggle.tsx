"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  // Wait for component to be mounted to avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  const handleThemeChange = () => {
    setIsAnimating(true);
    const nextTheme =
      theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    setTheme(nextTheme);

    setTimeout(() => setIsAnimating(false), 300);
  };

  if (!mounted) {
    return null;
  }

  const getIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "light":
        return <Sun className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "dark":
        return "Dark mode";
      case "light":
        return "Light mode";
      case "system":
        return "System theme";
      default:
        return "Toggle theme";
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleThemeChange}
      aria-label={getLabel()}
      title={getLabel()}
      className={cn(
        "h-8 w-8 p-0 transition-all duration-300 hover:scale-110",
        isAnimating && "scale-95"
      )}
    >
      <div
        className={cn(
          "transition-transform duration-300",
          isAnimating && "rotate-180"
        )}
      >
        {getIcon()}
      </div>
    </Button>
  );
}
