import { Server } from "socket.io";
import { NextRequest } from "next/server";

// Use force-dynamic for app router API routes that need dynamic behavior
export const dynamic = "force-dynamic";

let io: Server | undefined;

export async function GET() {
  if (!io) {
    const globalWithServer = global as typeof globalThis & {
      server?: unknown;
      httpServer?: unknown;
    };
    const server = globalWithServer.server || globalWithServer.httpServer;
    if (!server) {
      // If the server is not available, return 500
      return new Response("Server not ready", { status: 500 });
    }
    io = new Server(server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      socket.on("message", (msg) => {
        socket.broadcast.emit("message", msg);
      });
      // Add your custom events here
    });
  }
  // The upgrade to WebSocket is handled by socket.io, so just return 200
  return new Response(null, { status: 200 });
}
