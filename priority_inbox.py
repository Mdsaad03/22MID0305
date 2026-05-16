# -*- coding: utf-8 -*-
"""
Priority Inbox — Stage 1
AffordMed Campus Hiring Evaluation

Fetches notifications from the evaluation API and displays the top-n
most important unread notifications using a weighted priority score
(type weight + recency) maintained with an efficient min-heap.

Usage:
    python priority_inbox.py                    # top 10 (default)
    python priority_inbox.py --top 15           # top 15
    python priority_inbox.py --top 20 --token YOUR_TOKEN
"""

import heapq
import argparse
import sys
from datetime import datetime, timezone
from typing import Optional

import sys
import io
import requests

# Force UTF-8 output on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ─────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────
API_URL = "http://4.224.186.213/evaluation-service/notifications"

# Type weights: Placement > Result > Event
TYPE_WEIGHT: dict[str, int] = {
    "Placement": 3,
    "Result": 2,
    "Event": 1,
}

TIMESTAMP_FORMATS = [
    "%Y-%m-%d %H:%M:%S",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%dT%H:%M:%SZ",
]


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────
def parse_timestamp(ts: str) -> datetime:
    """Parse a timestamp string into an aware datetime (UTC)."""
    for fmt in TIMESTAMP_FORMATS:
        try:
            dt = datetime.strptime(ts, fmt)
            return dt.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    raise ValueError(f"Unrecognised timestamp format: {ts!r}")


def compute_priority_score(notification: dict, now: datetime) -> float:
    """
    Composite priority score = type_weight + recency_score.

    recency_score = 1 / (1 + seconds_since_notification)
      → decays smoothly towards 0 as the notification ages.

    This ensures:
      • Within the same type, newer notifications rank higher.
      • A very recent Event can still rank below an older Placement.
    """
    ntype = notification.get("Type", "Event")
    weight = TYPE_WEIGHT.get(ntype, 1)

    try:
        ts = parse_timestamp(notification["Timestamp"])
        age_seconds = (now - ts).total_seconds()
        age_seconds = max(age_seconds, 0)  # guard against clock skew
    except (KeyError, ValueError):
        age_seconds = float("inf")

    recency = 1.0 / (1.0 + age_seconds)
    return weight + recency


def fetch_notifications(token: Optional[str] = None) -> list[dict]:
    """Fetch notifications from the evaluation API."""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        resp = requests.get(API_URL, headers=headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data.get("notifications", [])
    except requests.exceptions.ConnectionError:
        print(f"[ERROR] Cannot reach API at {API_URL}", file=sys.stderr)
        sys.exit(1)
    except requests.exceptions.HTTPError as e:
        print(f"[ERROR] HTTP {e.response.status_code}: {e}", file=sys.stderr)
        sys.exit(1)
    except requests.exceptions.Timeout:
        print("[ERROR] Request timed out.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Unexpected error fetching notifications: {e}", file=sys.stderr)
        sys.exit(1)


# ─────────────────────────────────────────────
# Core: Min-Heap Top-N
# ─────────────────────────────────────────────
def get_top_n(notifications: list[dict], n: int, now: datetime) -> list[tuple[float, dict]]:
    """
    Return the top-n notifications by priority score using a min-heap.

    Algorithm:
      - Maintain a min-heap of size n.
      - For each notification:
          If heap not full → push.
          Else if score > heap minimum → pop min, push new.
      - Result: heap contains the n highest-scored items.

    Complexity: O(k log n)  where k = total notifications
    Space:      O(n)
    """
    heap: list[tuple[float, int, dict]] = []  # (score, tie_breaker, notification)

    for idx, notif in enumerate(notifications):
        score = compute_priority_score(notif, now)
        entry = (score, idx, notif)

        if len(heap) < n:
            heapq.heappush(heap, entry)
        elif score > heap[0][0]:
            heapq.heapreplace(heap, entry)

    # Sort descending by score for display
    ranked = sorted(heap, key=lambda x: -x[0])
    return [(score, notif) for score, _, notif in ranked]


# ─────────────────────────────────────────────
# Display
# ─────────────────────────────────────────────
TYPE_ICONS = {
    "Placement": "[P]",
    "Result": "[R]",
    "Event": "[E]",
}

TYPE_COLORS = {
    "Placement": "\033[92m",  # green
    "Result": "\033[94m",     # blue
    "Event": "\033[93m",      # yellow
}
RESET = "\033[0m"
BOLD = "\033[1m"


def display_priority_inbox(ranked: list[tuple[float, dict]], n: int) -> None:
    """Pretty-print the priority inbox to stdout."""
    width = 78
    print()
    print("=" * width)
    print(f"{BOLD}  🔔  PRIORITY INBOX — TOP {n} NOTIFICATIONS{RESET}".center(width + len(BOLD) + len(RESET)))
    print("=" * width)
    print(
        f"  {'Rank':<5} {'Type':<12} {'Score':<8} {'Message':<30} {'Timestamp'}"
    )
    print("-" * width)

    for rank, (score, notif) in enumerate(ranked, start=1):
        ntype = notif.get("Type", "Unknown")
        icon = TYPE_ICONS.get(ntype, "🔔")
        color = TYPE_COLORS.get(ntype, "")
        msg = notif.get("Message", "")
        ts = notif.get("Timestamp", "")

        # Truncate long messages
        display_msg = (msg[:27] + "...") if len(msg) > 30 else msg

        print(
            f"  {rank:<5} "
            f"{color}{icon} {ntype:<10}{RESET} "
            f"{score:<8.4f} "
            f"{display_msg:<30} "
            f"{ts}"
        )

    print("=" * width)
    print(f"  Total notifications fetched. Showing top {min(n, len(ranked))}.")
    print("=" * width)
    print()


# ─────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────
def main() -> None:
    parser = argparse.ArgumentParser(
        description="Priority Inbox — Campus Notification System (Stage 1)"
    )
    parser.add_argument(
        "--top", type=int, default=10,
        help="Number of top notifications to display (default: 10)"
    )
    parser.add_argument(
        "--token", type=str, default=None,
        help="Bearer token for the notifications API"
    )
    args = parser.parse_args()

    n = args.top
    if n < 1:
        print("[ERROR] --top must be at least 1", file=sys.stderr)
        sys.exit(1)

    print(f"\n[>>] Fetching notifications from API...")
    notifications = fetch_notifications(token=args.token)
    total = len(notifications)
    print(f"[OK] Received {total} notification(s).")

    if total == 0:
        print("[i]  No notifications available.")
        return

    now = datetime.now(tz=timezone.utc)
    ranked = get_top_n(notifications, n=n, now=now)
    display_priority_inbox(ranked, n=n)


if __name__ == "__main__":
    main()
