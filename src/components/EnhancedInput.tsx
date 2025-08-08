import React, { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Send, 
  Loader2, 
  Mic, 
  Square, 
  Paperclip, 
  Smile,
  Command
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
}: EnhancedInputProps) {  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [charCount, setCharCount] = useState(0);
  useEffect(() => {
    setCharCount(value.length);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  const maxChars = 2000;
  const isNearLimit = charCount > maxChars * 0.8;
  const isOverLimit = charCount > maxChars;  return (
    <div className="relative">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="relative">
        <div className="relative border-2 border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all duration-200 bg-white shadow-lg hover:shadow-xl">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full min-h-[60px] max-h-[120px] p-5 pr-40 bg-transparent resize-none focus:outline-none placeholder:text-gray-400 text-gray-900 leading-relaxed",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            rows={1}
          />
          
          {/* Character count */}
          {charCount > 0 && (
            <div className={cn(
              "absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full transition-colors",
              isOverLimit ? "text-red-600 bg-red-50" : 
              isNearLimit ? "text-yellow-600 bg-yellow-50" : 
              "text-gray-500 bg-gray-50"
            )}>
              {charCount}/{maxChars}
            </div>
          )}          {/* Action buttons */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">

          
            {/* Send button */}
            <Button 
              type="submit" 
              disabled={!value.trim() || disabled || isOverLimit}
              size="sm"
              className={cn(
                "h-9 px-4 transition-all duration-200 font-semibold",
                value.trim() && !disabled && !isOverLimit
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl scale-100 hover:scale-105"
                  : "scale-95 opacity-50 cursor-not-allowed"
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
