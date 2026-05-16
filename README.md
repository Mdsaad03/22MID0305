// Reg No: 22MID0305

# CampusNotify

Real-time campus notification system for Placements, Results, and Events.

## Features

- View all notifications with filtering by type
- Priority inbox with top-N notifications sorted by relevance
- Read/unread tracking with persistent storage
- Responsive Material-UI design
- Real-time logging to evaluation service

## Setup

1. Install dependencies:
Open [http://localhost:3000] in your browser

## Pages

- **All Notifications** (`/`) - View all notifications with filtering and pagination
- **Priority Inbox** (`/priority`) - Top-N priority-sorted notifications

## Technology Stack

- Next.js 16.2.6 (Turbopack)
- React 19
- TypeScript
- Material-UI v9.0.1
- Tailwind CSS

## Notification Types

- **Placement** - Recruitment and placement updates
- **Result** - Academic results and scores
- **Event** - Campus events and announcements

## Output & Functionality

### All Notifications Page (`/`)
- Displays complete list of notifications with type badges
- Filter buttons for All, Placement, Result, and Event types
- Unread notifications have left blue border indicator
- Read notifications appear with reduced opacity
- Pagination with Previous/Next buttons
- Shows 10 notifications per page
- Clean Material-UI card layout with timestamps

### Priority Inbox Page (`/priority`)
- Top-N priority-sorted notifications based on:
  - Type weight (Placement: 3, Result: 2, Event: 1)
  - Recency score (1 / (1 + seconds_since_creation))
- Dropdown selector to view top 10, 15, or 20 notifications
- Only shows unread notifications
- Same visual indicators as All Notifications page
- Computed score displayed for each notification

### Navigation
- Top navigation bar with CampusNotify branding
- Active page highlighting
- Unread count badge on Priority Inbox link
- Responsive Material-UI AppBar

## Author

Registration Number: 22MID0305
