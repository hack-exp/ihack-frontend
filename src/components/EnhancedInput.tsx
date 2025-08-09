import React, { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  Send, 
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

export function EnhancedInput({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  disabled,
  placeholder = "Type your message...",
  isLoading = false
}: EnhancedInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Set a max-height of 120px
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const maxChars = 2000;
  const charCount = value.length;
  const isOverLimit = charCount > maxChars;

  return (
    <div className="relative">
      <form onSubmit={(e) => { e.preventDefault(); if (!isOverLimit) onSubmit(); }} className="relative">
        {/* The main container now uses theme variables for background and border */}
        <div className="relative flex items-end rounded-2xl border-2 border-input bg-card p-2 shadow-lg transition-all duration-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 hover:shadow-xl">
          {/* Textarea now uses theme variables for text and placeholder color */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex-1 resize-none self-center bg-transparent p-3 focus:outline-none",
              "min-h-[40px] max-h-[120px] w-full leading-relaxed",
              "text-foreground placeholder:text-muted-foreground",
              disabled && "cursor-not-allowed opacity-50"
            )}
            rows={1}
          />
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end">
             {/* Character count now uses theme variables */}
            {charCount > 0 && (
                <div className={cn(
                  "text-xs font-medium transition-colors",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}>
                  {charCount}/{maxChars}
                </div>
              )}
            {/* The button now uses theme variables for both enabled and disabled states */}
            <Button 
              type="submit" 
              disabled={!value.trim() || disabled || isOverLimit}
              size="icon"
              className={cn(
                "h-9 w-9 shrink-0 transition-all duration-300",
                !value.trim() || isOverLimit || disabled ? "scale-95 cursor-not-allowed bg-secondary text-secondary-foreground/60" : "scale-100 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>        
      </form>
    </div>
  );
}