// The maintenance flag and the pages it covers: MAINTENANCE_MODE must be exactly "1"; the legal pages, the screen itself, the API and the assets are never covered.
export const MAINTENANCE_PATH = "/maintenance";
export const MAINTENANCE_EXEMPT = ["/terms", "/privacy", "/cookies"] as const;

export function isMaintenanceMode(env: Readonly<Record<string, string | undefined>>): boolean {
  return env.MAINTENANCE_MODE === "1";
}

export function maintenanceApplies(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path === MAINTENANCE_PATH) return false;
  if ((MAINTENANCE_EXEMPT as readonly string[]).includes(path)) return false;
  if (path.startsWith("/api/") || path.startsWith("/_next/")) return false;
  if (/\.[a-z0-9]+$/i.test(path)) return false;
  return true;
}
