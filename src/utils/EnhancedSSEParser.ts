/**
 * Enhanced SSE Parser for Orbital frontend with improved workflow event handling.
 * Provides robust parsing of Server-Sent Events with better error handling and event buffering.
 */

import { StreamEvent, StreamEventType, WorkflowStep } from '@/types/chat';

// SSE protocol constants
export const SSE_DATA_PREFIX = 'data: ';
export const SSE_EVENT_PREFIX = 'event: ';
export const SSE_ID_PREFIX = 'id: ';
export const SSE_RETRY_PREFIX = 'retry: ';
export const SSE_DONE_MESSAGE = '[DONE]';

export interface SSEParserOptions {
  bufferSize?: number;
  enableLogging?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface ParsedSSEEvent {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}

/**
 * Enhanced SSE Parser with better event handling and buffer management
 */
export class EnhancedSSEParser {
  private buffer = '';
  private eventBuffer: ParsedSSEEvent[] = [];
  private options: Required<SSEParserOptions>;
  private eventId = 0;

  constructor(options: SSEParserOptions = {}) {
    this.options = {
      bufferSize: options.bufferSize ?? 1000,
      enableLogging: options.enableLogging ?? false,
      reconnectAttempts: options.reconnectAttempts ?? 3,
      reconnectDelay: options.reconnectDelay ?? 1000,
    };
  }

  /**
   * Parse incoming SSE chunk and return structured events
   */
  parse(chunk: string): StreamEvent[] {
    try {
      // Combine buffer with new chunk and split into lines
      const lines = (this.buffer + chunk).split('\n');
      // Save last potentially incomplete line
      this.buffer = lines.pop() || '';

      const events: StreamEvent[] = [];
      let currentEvent: Partial<ParsedSSEEvent> = {};

      for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines (they complete an event)
        if (!trimmed) {
          if (currentEvent.data !== undefined) {
            const streamEvent = this.processEvent(currentEvent as ParsedSSEEvent);
            if (streamEvent) {
              events.push(streamEvent);
            }
            currentEvent = {};
          }
          continue;
        }

        // Parse SSE fields
        if (trimmed.startsWith(SSE_DATA_PREFIX)) {
          const data = trimmed.substring(SSE_DATA_PREFIX.length);
          currentEvent.data = (currentEvent.data || '') + data;
        } else if (trimmed.startsWith(SSE_EVENT_PREFIX)) {
          currentEvent.event = trimmed.substring(SSE_EVENT_PREFIX.length);
        } else if (trimmed.startsWith(SSE_ID_PREFIX)) {
          currentEvent.id = trimmed.substring(SSE_ID_PREFIX.length);
        } else if (trimmed.startsWith(SSE_RETRY_PREFIX)) {
          const retryValue = parseInt(trimmed.substring(SSE_RETRY_PREFIX.length), 10);
          if (!isNaN(retryValue)) {
            currentEvent.retry = retryValue;
          }
        }
      }

      // Process any remaining event
      if (currentEvent.data !== undefined) {
        const streamEvent = this.processEvent(currentEvent as ParsedSSEEvent);
        if (streamEvent) {
          events.push(streamEvent);
        }
      }

      return events;
    } catch (error) {
      this.log('Parse error:', error);
      return [{
        type: 'error',
        data: {
          error: `Parser error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString()
        }
      }];
    }
  }

  /**
   * Process a single SSE event into a StreamEvent
   */
  private processEvent(event: ParsedSSEEvent): StreamEvent | null {
    const { data, event: eventType, id } = event;

    // Check for stream completion marker
    if (data === SSE_DONE_MESSAGE) {
      return {
        type: 'workflow_complete',
        data: {
          timestamp: new Date().toISOString(),
          id: id || `complete-${this.eventId++}`
        }
      };
    }

    // Handle empty data
    if (!data.trim()) {
      this.log('Empty SSE data received, skipping');
      return null;
    }

    try {
      // Parse the JSON data
      const parsed = JSON.parse(data);
      
      // Ensure timestamp exists
      if (!parsed.timestamp) {
        parsed.timestamp = new Date().toISOString();
      }

      // Add event ID if provided
      if (id) {
        parsed.id = id;
      }

      // Determine event type based on content or explicit event type
      let type: StreamEventType = 'content'; // default
      
      if (eventType) {
        type = eventType as StreamEventType;
      } else if (parsed.type) {
        type = parsed.type;
      } else if (parsed.step) {
        type = 'step';
      } else if (parsed.error) {
        type = 'error';
      } else if (parsed.content) {
        type = 'content';
      }

      const streamEvent: StreamEvent = {
        type,
        data: parsed
      };

      this.log('Parsed event:', streamEvent);
      return streamEvent;

    } catch (err) {
      this.log('Failed to parse SSE message:', err, 'Raw data:', data);
      return {
        type: 'error',
        data: {
          error: `Parse error: ${err instanceof Error ? err.message : 'Invalid JSON'}`,
          timestamp: new Date().toISOString(),
          rawData: data.substring(0, 200), // Include first 200 chars for debugging
        }
      };
    }
  }

  /**
   * Clear the internal buffer (useful for connection resets)
   */
  clearBuffer(): void {
    this.buffer = '';
    this.eventBuffer = [];
  }

  /**
   * Get the current buffer size
   */
  getBufferSize(): number {
    return this.buffer.length;
  }
  /**
   * Log messages if logging is enabled
   */
  private log(...args: unknown[]): void {
    if (this.options.enableLogging) {
      console.log('[EnhancedSSEParser]', ...args);
    }
  }
}

/**
 * Create a simple SSE parser (maintains backward compatibility)
 */
export const createSSEParser = (options?: SSEParserOptions) => {
  const parser = new EnhancedSSEParser(options);
  
  return {
    parse: (chunk: string) => parser.parse(chunk),
    clearBuffer: () => parser.clearBuffer(),
    getBufferSize: () => parser.getBufferSize()
  };
};

/**
 * Utility function to validate workflow step data
 */
export const validateWorkflowStep = (step: unknown): step is WorkflowStep => {
  return (
    typeof step === 'object' &&
    step !== null &&
    'id' in step &&
    'type' in step &&
    'status' in step &&
    'description' in step &&
    'timestamp' in step &&
    typeof (step as Record<string, unknown>).id === 'string' &&
    typeof (step as Record<string, unknown>).type === 'string' &&
    typeof (step as Record<string, unknown>).status === 'string' &&
    typeof (step as Record<string, unknown>).description === 'string' &&
    typeof (step as Record<string, unknown>).timestamp === 'string'
  );
};

/**
 * Utility function to create error events
 */
export const createErrorEvent = (error: string, context?: unknown): StreamEvent => ({
  type: 'error',
  data: {
    error,
    timestamp: new Date().toISOString(),
    context
  }
});

export default EnhancedSSEParser;
