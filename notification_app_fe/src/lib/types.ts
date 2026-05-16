// Reg No: 22MID0305

export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
  score?: number;
  viewed?: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface FetchParams {
  limit?: number;
  page?: number;
  notification_type?: NotificationType | "";
}
