import { Server } from "socket.io";
import { NextApiRequest } from "next";
import { NextApiResponseServerIO } from "@/types/next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server as import("http").Server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: { origin: "*" },
    });
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      // Example: echo message
      socket.on("message", (msg) => {
        socket.broadcast.emit("message", msg);
      });
      // Add your custom events here
    });
  }
  // Do NOT call res.end() here! This keeps the connection open for WebSocket upgrades.
}
