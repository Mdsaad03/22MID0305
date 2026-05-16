// Reg No: 22MID0305

"use client";

import { Log } from "./logger";

const STORAGE_KEY = "readNotifications";

function getReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveReadSet(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    window.dispatchEvent(new Event("readUpdated"));
  } catch {
    void 0;
  }
}

export function markRead(id: string): void {
  const set = getReadSet();
  if (!set.has(id)) {
    set.add(id);
    saveReadSet(set);
    Log("frontend", "info", "state", `Notification read: ${id}`);
  }
}

export function markAllRead(ids: string[]): void {
  const set = getReadSet();
  ids.forEach((id) => set.add(id));
  saveReadSet(set);
  Log("frontend", "info", "state", `Marked all loaded notifications as read`);
}

export function isRead(id: string): boolean {
  return getReadSet().has(id);
}

export function getReadIds(): Set<string> {
  return getReadSet();
}
