// Reg No: 22MID0305

import { FetchParams, NotificationsResponse } from "./types";
import { API_BASE, API_TOKEN } from "./config";
import { Log } from "./logger";

export async function fetchNotifications(
  params: FetchParams = {}
): Promise<NotificationsResponse> {
  const useMockAPI = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
  const endpoint = useMockAPI 
    ? "/api/notifications"
    : `${API_BASE}/evaluation-service/notifications`;
  
  const url = new URL(endpoint, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  if (params.limit !== undefined) url.searchParams.set("limit", String(params.limit));
  if (params.page !== undefined) url.searchParams.set("page", String(params.page));
  if (params.notification_type) url.searchParams.set("notification_type", params.notification_type);

  await Log("frontend", "info", "api", `API call start: Fetching notifications with params ${JSON.stringify(params)}`);

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (!useMockAPI) {
      headers["Authorization"] = `Bearer ${API_TOKEN}`;
    }

    const res = await fetch(url.toString(), {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API error ${res.status}: ${res.statusText} - ${errText}`);
    }

    const data = await res.json();
    await Log("frontend", "info", "api", `API call success: Fetched ${data?.notifications?.length || 0} notifications`);
    return data as NotificationsResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown API error";
    await Log("frontend", "error", "api", `API call error: ${message}`);
    throw error;
  }
}
