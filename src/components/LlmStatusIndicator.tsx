import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Bot, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Wifi, 
  WifiOff, 
  Clock,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export interface LlmStatusIndicatorProps {
  status: 'healthy' | 'unhealthy' | 'checking';
}

export default function LlmStatusIndicator({ status }: LlmStatusIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [responseTime, setResponseTime] = useState<number | null>(null);

  useEffect(() => {
    setLastChecked(new Date());
    // Simulate response time for demo
    if (status === 'healthy') {
      setResponseTime(Math.floor(Math.random() * 200) + 50); // 50-250ms
    }
  }, [status]);
  const getStatusConfig = () => {
    switch (status) {
      case 'healthy':
        return {
          icon: (
            <div className="relative">
              <CheckCircle2 className="h-4 w-4" />
              <div className="absolute inset-0 h-4 w-4 bg-green-500 rounded-full opacity-30 animate-ping" />
            </div>
          ),
          color: 'text-green-600',
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200',
          text: 'LLM Ready',
          description: 'All systems operational',
          pulse: true
        };
      case 'unhealthy':
        return {
          icon: (
            <div className="relative">
              <XCircle className="h-4 w-4" />
              <div className="absolute inset-0 h-4 w-4 bg-red-500 rounded-full opacity-30 animate-pulse" />
            </div>
          ),
          color: 'text-red-600',
          bg: 'bg-gradient-to-r from-red-50 to-pink-50',
          border: 'border-red-200',
          text: 'LLM Offline',
          description: 'Connection issues detected',
          pulse: false
        };
      default:
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          color: 'text-amber-600',
          bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
          border: 'border-amber-200',
          text: 'Checking...',
          description: 'Verifying connection',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="relative">      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 text-sm h-9 px-4 transition-all duration-200 shadow-sm",
          config.bg,
          config.border,
          "border hover:scale-105 hover:shadow-md backdrop-blur-sm"
        )}
      >
        {config.icon}
        <span className={cn(config.color, "font-semibold")}>{config.text}</span>
        {responseTime && (
          <Badge variant="outline" className="text-xs ml-1 bg-white/70 backdrop-blur-sm">
            {responseTime}ms
          </Badge>
        )}
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 ml-1 transition-transform duration-200" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-1 transition-transform duration-200" />
        )}
      </Button>

      {isExpanded && (        <Card className="absolute top-full right-0 mt-2 w-72 z-50 shadow-xl border animate-in slide-in-from-top-2 duration-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <Bot className="h-3 w-3 text-white" />
              </div>
              Backend Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Connection:</span>
              <div className="flex items-center gap-2">
                {status === 'healthy' ? (
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <Wifi className="h-3 w-3 text-green-500" />
                      <div className="absolute inset-0 h-3 w-3 bg-green-500 rounded-full opacity-30 animate-ping" />
                    </div>
                    <span className={cn(config.color, "font-medium")}>{config.description}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <WifiOff className="h-3 w-3 text-red-500" />
                    <span className={cn(config.color, "font-medium")}>{config.description}</span>
                  </div>
                )}
              </div>
            </div>            
            {responseTime && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Response Time:</span>
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 text-blue-500" />
                  <span className="text-blue-600 font-medium">{responseTime}ms</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Last Checked:</span>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gray-500" />
                <span className="text-gray-600 font-medium">
                  {lastChecked.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {status === 'healthy' && (
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
                  </div>
                  <span className="font-medium">Real-time streaming active</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
