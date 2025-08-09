/**
 * Enhanced chat types for Orbital frontend with improved workflow support.
 */

export type WorkflowStepType = "llm" | "tool" | "system";
export type WorkflowStepStatus = "pending" | "running" | "completed" | "error";

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  status: WorkflowStepStatus;
  description: string;
  timestamp: string;
  tool_name?: string;
  parameters?: Record<string, unknown>;
  result?: string | Record<string, unknown>; // Allow both string and object
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowData {
  steps: WorkflowStep[];
  currentStep?: WorkflowStep;
  status: "idle" | "running" | "completed" | "error";
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  workflowData?: WorkflowData;
  metadata?: Record<string, unknown>;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ChatHistory {
  chats: Chat[];
  currentChatId: string | null;
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  message: Message;
  workflowData?: WorkflowData;
  error?: string;
}

export type StreamEventType =
  | "content"
  | "step"
  | "error"
  | "workflow_complete"
  | "workflow_step"
  | "final_response";

export interface StreamEvent {
  type: StreamEventType;
  data: {
    content?: {
      role: string;
      content: string;
    };
    step?: WorkflowStep;
    error?: string;
    execution_log?: WorkflowStep[];
    timestamp: string;
    // New backend format fields
    step_id?: string;
    step_type?: string;
    description?: string;
    status?: string;
    node?: string;
    tool_name?: string;
    parameters?: Record<string, unknown>;
    result?: string;
    response?: string;
    step_count?: number;
    [key: string]: unknown;
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties: Record<
      string,
      {
        type: string;
        description: string;
        required?: boolean;
      }
    >;
    required?: string[];
  };
}

export interface ToolsResponse {
  tools: Record<string, ToolDefinition>;
  timestamp: string;
}

export interface BackendHealth {
  status: "healthy" | "unhealthy" | "checking";
  timestamp: string;
  error?: string;
}
