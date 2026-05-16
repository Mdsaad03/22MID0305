// Reg No: 22MID0305

import { Notification } from "./types";

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const TIMESTAMP_FORMATS = [
  /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z?$/,
];

function parseTimestamp(ts: string): Date {
  const iso = new Date(ts.replace(" ", "T") + (ts.includes("Z") ? "" : "Z"));
  if (!isNaN(iso.getTime())) return iso;
  return new Date(0);
}

export function computePriorityScore(notification: Notification): number {
  const weight = TYPE_WEIGHT[notification.Type] ?? 1;
  const ts = parseTimestamp(notification.Timestamp);
  const ageSeconds = Math.max(0, (Date.now() - ts.getTime()) / 1000);
  const recency = 1 / (1 + ageSeconds);
  return weight + recency;
}

export function getTopN(notifications: Notification[], n: number): Notification[] {
  const scored = notifications.map((notif) => ({
    ...notif,
    score: computePriorityScore(notif),
  }));

  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return scored.slice(0, n);
}
