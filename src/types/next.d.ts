import type { Server as IOServer } from "socket.io";
import type { Socket as NetSocket } from "net";
import type { NextApiResponse } from "next";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: NetSocket & {
    server: {
      io?: IOServer;
    };
  };
};
