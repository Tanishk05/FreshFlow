import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let connectPromise: Promise<Socket> | null = null;

export async function getSocket(): Promise<Socket> {
  // Return existing connected socket
  if (socket?.connected) {
    return socket;
  }

  // If connection is in progress, return that promise
  if (connectPromise) {
    return connectPromise;
  }

  // Create new connection
  connectPromise = new Promise((resolve, reject) => {
    socket = io({
      path: "/api/socket",
      autoConnect: false, // Don't auto-connect
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.once("connect", () => {
      resolve(socket!);
    });

    socket.once("connect_error", (error) => {
      connectPromise = null;
      reject(error);
    });

    // Start connection
    socket.connect();
  });

  return connectPromise;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    connectPromise = null;
  }
}

// Helper to check if socket is available (for conditional loading)
export function isSocketAvailable(): boolean {
  return socket?.connected ?? false;
}
