// Reg No: 22MID0305

import { API_BASE, API_TOKEN } from "./config";

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogPackage = "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";

export const Log = async (stack: string, level: LogLevel, pkg: LogPackage, message: string) => {
  try {
    await fetch(`${API_BASE}/evaluation-service/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
      cache: "no-store",
    });
  } catch (error) {
    void 0;
  }
};
