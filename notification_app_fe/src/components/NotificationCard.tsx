// Reg No: 22MID0305

"use client";

import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { Notification } from "@/lib/types";
import { markRead, getReadIds } from "@/lib/useReadStore";
import { useEffect, useState } from "react";

interface Props {
  notification: Notification;
  rank?: number;
  showScore?: boolean;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts.replace(" ", "T") + (ts.includes("Z") ? "" : "Z"));
  if (isNaN(date.getTime())) return ts;
  const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${datePart} · ${timePart}`;
}

const TYPE_COLORS: Record<string, string> = {
  Placement: "success",
  Result: "info",
  Event: "warning",
};

export default function NotificationCard({ notification, rank, showScore }: Props) {
  const [read, setRead] = useState(true);

  useEffect(() => {
    function check() {
      setRead(getReadIds().has(notification.ID));
    }
    check();
    window.addEventListener("readUpdated", check);
    return () => window.removeEventListener("readUpdated", check);
  }, [notification.ID]);

  function handleRead() {
    markRead(notification.ID);
    setRead(true);
  }

  return (
    <Card
      onClick={handleRead}
      sx={{
        cursor: "pointer",
        borderLeft: read ? "3px solid transparent" : "3px solid #1976d2",
        opacity: read ? 0.7 : 1,
        "&:hover": { opacity: 1 },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
          <Chip label={notification.Type} size="small" color={TYPE_COLORS[notification.Type] as any} variant="outlined" />
          {showScore && notification.score !== undefined && (
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              Score: {notification.score.toFixed(3)}
            </Typography>
          )}
        </Box>
        
        <Typography sx={{ fontWeight: read ? "normal" : "bold", mb: 1 }}>
          {notification.Message}
        </Typography>
        
        <Typography variant="caption" sx={{ color: "gray" }}>
          {formatTimestamp(notification.Timestamp)}
        </Typography>
      </CardContent>
    </Card>
  );
}
