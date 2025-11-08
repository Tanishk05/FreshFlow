import React from "react";

type Status = "ready" | "growing" | "sold";

export const StatusDot = ({ status }: { status: Status }) => (
  <span
    className={`w-3 h-3 rounded-full mr-2 shrink-0 ${
      status === "ready"
        ? "bg-green-500"
        : status === "growing"
        ? "bg-yellow-500"
        : "bg-gray-400"
    }`}
  ></span>
);
