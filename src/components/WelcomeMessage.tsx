import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Calendar,
  CheckSquare,
  Mail,
  BookOpen,
  BarChart3,
  Workflow,
  Bot,
} from "lucide-react";

export function WelcomeMessage() {
  const capabilities = [
    {
      icon: <Calendar className="h-4 w-4" />,
      title: "Calendar Management",
      description: "Schedule events, check conflicts, get smart suggestions",
      examples: [
        "Add a meeting for tomorrow",
        "Check my calendar conflicts",
        "Suggest meeting times",
      ],
    },
    {
      icon: <CheckSquare className="h-4 w-4" />,
      title: "Task Management",
      description: "Create tasks, projects, and track progress",
      examples: [
        "Create a task for project review",
        "List my pending tasks",
        "Update task status",
      ],
    },
    {
      icon: <Mail className="h-4 w-4" />,
      title: "Email Assistance",
      description: "Compose emails, check templates, manage communication",
      examples: [
        "Send email to team about update",
        "Show email templates",
        "List recent emails",
      ],
    },
    {
      icon: <BookOpen className="h-4 w-4" />,
      title: "Study Planning",
      description: "Create comprehensive study plans and learning schedules",
      examples: [
        "Create study plan for React",
        "Plan learning schedule",
        "Generate study roadmap",
      ],
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      title: "Analytics & Insights",
      description: "Monitor performance and get workflow insights",
      examples: [
        "Analyze my productivity",
        "Show workflow insights",
        "Monitor system health",
      ],
    },
    {
      icon: <Workflow className="h-4 w-4" />,
      title: "Workflow Automation",
      description: "Execute templates and create custom workflows",
      examples: [
        "Run daily standup template",
        "Create custom workflow",
        "Show available templates",
      ],
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center max-w-6xl mx-auto p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Badge variant="secondary" className="text-xs">
                AI
              </Badge>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Stellar AI
        </h1>
        <p className="text-muted-foreground text-lg mb-4">
          Your intelligent assistant with 15+ integrated tools for productivity
          and automation
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Real-time Workflow Visualization
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            Google Integration
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Workflow className="w-3 h-3 mr-1" />
            LangGraph Powered
          </Badge>
        </div>
      </div>
    </div>
  );
}
