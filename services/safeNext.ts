/**
 * Validates a post-login redirect target (?next=...). Only same-site absolute paths are allowed,
 * so the login page can never redirect to another website.
 */
export const safeNextPath = (raw: string | null | undefined): string | null => {
  if (!raw || raw.length > 200) return null;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return null;
  if (/[\u0000-\u001f]/.test(raw)) return null;
  return raw;
};
