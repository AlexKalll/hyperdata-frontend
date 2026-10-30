// Normalize legacy API responses, browser sessions, and cached role labels.
export function normalizeRole<T extends string | null | undefined>(role: T): T | "Admin" {
  return role === "SuperAdmin" ? "Admin" : role;
}
