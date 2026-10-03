/**
 * Validates and builds the "return to the ECU FORGE mobile app" link used by /purchase.
 *
 * The mobile app passes its own return URL (?return=...). Only app URLs are accepted so the purchase
 * page can never be used as an open redirect:
 *  - ecuforge://purchase-return            (development / production builds of the app)
 *  - exp(s)://<LAN | localhost | *.exp.direct>/--/purchase-return   (Expo Go during development)
 *
 * The link only carries non-sensitive data (courseId + a status hint). The app never trusts the status:
 * it re-fetches its enrollments from the API. No tokens, signatures or payment ids are ever added.
 */

export type AppReturnStatus = 'success' | 'pending' | 'cancelled' | 'failed';

const RETURN_PATH = 'purchase-return';

const isPrivateOrDevHost = (hostname: string): boolean => {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1') return true;
  if (h.endsWith('.exp.direct')) return true; // Expo tunnel
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return a === 10 || (a === 192 && b === 168) || (a === 172 && b >= 16 && b <= 31);
};

export const parseAppReturnUrl = (raw: string | null | undefined): URL | null => {
  if (!raw || raw.length > 512) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.username || url.password) return null;

  if (url.protocol === 'ecuforge:') {
    const ok =
      (url.hostname === RETURN_PATH && (url.pathname === '' || url.pathname === '/')) ||
      (url.hostname === '' && url.pathname.replace(/^\/+/, '') === RETURN_PATH);
    return ok ? url : null;
  }

  if (url.protocol === 'exp:' || url.protocol === 'exps:') {
    return isPrivateOrDevHost(url.hostname) && url.pathname === `/--/${RETURN_PATH}` ? url : null;
  }

  return null;
};

export const buildAppReturnLink = (base: URL, courseId: string, status: AppReturnStatus): string => {
  const url = new URL(base.toString());
  url.search = '';
  url.hash = '';
  url.searchParams.set('courseId', courseId);
  url.searchParams.set('status', status);
  return url.toString();
};
