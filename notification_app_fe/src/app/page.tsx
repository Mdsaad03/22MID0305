// Reg No: 22MID0305

"use client";

import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import { fetchNotifications } from "@/lib/api";
import { Notification, NotificationType } from "@/lib/types";
import NotificationCard from "@/components/NotificationCard";
import NavBar from "@/components/NavBar";
import { Log } from "@/lib/logger";

export default function AllNotificationsPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [displayed, setDisplayed] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterType, setFilterType] = useState<NotificationType | "All">("All");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications({
        notification_type: filterType === "All" ? undefined : filterType,
      });
      setAllNotifications(data.notifications ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    Log("frontend", "info", "page", "All Notifications page mounted");
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Client-side pagination
  useEffect(() => {
    const start = (page - 1) * limit;
    const slice = allNotifications.slice(start, start + limit);
    setDisplayed(slice);
    setTotalPages(Math.max(1, Math.ceil(allNotifications.length / limit)));
  }, [allNotifications, page]);

  function handleFilterChange(newFilter: NotificationType | "All") {
    Log("frontend", "info", "component", `Filter changed to ${newFilter}`);
    setFilterType(newFilter);
    setPage(1);
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <NavBar totalCount={allNotifications.length} />

      <Box component="main" sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>All Notifications</Typography>

        {/* Filter buttons */}
        <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {["All", "Placement", "Result", "Event"].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "contained" : "outlined"}
              size="small"
              onClick={() => handleFilterChange(type as NotificationType | "All")}
            >
              {type}
            </Button>
          ))}
        </Box>

        {/* Error */}
        {error && (
          <Box sx={{ p: 2, mb: 2, bgcolor: "#ffebee", color: "#c62828", borderRadius: 1 }}>
            {error}
          </Box>
        )}

        {/* Loading */}
        {loading && <Typography>Loading...</Typography>}

        {/* Notifications list */}
        {!loading && !error && (
          <>
            {displayed.length === 0 ? (
              <Typography sx={{ textAlign: "center", color: "gray" }}>No notifications found</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {displayed.map((notif) => (
                  <Box key={notif.ID}>
                    <NotificationCard notification={notif} />
                  </Box>
                ))}
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 1 }}>
                <Button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  variant="outlined"
                  size="small"
                >
                  Previous
                </Button>
                <Typography sx={{ alignSelf: "center", mx: 1 }}>Page {page} of {totalPages}</Typography>
                <Button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  variant="outlined"
                  size="small"
                >
                  Next
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
