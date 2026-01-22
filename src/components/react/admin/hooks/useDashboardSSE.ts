/**
 * Custom hook for Server-Sent Events (SSE) connection to dashboard
 *
 * Provides real-time updates by connecting to /api/adminpanel/events
 * and listening for refresh signals from webhooks.
 *
 * Features:
 * - Auto-reconnect on connection loss (with exponential backoff)
 * - Connection status tracking
 * - Fallback to polling if SSE fails repeatedly
 * - Cleanup on unmount
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export type SSEConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface SSEEvent {
  type: string;
  source?: string;
  eventType?: string;
  timestamp: string;
  clientId?: string;
}

interface UseDashboardSSEOptions {
  /** Callback when refresh signal is received */
  onRefresh?: (event: SSEEvent) => void;
  /** Whether SSE should be enabled (e.g., only when authenticated) */
  enabled?: boolean;
  /** Max reconnection attempts before giving up (default: 5) */
  maxReconnectAttempts?: number;
}

interface UseDashboardSSEReturn {
  /** Current connection status */
  status: SSEConnectionStatus;
  /** Whether currently connected */
  isConnected: boolean;
  /** Number of reconnection attempts */
  reconnectAttempts: number;
  /** Manually trigger reconnection */
  reconnect: () => void;
}

const SSE_ENDPOINT = '/api/adminpanel/events';
const BASE_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

export function useDashboardSSE(options: UseDashboardSSEOptions = {}): UseDashboardSSEReturn {
  const {
    onRefresh,
    enabled = true,
    maxReconnectAttempts = 5,
  } = options;

  const [status, setStatus] = useState<SSEConnectionStatus>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onRefreshRef = useRef(onRefresh);

  // Keep callback ref updated
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    // Clean up any existing connection
    cleanup();

    if (!enabled) {
      setStatus('disconnected');
      return;
    }

    setStatus('connecting');

    try {
      const eventSource = new EventSource(SSE_ENDPOINT);
      eventSourceRef.current = eventSource;

      // Handle successful connection
      eventSource.addEventListener('connected', (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          console.log('SSE: Connected', data.clientId);
          setStatus('connected');
          setReconnectAttempts(0);
        } catch (error) {
          console.error('SSE: Failed to parse connected event', error);
        }
      });

      // Handle refresh signals from webhooks
      eventSource.addEventListener('refresh', (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          console.log('SSE: Refresh signal received', data.source, data.eventType);
          onRefreshRef.current?.(data);
        } catch (error) {
          console.error('SSE: Failed to parse refresh event', error);
        }
      });

      // Handle heartbeat (just log, no action needed)
      eventSource.addEventListener('heartbeat', () => {
        // Heartbeat received - connection is alive
      });

      // Handle connection errors
      eventSource.onerror = () => {
        console.log('SSE: Connection error');
        eventSource.close();
        eventSourceRef.current = null;
        setStatus('error');

        // Attempt reconnection with exponential backoff
        setReconnectAttempts((prev) => {
          const newAttempts = prev + 1;

          if (newAttempts <= maxReconnectAttempts) {
            const delay = Math.min(
              BASE_RECONNECT_DELAY * Math.pow(2, newAttempts - 1),
              MAX_RECONNECT_DELAY
            );
            console.log(`SSE: Reconnecting in ${delay}ms (attempt ${newAttempts}/${maxReconnectAttempts})`);

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            console.log('SSE: Max reconnection attempts reached, falling back to polling');
            setStatus('disconnected');
          }

          return newAttempts;
        });
      };
    } catch (error) {
      console.error('SSE: Failed to create EventSource', error);
      setStatus('error');
    }
  }, [enabled, maxReconnectAttempts, cleanup]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    setReconnectAttempts(0);
    connect();
  }, [connect]);

  // Connect on mount and when enabled changes
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      cleanup();
      setStatus('disconnected');
    }

    return cleanup;
  }, [enabled, connect, cleanup]);

  return {
    status,
    isConnected: status === 'connected',
    reconnectAttempts,
    reconnect,
  };
}
