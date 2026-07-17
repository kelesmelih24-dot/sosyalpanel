// Pulls a best-effort username/handle out of a social media profile link,
// e.g. "https://instagram.com/melihkeles/" -> "melihkeles",
// "https://www.tiktok.com/@melih" -> "melih". Falls back to the raw link if
// nothing sensible can be extracted (e.g. malformed input).
export function extractHandle(link: string): string {
  try {
    const url = new URL(link.match(/^https?:\/\//) ? link : `https://${link}`);
    const segments = url.pathname.split("/").filter(Boolean);
    let handle = segments[0] ?? "";
    handle = handle.replace(/^@/, "");
    if (!handle) return link;
    return handle;
  } catch {
    return link;
  }
}
