/**
 * Enhanced API service for Orbital frontend with improved streaming and error handling.
 */
import {
    Message,
    ChatResponse,
    StreamEvent,
    ToolsResponse,
    BackendHealth
} from '@/types/chat';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const API_ENDPOINTS = {
    chat: `${BACKEND_URL}/api/chat/chat`,
    chatStream: `${BACKEND_URL}/api/chat/chat/stream`,
    tools: `${BACKEND_URL}/api/chat/tools`,
    health: `${BACKEND_URL}/health`
} as const;

export class ApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message);
        this.name = 'ApiError';
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new ApiError(error.detail || 'Request failed', response.status);
    }
    return response.json();
}

export async function sendChatMessage(
    messageHistory: Message[],
    content: string,
    metadata?: Record<string, unknown>
): Promise<ChatResponse> {
    try {
        const response = await fetch(API_ENDPOINTS.chat, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    ...messageHistory,
                    {
                        role: 'user',
                        content,
                        timestamp: new Date().toISOString(),
                        metadata
                    }
                ],
                metadata
            })
        });
        
        return handleResponse<ChatResponse>(response);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error instanceof Error ? error.message : 'Failed to send message');
    }
}

export async function* getStreamingResponse(
    messageHistory: Message[],
    content: string,
    metadata?: Record<string, unknown>
): AsyncGenerator<StreamEvent, void, unknown> {
    try {
        const response = await fetch(API_ENDPOINTS.chatStream, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    ...messageHistory,
                    {
                        role: 'user',
                        content,
                        timestamp: new Date().toISOString(),
                        metadata
                    }
                ],
                metadata
            })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new ApiError(error.detail || 'Stream request failed', response.status);
        }
        
        if (!response.body) {
            throw new ApiError('No response body');
        }
          // Use the Enhanced SSE Parser for better stream handling
        const { createSSEParser } = await import('@/utils/EnhancedSSEParser');
        const parser = createSSEParser({ enableLogging: true });
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Process the stream
        console.log('Starting to process stream response...');
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                console.log('Stream completed');
                break;
            }
              const chunk = decoder.decode(value, { stream: true });
            console.log('Received chunk:', chunk);
            console.log('Chunk contains data: prefix?', chunk.includes('data:'));
            console.log('Chunk line endings:', chunk.split('\n').length - 1, 'newlines');
              // Use our Enhanced SSE parser to handle the chunk
            const events = parser.parse(chunk);
            console.log('Parse returned', events.length, 'events');
            
            for (const event of events) {
                console.log('Parsed event type:', event.type);
                console.log('Parsed event data:', JSON.stringify(event.data, null, 2));
                yield event;
            }
        }
        
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error instanceof Error ? error.message : 'Stream processing failed');
    }
}

export async function getAvailableTools(): Promise<ToolsResponse> {
    try {
        const response = await fetch(API_ENDPOINTS.tools);
        return handleResponse<ToolsResponse>(response);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(error instanceof Error ? error.message : 'Failed to fetch tools');
    }
}

export async function checkBackendHealth(): Promise<BackendHealth> {
    try {
        const response = await fetch(API_ENDPOINTS.health);
        const data = await handleResponse<{ status: string; timestamp: string; error?: string }>(response);
        
        return {
            status: data.status as BackendHealth['status'],
            timestamp: data.timestamp,
            error: data.error
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Health check failed'
        };
    }
}
