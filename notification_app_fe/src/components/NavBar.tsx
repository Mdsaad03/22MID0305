// Reg No: 22MID0305

"use client";

import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getReadIds } from "@/lib/useReadStore";

interface Props {
  totalCount?: number;
}

export default function NavBar({ totalCount = 0 }: Props) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    function computeUnread() {
      const read = getReadIds();
      setUnreadCount(Math.max(0, totalCount - read.size));
    }
    computeUnread();
    window.addEventListener("readUpdated", computeUnread);
    return () => window.removeEventListener("readUpdated", computeUnread);
  }, [totalCount]);

  return (
    <AppBar position="sticky" sx={{ bgcolor: "#1976d2" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          CampusNotify
        </Typography>
        
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            component={Link}
            href="/"
            color={pathname === "/" ? "inherit" : "inherit"}
            sx={{ color: pathname === "/" ? "#fff" : "rgba(255,255,255,0.7)", fontWeight: pathname === "/" ? "bold" : "normal" }}
          >
            All Notifications
          </Button>
          
          <Button
            component={Link}
            href="/priority"
            sx={{ color: pathname === "/priority" ? "#fff" : "rgba(255,255,255,0.7)", fontWeight: pathname === "/priority" ? "bold" : "normal" }}
          >
            Priority Inbox {unreadCount > 0 && `(${unreadCount})`}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
