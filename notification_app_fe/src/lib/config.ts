// Reg No: 22MID0305

export const API_BASE = process.env.NEXT_PUBLIC_USE_MOCK_API === "true" 
  ? "http://localhost:3000"
  : "http://4.224.186.213";

export const API_TOKEN = process.env.API_TOKEN || process.env.NEXT_PUBLIC_API_TOKEN || "your_token_here";
