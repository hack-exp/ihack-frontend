"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chat, Message, WorkflowData, WorkflowStep } from "@/types/chat";
import { saveCurrentChat, loadCurrentChat } from "../utils/storage";
import { getStreamingResponse, checkBackendHealth } from "../services/api";
import LlmStatusIndicator from "../components/LlmStatusIndicator";
import { EnhancedMessageBubble } from "../components/EnhancedMessageBubble";
import { WelcomeMessage } from "../components/WelcomeMessage";
import ThemeToggle from "../components/ThemeToggle";
import { EnhancedInput } from "../components/EnhancedInput";

// shadcn/ui components
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";

// Icons
import {
  AlertCircle,
  Bot,
  Activity,
  MessageSquare,
  Trash2,
} from "lucide-react";

export default function ChatPage() {
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Ref for auto-scrolling to bottom of messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add backend health state
  const [backendHealth, setBackendHealth] = useState<
    "healthy" | "unhealthy" | "checking"
  >("checking"); // Load chat from localStorage on component mount
  useEffect(() => {
    const savedChat = loadCurrentChat();

    if (savedChat) {
      setCurrentChat(savedChat);
    } else {
      // Create a welcome chat if none found
      const initialChat: Chat = {
        id: "1",
        title: "Welcome Chat",
        messages: [
          {
            role: "assistant",
            content: "Hello! I'm Stellar AI. How can I help you today?",
            timestamp: new Date().toISOString(),
          },
        ],
        lastMessage: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentChat(initialChat);
      saveCurrentChat(initialChat);
    }
    setIsInitialized(true);
  }, []); // Save chat to localStorage whenever it changes (with debouncing)
  useEffect(() => {
    if (!currentChat) return;

    if (!Array.isArray(currentChat.messages)) {
      console.error(
        "currentChat.messages is not an array:",
        currentChat.messages
      );
      return;
    }

    // Add a small delay to debounce rapid updates
    const timeoutId = setTimeout(() => {
      try {
        saveCurrentChat(currentChat);
      } catch (error) {
        console.error("Error in auto-save:", error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [currentChat]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat, isTyping]);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await checkBackendHealth();
        setBackendHealth(health.status);
      } catch (error) {
        console.error("Error checking backend health:", error);
        setBackendHealth("unhealthy");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []); // Clear current chat messages
  const clearChat = useCallback(() => {
    if (!currentChat) return;

    const clearedChat: Chat = {
      ...currentChat,
      messages: [],
      lastMessage: undefined,
      updatedAt: new Date().toISOString(),
    };

    setCurrentChat(clearedChat);

    // Clear any errors
    setError(null);
  }, [currentChat]);
  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const health = await checkBackendHealth();
      setBackendHealth(health.status);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentChat || !content.trim() || isLoading) return;

      try {
        setIsLoading(true);
        setIsTyping(true);
        setError(null);

        // Create user message with proper type
        const userMessage: Message = {
          role: "user",
          content: content.trim(),
          timestamp: new Date().toISOString(),
        };

        // Update chat with user message
        const chatWithUserMessage: Chat = {
          ...currentChat,
          messages: [...currentChat.messages, userMessage],
          lastMessage: userMessage,
          updatedAt: new Date().toISOString(),
        };

        setCurrentChat(chatWithUserMessage);
        setInput("");

        // Initialize workflow data
        const workflowData: WorkflowData = {
          steps: [],
          status: "running",
        };

        // Update user message with workflow data
        const userMessageWithWorkflow: Message = {
          ...userMessage,
          workflowData,
        };

        // Update chat with workflow data
        const chatWithWorkflow: Chat = {
          ...chatWithUserMessage,
          messages: [
            ...chatWithUserMessage.messages.slice(0, -1),
            userMessageWithWorkflow,
          ],
          lastMessage: userMessageWithWorkflow,
        };

        setCurrentChat(chatWithWorkflow);
        // Get streaming response
        const messages = chatWithWorkflow.messages;

        // Assistant message state
        let assistantMessage: Message = {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          workflowData: { ...workflowData },
        };

        // Add initial assistant message to the chat for streaming updates
        let currentChatState = {
          ...chatWithWorkflow,
          messages: [...chatWithWorkflow.messages, assistantMessage],
          updatedAt: new Date().toISOString(),
        };

        setCurrentChat(currentChatState);

        try {
          console.log("Starting streaming response...");
          for await (const event of getStreamingResponse(messages, content)) {
            console.log("Received event:", event.type, event);
            switch (event.type) {
              case "workflow_step": {
                // Handle workflow step events from the new backend format
                const stepData = event.data;
                if (stepData) {
                  console.log("Received workflow_step event:", stepData);

                  // Map backend step format to frontend WorkflowStep format
                  const workflowStep = {
                    id: stepData.step_id,
                    type:
                      stepData.step_type === "input"
                        ? "system"
                        : stepData.step_type === "analysis"
                        ? "llm"
                        : stepData.step_type === "response"
                        ? "llm"
                        : stepData.step_type === "stream"
                        ? "system"
                        : stepData.step_type === "ui"
                        ? "system"
                        : "system",
                    status:
                      stepData.status === "completed" ? "completed" : "running",
                    description: stepData.description,
                    timestamp: stepData.timestamp,
                    tool_name: stepData.tool_name,
                    parameters: stepData.parameters,
                    result: stepData.result,
                    error: stepData.error,
                  } as WorkflowStep;

                  // Check if step already exists to avoid duplicates
                  const existingSteps =
                    assistantMessage.workflowData?.steps || [];
                  const stepExists = existingSteps.some(
                    (step) => step.id === workflowStep.id
                  );

                  console.log("Existing steps count:", existingSteps.length);
                  console.log("Step exists?", stepExists);
                  console.log("Current step ID:", workflowStep.id);

                  // Update workflow data with new step (only if it doesn't exist)
                  const updatedSteps = stepExists
                    ? existingSteps
                    : [...existingSteps, workflowStep];
                  const updatedWorkflowData = {
                    ...assistantMessage.workflowData!,
                    steps: updatedSteps,
                    currentStep: workflowStep,
                    status: "running" as const,
                  };

                  console.log("Updated steps count:", updatedSteps.length);

                  // Update assistant message with updated workflow data
                  assistantMessage = {
                    ...assistantMessage,
                    workflowData: updatedWorkflowData,
                  };

                  // Update current chat state with updated assistant message
                  const updatedMessages = [...currentChatState.messages];
                  const lastIndex = updatedMessages.length - 1;
                  if (updatedMessages[lastIndex].role === "assistant") {
                    updatedMessages[lastIndex] = { ...assistantMessage };
                  }

                  currentChatState = {
                    ...currentChatState,
                    messages: updatedMessages,
                    lastMessage: { ...assistantMessage },
                    updatedAt: new Date().toISOString(),
                  };

                  setCurrentChat(currentChatState);
                }
                break;
              }
              case "final_response": {
                // Handle final response from the new backend format
                const responseData = event.data;
                if (
                  responseData &&
                  responseData.response &&
                  typeof responseData.response === "string"
                ) {
                  console.log(
                    "Received final_response:",
                    responseData.response
                  );

                  // Update assistantMessage with the final response content
                  assistantMessage.content = responseData.response;

                  // Update current chat state with the final response
                  const updatedMessages = [...currentChatState.messages];
                  const lastIndex = updatedMessages.length - 1;
                  if (updatedMessages[lastIndex].role === "assistant") {
                    updatedMessages[lastIndex] = {
                      ...assistantMessage,
                      workflowData: assistantMessage.workflowData,
                    };
                  }

                  currentChatState = {
                    ...currentChatState,
                    messages: updatedMessages,
                    lastMessage: { ...assistantMessage },
                    updatedAt: new Date().toISOString(),
                  };

                  setCurrentChat(currentChatState);
                }
                break;
              }

              case "content": {
                // Legacy content handling (kept for backward compatibility)
                let contentText = "";

                if (typeof event.data.content === "string") {
                  contentText = event.data.content;
                } else if (
                  event.data.content?.content &&
                  typeof event.data.content.content === "string"
                ) {
                  contentText = event.data.content.content;
                } else if (
                  event.data.text &&
                  typeof event.data.text === "string"
                ) {
                  contentText = event.data.text;
                }

                console.log("Extracted content text:", contentText);
                if (contentText) {
                  assistantMessage.content = contentText;

                  const updatedMessages = [...currentChatState.messages];
                  const lastIndex = updatedMessages.length - 1;
                  if (updatedMessages[lastIndex].role === "assistant") {
                    updatedMessages[lastIndex] = {
                      ...assistantMessage,
                      workflowData: assistantMessage.workflowData,
                    };
                  }

                  currentChatState = {
                    ...currentChatState,
                    messages: updatedMessages,
                    lastMessage: { ...assistantMessage },
                    updatedAt: new Date().toISOString(),
                  };

                  setCurrentChat(currentChatState);
                }
                break;
              }

              case "step": {
                if (event.data.step) {
                  console.log("Received step event:", event.data.step);
                  // Check if step already exists to avoid duplicates
                  const existingSteps =
                    assistantMessage.workflowData?.steps || [];
                  const currentStep = event.data.step;
                  const stepExists = existingSteps.some(
                    (step) => step.id === currentStep.id
                  );

                  console.log("Existing steps count:", existingSteps.length);
                  console.log("Step exists?", stepExists);
                  console.log("Current step ID:", currentStep.id);

                  // Update workflow data with new step (only if it doesn't exist)
                  const updatedSteps = stepExists
                    ? existingSteps
                    : [...existingSteps, currentStep];
                  const updatedWorkflowData = {
                    ...assistantMessage.workflowData!,
                    steps: updatedSteps,
                    currentStep: currentStep,
                    status: "running" as const,
                  };

                  console.log("Updated steps count:", updatedSteps.length);
                  // Update assistant message with updated workflow data
                  assistantMessage = {
                    ...assistantMessage,
                    workflowData: updatedWorkflowData,
                  };

                  // Update current chat state with updated assistant message
                  const updatedMessages = [...currentChatState.messages];
                  const lastIndex = updatedMessages.length - 1;
                  if (updatedMessages[lastIndex].role === "assistant") {
                    updatedMessages[lastIndex] = { ...assistantMessage };
                  }

                  currentChatState = {
                    ...currentChatState,
                    messages: updatedMessages,
                    lastMessage: { ...assistantMessage },
                    updatedAt: new Date().toISOString(),
                  };

                  setCurrentChat(currentChatState);
                }
                break;
              }

              case "error": {
                const errorMessage =
                  event.data.error || "An unknown error occurred";
                console.error("Stream error:", errorMessage);
                setError(errorMessage);

                // Update workflow status to error
                const updatedWorkflowData = {
                  ...assistantMessage.workflowData!,
                  status: "error" as const,
                  error: errorMessage,
                };

                // Update assistant message with error workflow data
                assistantMessage = {
                  ...assistantMessage,
                  workflowData: updatedWorkflowData,
                };

                // Update chat with error status
                const updatedMessages = [...currentChatState.messages];
                const lastIndex = updatedMessages.length - 1;
                if (updatedMessages[lastIndex].role === "assistant") {
                  updatedMessages[lastIndex] = { ...assistantMessage };
                }

                currentChatState = {
                  ...currentChatState,
                  messages: updatedMessages,
                  lastMessage: { ...assistantMessage },
                  updatedAt: new Date().toISOString(),
                };

                setCurrentChat(currentChatState);
                break;
              }
              case "workflow_complete": {
                console.log("Workflow complete event received");
                // Update workflow status to completed, keeping all accumulated steps
                const updatedWorkflowData = {
                  ...assistantMessage.workflowData!,
                  status: "completed" as const,
                  // Keep the steps we've accumulated during streaming, don't replace with execution_log
                  steps: assistantMessage.workflowData?.steps || [],
                };

                // Update assistant message with completed workflow data
                assistantMessage = {
                  ...assistantMessage,
                  workflowData: updatedWorkflowData,
                };
                // Update chat with completed status
                const updatedMessages = [...currentChatState.messages];
                const lastIndex = updatedMessages.length - 1;
                if (updatedMessages[lastIndex].role === "assistant") {
                  updatedMessages[lastIndex] = { ...assistantMessage };
                }

                currentChatState = {
                  ...currentChatState,
                  messages: updatedMessages,
                  lastMessage: { ...assistantMessage },
                  updatedAt: new Date().toISOString(),
                };

                setCurrentChat(currentChatState);
                break;
              }

              default:
                console.warn("Unknown event type received:", event.type);
                break;
            }
          }
          console.log("Streaming completed successfully");
        } catch (error) {
          console.error("Streaming error:", error);
          setError(
            error instanceof Error ? error.message : "Failed to get response"
          );

          // Update workflow status to error
          const updatedWorkflowData = {
            ...assistantMessage.workflowData!,
            status: "error" as const,
            error:
              error instanceof Error ? error.message : "Failed to get response",
          };

          // Update assistant message with error workflow data
          assistantMessage = {
            ...assistantMessage,
            workflowData: updatedWorkflowData,
          };
          // Update chat with error status
          const updatedMessages = [...currentChatState.messages];
          const lastIndex = updatedMessages.length - 1;
          if (updatedMessages[lastIndex].role === "assistant") {
            updatedMessages[lastIndex] = { ...assistantMessage };
          }

          currentChatState = {
            ...currentChatState,
            messages: updatedMessages,
            lastMessage: { ...assistantMessage },
            updatedAt: new Date().toISOString(),
          };

          setCurrentChat(currentChatState);
        }
      } catch (error) {
        console.error("Send message error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to send message"
        );
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [currentChat, isLoading]
  );

  // Handle input submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await sendMessage(input);
    },
    [input, sendMessage]
  );

  // Handle input keydown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950">
      {/* Main Chat Area - Full Width */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Chat Header with Clear Button */}
        <div className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 p-4 shadow-lg border-slate-200/60">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {/* Left side - Clear button and Chat info */}
            <div className="flex items-center gap-4">
              {/* Clear Chat Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                disabled={
                  !currentChat ||
                  !currentChat.messages ||
                  currentChat.messages.length === 0
                }
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/30 transition-all duration-200 shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                Clear Chat
              </Button>

              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                <Bot className="h-5 w-5 text-white" />
              </div>

              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Stellar AI Assistant
                </h1>
                {currentChat && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />{" "}
                    <span>{currentChat.messages?.length || 0} messages</span>
                    {currentChat.messages?.some(
                      (m) => m.workflowData?.steps?.length
                    ) && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-blue-600" />
                          <span className="text-blue-600">Workflow Active</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Status indicators */}
            <div className="flex items-center gap-3">
              {" "}
              {isTyping && (
                <div className="flex items-center gap-3 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-full border border-blue-200 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  </div>
                  <span className="font-medium">AI Thinking...</span>
                </div>
              )}
              <ThemeToggle />
              <LlmStatusIndicator status={backendHealth} />
            </div>
          </div>
        </div>{" "}
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-transparent to-slate-50/30">
          <div className="space-y-6 max-w-4xl mx-auto">
            {!currentChat?.messages || currentChat.messages.length === 0 ? (
              <WelcomeMessage />
            ) : (
              currentChat.messages.map((message, index) => (
                <EnhancedMessageBubble
                  key={`${message.role}-${message.timestamp}-${index}`}
                  message={message}
                  isTyping={
                    index === (currentChat?.messages?.length || 0) - 1 &&
                    isTyping
                  }
                />
              ))
            )}

            {/* Auto-scroll target */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>{" "}
        {/* Enhanced Input Area */}
        <div className="border-t p-6 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border-slate-200/60 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <EnhancedInput
              value={input}
              onChange={setInput}
              onSubmit={() => sendMessage(input)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || backendHealth !== "healthy"}
              isLoading={isLoading}
              placeholder="Type your message to Stellar AI..."
            />

            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
