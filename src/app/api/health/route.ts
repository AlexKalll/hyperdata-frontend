import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "mahder-frontend",
    timestamp: new Date().toISOString(),
  });
}
