/**
 * Server-Sent Events (SSE) Endpoint for Dashboard Real-Time Updates
 *
 * Maintains persistent connections with dashboard clients and broadcasts
 * refresh signals when data changes (e.g., from TwentyCRM webhooks).
 *
 * Security:
 * - Requires valid admin session authentication
 * - Only sends "refresh" signals, no sensitive data
 *
 * Usage:
 * - Dashboard connects via EventSource to /api/adminpanel/events
 * - When webhook fires, broadcastRefresh() sends "refresh" event to all clients
 * - Dashboard invalidates React Query cache and refetches data
 */

import type { APIRoute } from 'astro';
import { verifySession } from '../../../utils/adminAuth';

// Store connected SSE clients
// Using a Map with unique client IDs for efficient management
interface SSEClient {
  controller: ReadableStreamDefaultController;
  userId: string;
  connectedAt: Date;
}

const connectedClients = new Map<string, SSEClient>();

// Heartbeat interval (30 seconds) to keep connections alive
const HEARTBEAT_INTERVAL = 30000;

/**
 * Broadcast a refresh signal to all connected SSE clients
 * Called by webhook endpoints when data changes
 *
 * @param source - Source of the refresh (e.g., 'twenty-webhook')
 * @param eventType - Type of event that triggered the refresh
 * @returns Number of clients notified
 */
export function broadcastRefresh(source: string, eventType: string): number {
  const message = JSON.stringify({
    type: 'refresh',
    source,
    eventType,
    timestamp: new Date().toISOString(),
  });

  const data = `event: refresh\ndata: ${message}\n\n`;

  let notifiedCount = 0;
  const deadClients: string[] = [];

  for (const [clientId, client] of connectedClients) {
    try {
      client.controller.enqueue(new TextEncoder().encode(data));
      notifiedCount++;
    } catch (error) {
      // Client disconnected, mark for removal
      console.log(`SSE: Client ${clientId} disconnected (broadcast failed)`);
      deadClients.push(clientId);
    }
  }

  // Clean up dead clients
  for (const clientId of deadClients) {
    connectedClients.delete(clientId);
  }

  console.log(`SSE: Broadcast refresh to ${notifiedCount} clients (source: ${source}, event: ${eventType})`);
  return notifiedCount;
}

/**
 * Get current connection count (for monitoring)
 */
export function getConnectionCount(): number {
  return connectedClients.size;
}

export const GET: APIRoute = async ({ request }) => {
  // Verify authentication
  const authResult = await verifySession(request);
  if (!authResult) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const clientId = crypto.randomUUID();
  let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Store client connection
      connectedClients.set(clientId, {
        controller,
        userId: authResult.user.id,
        connectedAt: new Date(),
      });

      console.log(`SSE: Client ${clientId} connected (user: ${authResult.user.username}, total: ${connectedClients.size})`);

      // Send initial connection confirmation
      const connectMessage = JSON.stringify({
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(new TextEncoder().encode(`event: connected\ndata: ${connectMessage}\n\n`));

      // Set up heartbeat to keep connection alive
      heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
          });
          controller.enqueue(new TextEncoder().encode(`event: heartbeat\ndata: ${heartbeat}\n\n`));
        } catch {
          // Connection closed, cleanup will happen in cancel
        }
      }, HEARTBEAT_INTERVAL);
    },

    cancel() {
      // Clean up when client disconnects
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      connectedClients.delete(clientId);
      console.log(`SSE: Client ${clientId} disconnected (total: ${connectedClients.size})`);
    },
  });

  // Return SSE response with appropriate headers
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
};
