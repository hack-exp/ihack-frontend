import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Message, WorkflowStep } from "@/types/chat";

interface EnhancedMessageBubbleProps {
  message: Message;
  isTyping?: boolean;
}

const StepIcon: React.FC<{ status: WorkflowStep["status"] }> = ({ status }) => {
  switch (status) {
    case "completed":
      return (
        <div className="relative">
          <CheckCircle2 className="w-4 h-4 text-green-500 animate-pulse" />
          <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full opacity-20 animate-ping" />
        </div>
      );
    case "error":
      return (
        <div className="relative">
          <XCircle className="w-4 h-4 text-red-500" />
          <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full opacity-20 animate-pulse" />
        </div>
      );
    case "running":
      return (
        <div className="relative">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full opacity-20 animate-pulse" />
        </div>
      );
    case "pending":
      return <Clock className="w-4 h-4 text-gray-400 opacity-60" />;
    default:
      return <Settings className="w-4 h-4 text-gray-400 opacity-60" />;
  }
};

const StepTypeBadge: React.FC<{ type: WorkflowStep["type"] }> = ({ type }) => {
  const styles = {
    llm: {
      bg: "bg-gradient-to-r from-purple-100 to-indigo-100",
      text: "text-purple-700",
      icon: Bot,
      border: "border-purple-200",
    },
    tool: {
      bg: "bg-gradient-to-r from-blue-100 to-cyan-100",
      text: "text-blue-700",
      icon: Zap,
      border: "border-blue-200",
    },
    system: {
      bg: "bg-gradient-to-r from-gray-100 to-slate-100",
      text: "text-gray-700",
      icon: Settings,
      border: "border-gray-200",
    },
  };

  const style = styles[type] || styles.system;
  const IconComponent = style.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border} shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      <IconComponent className="w-3.5 h-3.5" />
      {type.toUpperCase()}
    </div>
  );
};

const WorkflowStepCard: React.FC<{
  step: WorkflowStep;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ step, isExpanded, onToggle }) => {
  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-slate-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <StepIcon status={step.status} />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <StepTypeBadge type={step.type} />
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-mono">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="ml-3 h-8 w-8 p-0 hover:bg-slate-100 transition-colors duration-200"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </Button>
        </div>
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
            {" "}
            <div className="space-y-3">
              {(() => {
                if (
                  step.type === "tool" &&
                  step.parameters &&
                  typeof step.parameters === "object" &&
                  step.parameters !== null
                ) {
                  return (
                    <div className="group">
                      <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-t-lg border border-blue-200">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <Settings className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>Tool Parameters</span>
                        <div className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          {
                            Object.keys(
                              step.parameters as Record<string, unknown>
                            ).length
                          }{" "}
                          params
                        </div>
                      </div>{" "}
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-b-lg p-4 text-xs font-mono border border-blue-200 border-t-0">
                        {Object.entries(
                          step.parameters as Record<string, unknown>
                        ).map(([key, value], paramIndex) => (
                          <div
                            key={`${key}-${paramIndex}`}
                            className="mb-3 last:mb-0"
                          >
                            <div className="text-blue-700 font-bold mb-1">
                              {key}:
                            </div>
                            <div className="pl-3 border-l-2 border-blue-200">
                              <pre className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                {JSON.stringify(value, null, 2)}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {step.result && (
                <div className="group">
                  <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-t-lg border border-green-200">
                    <div className="p-1 bg-green-100 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    </div>
                    <span>Execution Result</span>
                    <div className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Success
                    </div>
                  </div>{" "}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-b-lg p-4 text-xs border border-green-200 border-t-0">
                    <div className="border-l-2 border-green-300 pl-3">
                      {(() => {
                        // Handle both string and object results
                        if (typeof step.result === "string") {
                          return (
                            <pre className="whitespace-pre-wrap text-green-800 leading-relaxed font-mono">
                              {step.result}
                            </pre>
                          );
                        } else if (
                          typeof step.result === "object" &&
                          step.result !== null
                        ) {
                          // If result is an object, show the content field if available, otherwise show the whole object
                          const resultObj = step.result as Record<
                            string,
                            unknown
                          >;
                          if (
                            resultObj.content &&
                            typeof resultObj.content === "string"
                          ) {
                            return (
                              <div className="space-y-2">
                                <div className="text-green-700 font-medium">
                                  {resultObj.content}
                                </div>
                                {Object.keys(resultObj).length > 1 && (
                                  <details className="mt-2">
                                    <summary className="text-xs text-green-600 cursor-pointer hover:text-green-700">
                                      View detailed data
                                    </summary>
                                    <pre className="mt-2 text-xs text-green-700 whitespace-pre-wrap font-mono">
                                      {JSON.stringify(resultObj, null, 2)}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            );
                          } else {
                            return (
                              <pre className="whitespace-pre-wrap text-green-800 leading-relaxed font-mono">
                                {JSON.stringify(step.result, null, 2)}
                              </pre>
                            );
                          }
                        }
                        return (
                          <span className="text-green-800">
                            Result available
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {step.error && (
                <div className="group">
                  <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-t-lg border border-red-200">
                    <div className="p-1 bg-red-100 rounded-full">
                      <XCircle className="w-3 h-3 text-red-600" />
                    </div>
                    <span>Error Details</span>
                    <div className="ml-auto text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                      Failed
                    </div>
                  </div>{" "}
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-b-lg p-4 text-xs border border-red-200 border-t-0">
                    <div className="border-l-2 border-red-300 pl-3">
                      <pre className="whitespace-pre-wrap text-red-800 leading-relaxed font-mono">
                        {step.error}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const WorkflowDropdown: React.FC<{ message: Message }> = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  if (!message.workflowData?.steps || message.workflowData.steps.length === 0) {
    return null;
  }

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const steps = message.workflowData.steps;
  const completedSteps = steps.filter(
    (step) => step.status === "completed"
  ).length;
  const runningSteps = steps.filter((step) => step.status === "running").length;
  const hasErrors = steps.some((step) => step.status === "error");

  const getStatusIndicator = () => {
    if (runningSteps > 0) {
      return (
        <div className="flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
          <span className="text-blue-600 font-medium">Processing...</span>
        </div>
      );
    }
    if (hasErrors) {
      return (
        <div className="flex items-center gap-1">
          <XCircle className="w-3 h-3 text-red-500" />
          <span className="text-red-600 font-medium">
            Completed with errors
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-green-500" />
        <span className="text-green-600 font-medium">
          Completed successfully
        </span>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-3 border border-slate-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full justify-between text-sm p-3 h-auto hover:bg-white/50 transition-all duration-200",
          hasErrors
            ? "bg-red-50 border-red-200 hover:bg-red-100/50"
            : runningSteps > 0
            ? "bg-blue-50 border-blue-200 hover:bg-blue-100/50"
            : "bg-green-50 border-green-200 hover:bg-green-100/50",
          "border rounded-lg"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-full bg-white shadow-sm">
            <Zap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900">
              Workflow Execution
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {completedSteps}/{steps.length} steps completed
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIndicator()}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </Button>

      {isExpanded && (
        <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 duration-300">
          {steps.map((step, index) => (
            <div key={`${step.id || "step"}-${index}`} className="relative">
              {index > 0 && (
                <div className="absolute -top-3 left-6 w-px h-3 bg-gradient-to-b from-slate-300 to-transparent" />
              )}
              <WorkflowStepCard
                step={step}
                isExpanded={expandedSteps.has(step.id)}
                onToggle={() => toggleStepExpansion(step.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function EnhancedMessageBubble({
  message,
  isTyping = false,
}: EnhancedMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 max-w-5xl group",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <Avatar
        className={cn(
          "h-9 w-9 shrink-0 transition-all duration-200 group-hover:scale-110",
          isUser ? "ring-2 ring-primary/20" : "ring-2 ring-blue-500/20"
        )}
      >
        <AvatarFallback
          className={cn(
            "text-sm font-semibold transition-colors duration-200",
            isUser
              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
              : "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-2 min-w-0 flex-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-sm font-semibold",
              isUser ? "text-primary" : "text-blue-600"
            )}
          >
            {isUser ? "You" : "Stellar AI"}
          </span>
          <Badge
            variant="outline"
            className="text-xs px-2 py-0.5 bg-white/50 backdrop-blur-sm"
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Badge>
        </div>

        <Card
          className={cn(
            "max-w-full border shadow-lg transition-all duration-200 hover:shadow-xl",
            isUser
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-primary/30 shadow-primary/20"
              : "bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-slate-200/50"
          )}
        >
          <CardContent className="p-5">
            {/* Show workflow dropdown for AI messages - ABOVE content */}
            {!isUser && message.workflowData && (
              <div className="mb-4">
                <WorkflowDropdown message={message} />
              </div>
            )}

            <div
              className={cn(
                "text-sm leading-relaxed whitespace-pre-wrap",
                isUser ? "text-primary-foreground" : "text-foreground"
              )}
            >
              {message.content ||
                (isTyping ? (
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-blue-600 font-medium">
                      Thinking...
                    </span>
                  </div>
                ) : (
                  ""
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
