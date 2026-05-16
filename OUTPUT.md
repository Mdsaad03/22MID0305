// Reg No: 22MID0305

# Application Output Documentation

## Overview
CampusNotify application screenshots demonstrating core functionality across different views and states.

## All Notifications Page - Default View

**URL:** http://localhost:3000

**Features Demonstrated:**
- All notifications displayed with 8 sample notifications
- Filter buttons: All, Placement, Result, Event
- Unread notifications with blue left border indicator (Placement notification - "CSX Corporation Hiring")
- Read notifications with reduced opacity (Result notifications)
- Type badges with distinct colors:
  - Result: Cyan badge
  - Placement: Green badge
  - Event: Orange badge
- Clean card layout with notification message and timestamp
- Material-UI dark theme with purple accent colors

## All Notifications Page - After Click (Read State)

**Features Demonstrated:**
- Filtered view showing Placement notifications only
- "Placement" filter button is highlighted (active state)
- Successfully read notification now shows with blue border (unread) and white text
- Another Placement notification shown below
- Visual distinction between read and unread states
- Pagination with "Previous" and "Next" buttons visible

## Key UX Elements

### Unread Notification Indicator
- Blue left border on card
- Full opacity text
- Type badge clearly visible

### Read Notification Indicator
- No left border
- Reduced opacity/faded appearance
- Still fully functional and clickable

### Filter System
- "All" button shows all notifications
- Type-specific buttons (Placement, Result, Event) filter by category
- Active filter highlighted with purple background
- Smooth state management

### Pagination
- Shows 10 notifications per page
- Previous/Next navigation buttons
- Page count tracking

## Responsive Design
- Material-UI AppBar at top with navigation links
- CampusNotify branding on left
- "All Notifications" and "Priority Inbox" navigation links on right
- Notification count badge (5) shown next to Priority Inbox link
- Dark theme applied across all components
- Cards properly spaced with hover effects

## Technical Implementation
- Built with Next.js 16.2.6 and React 19
- Material-UI v9.0.1 components only
- localStorage for read/unread state persistence
- Real-time updates with window events
- Production-ready error handling
- Logging middleware for event tracking
