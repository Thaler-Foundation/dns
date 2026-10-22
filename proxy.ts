// Rewrites every covered page to the maintenance screen while MAINTENANCE_MODE is 1 (lib/maintenance.ts decides which pages).
import { NextResponse, type NextRequest } from "next/server";
import { MAINTENANCE_PATH, isMaintenanceMode, maintenanceApplies } from "@/lib/maintenance";

export function proxy(request: NextRequest) {
  if (isMaintenanceMode(process.env) && maintenanceApplies(request.nextUrl.pathname)) {
    return NextResponse.rewrite(new URL(MAINTENANCE_PATH, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
