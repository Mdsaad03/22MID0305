# Notification System Design

## Stage 1

### Problem Statement

The campus notifications application generates a high volume of notifications (Placements, Results, Events). Users lose track of important notifications because of this volume. The goal is to implement a **Priority Inbox** that always surfaces the top `n` most important unread notifications first.

---

### Priority Model

Each notification is assigned a **composite priority score** computed from two components:

#### 1. Type Weight (Importance)

| Notification Type | Weight |
|-------------------|--------|
| Placement         | 3      |
| Result            | 2      |
| Event             | 1      |

This reflects the domain importance: Placement notifications are career-critical, Results are academically significant, and Events are informational.

#### 2. Recency Score

Newer notifications are more relevant. The recency score is computed as:

```
recency_score = 1 / (1 + seconds_since_notification)
```

This decays towards 0 as the notification ages, giving a continuous penalty for older items without requiring hard cutoffs.

#### 3. Composite Score

```
priority_score = type_weight + recency_score
```

Adding recency to a weight-dominant score ensures that among same-type notifications, the newest one always wins, while a very old Placement can still outrank a very new Event.

---

### Algorithm: Maintaining Top-N Efficiently

**Problem:** New notifications arrive continuously. Resorting the entire list on every update is O(k log k) where k grows unboundedly.

**Solution: Fixed-Size Min-Heap (Priority Queue)**

We maintain a min-heap of size `n`:

```
Algorithm get_top_n(notifications, n):
    heap = min-heap of size n (keyed on priority_score)

    for each notification in stream:
        score = compute_priority_score(notification)
        if heap.size < n:
            heap.push((score, notification))
        elif score > heap.peek_min().score:
            heap.pop()
            heap.push((score, notification))

    return heap sorted descending
```

**Complexity:**
- **Time:** O(k log n) for k incoming notifications — significantly better than O(k log k)
- **Space:** O(n) — only the top-n are retained in memory at any time

This means as new notifications pour in, we only perform heap operations when a candidate might displace a current top-n member, making it highly efficient for real-time streams.

---

### Handling Continuous Incoming Notifications

Since new notifications arrive over time, the recency score of existing items decays. This means:

1. A new high-weight notification (Placement) immediately enters the top-n.
2. Existing top-n items' recency scores decrease each tick.
3. A periodic **re-score** pass (e.g., every 30 seconds) re-evaluates whether current top-n members still deserve their spot.

**Re-score Strategy:**
- On each polling cycle (configurable interval), re-fetch or receive the updated stream.
- Recompute `recency_score` for all items in the current heap.
- If any existing heap member's score drops below the `n+1`th best candidate, evict and replace it.

This ensures the Priority Inbox is always fresh without full re-sort.

---

### API Integration

```
GET http://4.224.186.213/evaluation-service/notifications
Headers: Authorization: Bearer <token>

Response:
{
  "notifications": [
    { "ID": "...", "Type": "Placement|Result|Event", "Message": "...", "Timestamp": "YYYY-MM-DD HH:MM:SS" }
  ]
}
```

The response is fetched, each notification is scored, and the top-n are extracted using the min-heap described above.

---

### Output Format

The Priority Inbox displays notifications ranked by priority score:

```
============================================================
 PRIORITY INBOX — TOP 10 NOTIFICATIONS
============================================================
 Rank | Type       | Score  | Message                  | Time
------+------------+--------+--------------------------+-------------------
  1   | Placement  | 3.0000 | CSX Corporation hiring   | 2026-04-22 17:51
  2   | Placement  | 3.0000 | Advanced Micro Devices.. | 2026-04-22 17:49
  3   | Result     | 2.0000 | mid-sem                  | 2026-04-22 17:51
  ...
============================================================
```

---

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Priority formula | Weight + Recency | Balances type importance with temporal relevance |
| Data structure | Min-Heap size n | O(k log n) streaming efficiency |
| Recency decay | Inverse of age (seconds) | Smooth continuous decay, no hard cutoffs |
| No DB required | In-memory heap | Stateless, horizontally scalable for read-heavy workloads |
| Language | Python | Rapid prototyping, rich stdlib (heapq, datetime) |

---

### Scalability Considerations

- **Horizontal Scaling:** The scoring function is stateless — multiple instances can independently compute top-n and results can be merged (a distributed top-n merge).
- **Kafka Integration:** In a production environment, notifications would arrive via a Kafka topic. The heap consumer would process each message as it arrives, maintaining the top-n window in a stateful stream processor (e.g., Kafka Streams, Flink).
- **TTL / Expiry:** Notifications older than a threshold (e.g., 7 days) can be automatically excluded from scoring to prevent stale placements from occupying top slots.

---

*Document prepared for AffordMed Campus Hiring Evaluation — Full Stack Track*
