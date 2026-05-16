# -*- coding: utf-8 -*-
"""
Stage 1 - Demo run using sample data from the provided API response.
Run this to see the Priority Inbox output without needing an API token.
"""
import sys
import io
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Sample data from the evaluation document
SAMPLE_NOTIFICATIONS = [
    {"ID": "d146095a-0d86-4a34-9e69-3900a14576bc", "Type": "Result", "Message": "mid-sem", "Timestamp": "2026-04-22 17:51:30"},
    {"ID": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0", "Type": "Placement", "Message": "CSX Corporation hiring", "Timestamp": "2026-04-22 17:51:18"},
    {"ID": "81589ada-0ad3-4f77-9554-f52fb558e09d", "Type": "Event", "Message": "farewell", "Timestamp": "2026-04-22 17:51:06"},
    {"ID": "0005513a-142b-4bbc-8678-eefec65e1ede", "Type": "Result", "Message": "mid-sem", "Timestamp": "2026-04-22 17:50:54"},
    {"ID": "ea836726-c25e-4f21-a72f-544a6af8a37f", "Type": "Result", "Message": "project-review", "Timestamp": "2026-04-22 17:50:42"},
    {"ID": "003cb427-8fc6-47f7-bb00-be228f6b0d2c", "Type": "Result", "Message": "external", "Timestamp": "2026-04-22 17:50:30"},
    {"ID": "e5c4ff20-31bf-4d40-8f02-72fda59e8918", "Type": "Result", "Message": "project-review", "Timestamp": "2026-04-22 17:50:18"},
    {"ID": "1cfce5ee-ad37-4894-8946-d707627176a5", "Type": "Event", "Message": "tech-fest", "Timestamp": "2026-04-22 17:50:06"},
    {"ID": "cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8", "Type": "Result", "Message": "project-review", "Timestamp": "2026-04-22 17:49:54"},
    {"ID": "8a7412bd-6065-4d09-8501-a37f11cc848b", "Type": "Placement", "Message": "Advanced Micro Devices Inc. hiring", "Timestamp": "2026-04-22 17:49:42"},
]

import heapq

TYPE_WEIGHT = {"Placement": 3, "Result": 2, "Event": 1}

def compute_priority_score(notification, now):
    weight = TYPE_WEIGHT.get(notification["Type"], 1)
    try:
        ts_str = notification["Timestamp"].replace(" ", "T") + "Z"
        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        age_seconds = max(0, (now - ts).total_seconds())
    except Exception:
        age_seconds = float("inf")
    recency = 1.0 / (1.0 + age_seconds)
    return weight + recency

def get_top_n(notifications, n, now):
    heap = []
    for idx, notif in enumerate(notifications):
        score = compute_priority_score(notif, now)
        entry = (score, idx, notif)
        if len(heap) < n:
            heapq.heappush(heap, entry)
        elif score > heap[0][0]:
            heapq.heapreplace(heap, entry)
    ranked = sorted(heap, key=lambda x: -x[0])
    return [(score, notif) for score, _, notif in ranked]

BOLD = "\033[1m"
RESET = "\033[0m"
GREEN = "\033[92m"
BLUE = "\033[94m"
YELLOW = "\033[93m"

TYPE_COLORS = {"Placement": GREEN, "Result": BLUE, "Event": YELLOW}
TYPE_ICONS = {"Placement": "[P]", "Result": "[R]", "Event": "[E]"}

if __name__ == "__main__":
    n = 10
    now = datetime(2026, 4, 22, 17, 52, 0, tzinfo=timezone.utc)

    ranked = get_top_n(SAMPLE_NOTIFICATIONS, n=n, now=now)

    width = 78
    print()
    print("=" * width)
    print(f"  PRIORITY INBOX -- TOP {n} NOTIFICATIONS".center(width))
    print("=" * width)
    print(f"  {'Rank':<5} {'Type':<12} {'Score':<8} {'Message':<30} {'Timestamp'}")
    print("-" * width)

    for rank, (score, notif) in enumerate(ranked, start=1):
        ntype = notif.get("Type", "Unknown")
        icon = TYPE_ICONS.get(ntype, "[?]")
        color = TYPE_COLORS.get(ntype, "")
        msg = notif.get("Message", "")
        ts = notif.get("Timestamp", "")
        display_msg = (msg[:27] + "...") if len(msg) > 30 else msg
        print(
            f"  {rank:<5} "
            f"{color}{icon} {ntype:<10}{RESET} "
            f"{score:<8.4f} "
            f"{display_msg:<30} "
            f"{ts}"
        )

    print("=" * width)
    print(f"  Total: {len(SAMPLE_NOTIFICATIONS)} notifications. Showing top {min(n, len(ranked))}.")
    print("=" * width)
    print()
    print("  Priority formula: score = type_weight + 1/(1 + age_seconds)")
    print("  Weights: Placement=3, Result=2, Event=1")
    print()
