// Reg No: 22MID0305

import { NextRequest, NextResponse } from "next/server";

const MOCK_NOTIFICATIONS = [
  {
    ID: "d146095a-0d86-4a34-9e69-3900a14576bc",
    Type: "Result",
    Message: "Your mid-semester exam results are now available",
    Timestamp: "2026-04-22 17:51:30",
  },
  {
    ID: "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
    Type: "Placement",
    Message: "CSX Corporation Hiring",
    Timestamp: "2026-04-22 17:51:18",
  },
  {
    ID: "81589ada-0ad3-4f77-9554-f52fb558e09d",
    Type: "Event",
    Message: "Campus farewell party this weekend",
    Timestamp: "2026-04-22 17:51:06",
  },
  {
    ID: "08055I3e-142b-4bbc-8678-eefcc65elede",
    Type: "Result",
    Message: "Final project submission scores released",
    Timestamp: "2026-04-22 17:50:54",
  },
  {
    ID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    Type: "Event",
    Message: "Tech talk: AI in Healthcare",
    Timestamp: "2026-04-22 17:45:00",
  },
  {
    ID: "f1234567-89ab-cdef-0123-456789abcdef",
    Type: "Placement",
    Message: "TCS Recruitment Process Started",
    Timestamp: "2026-04-22 17:30:00",
  },
  {
    ID: "g2345678-9abc-def0-1234-56789abcdef0",
    Type: "Result",
    Message: "Quiz 3 results are out",
    Timestamp: "2026-04-22 16:00:00",
  },
  {
    ID: "h3456789-abcd-ef01-2345-6789abcdef01",
    Type: "Event",
    Message: "Library extended hours this semester",
    Timestamp: "2026-04-22 15:00:00",
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const notificationType = searchParams.get("notification_type");

  let filtered = MOCK_NOTIFICATIONS;
  if (notificationType && notificationType !== "All") {
    filtered = MOCK_NOTIFICATIONS.filter((n) => n.Type === notificationType);
  }

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);

  return NextResponse.json({
    notifications: paginated,
    total: filtered.length,
    page,
    limit,
  });
}
