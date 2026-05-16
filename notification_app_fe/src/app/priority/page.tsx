// Reg No: 22MID0305

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Box, Typography, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { fetchNotifications } from "@/lib/api";
import { Notification } from "@/lib/types";
import { getReadIds } from "@/lib/useReadStore";
import NotificationCard from "@/components/NotificationCard";
import NavBar from "@/components/NavBar";
import { Log } from "@/lib/logger";

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export default function PriorityInboxPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [topN, setTopN] = useState<number>(10);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all notifications without filters
      const data = await fetchNotifications({});
      setAllNotifications(data.notifications ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Log("frontend", "info", "page", "Priority Inbox page mounted");
    loadNotifications();
  }, [loadNotifications]);

  // Keep read state in sync to filter out read notifications
  useEffect(() => {
    const updateReadIds = () => {
      setReadIds(getReadIds());
    };
    updateReadIds(); // Initial load
    window.addEventListener("readUpdated", updateReadIds);
    return () => window.removeEventListener("readUpdated", updateReadIds);
  }, []);

  // Recalculate priority
  const prioritized = useMemo(() => {
    if (allNotifications.length === 0) return [];
    
    Log("frontend", "info", "state", `Recalculating priority for top ${topN}`);

    // 1. Filter out read notifications
    const unread = allNotifications.filter(n => !readIds.has(n.ID));

    // 2. Score them
    const now = Date.now();
    const scored = unread.map(n => {
      const weight = TYPE_WEIGHT[n.Type] || 1;
      const ts = new Date(n.Timestamp.replace(" ", "T") + (n.Timestamp.includes("Z") ? "" : "Z")).getTime();
      const secondsSince = Math.max(0, (now - ts) / 1000);
      const recencyScore = 1 / (1 + secondsSince); // Added +1 to avoid Infinity
      const finalScore = weight * recencyScore;
      
      return { ...n, score: finalScore };
    });

    // 3. Sort descending and take top N
    scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return scored.slice(0, topN);
  }, [allNotifications, topN, readIds]);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <NavBar totalCount={allNotifications.length} />

      <Box component="main" sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>Priority Inbox</Typography>

        <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "end" }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Show Top</InputLabel>
            <Select
              value={topN}
              label="Show Top"
              onChange={(e) => setTopN(Number(e.target.value))}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Box sx={{ p: 2, mb: 2, bgcolor: "#ffebee", color: "#c62828", borderRadius: 1 }}>
            {error}
          </Box>
        )}

        {loading && <Typography>Loading...</Typography>}

        {!loading && !error && (
          <>
            {prioritized.length === 0 ? (
              <Typography sx={{ textAlign: "center", color: "gray" }}>No unread priority notifications</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {prioritized.map((notif, index) => (
                  <Box key={notif.ID}>
                    <NotificationCard notification={notif} rank={index + 1} showScore />
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
