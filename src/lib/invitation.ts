export function getInvitationUrl(role: string, id: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const userType = role.toLowerCase().replace(/s$/, "");

  return `${baseUrl.replace(/\/+$/, "")}/linkForm/${userType}/${id}`;
}
