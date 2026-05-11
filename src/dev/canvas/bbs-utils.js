import { BBS_FEATURED_URL, BBS_MORE_URL, BBS_PAGE_SIZE, CORS_PROXY } from './desktop.config';

// Parse pico-8 BBS cart HTML into [{pid, title, author}]
// Scans individual array entries instead of the outer pdat=[...] block
// because the lazy outer regex breaks on ] characters inside nested entries.
export function parseBBSHtml(html) {
  return [...html.matchAll(/\['(\d+)',\s*\d+,\s*`([^`]+)`,\s*"[^"]*",\s*[\d.]+,\s*[\d.]+,\s*"[^"]*",\s*\d+,\s*"([^"]*)"/g)]
    .map(m => ({ pid: Number(m[1]), title: m[2], author: m[3] }))
    .filter(c => c.pid && c.title);
}

export function fetchBBSPage(page, callback) {
  const url = page === 1 ? BBS_FEATURED_URL : `${BBS_MORE_URL}${page}`;
  fetch(CORS_PROXY + encodeURIComponent(url))
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(html => callback(parseBBSHtml(html), null))
    .catch(err  => callback(null, err));
}

export function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function toast(s, msg) {
  s.toasts.push({ msg, ttl: 180 });
}

// Fetch the next BBS page and merge into state. Handles three terminal cases:
// transient error (keep retryable), genuine empty/dedup-empty (end of feed),
// and successful append (update page cursor + debounce timestamp).
export function loadMoreBBSPage(s, nextPage) {
  s.bbsLoading = true;
  fetchBBSPage(nextPage, (items, err) => {
    if (err) {
      toast(s, 'p-explorer: fetch failed, scroll to retry');
    } else if (!items || items.length === 0) {
      s.bbsHasMore = false;
    } else {
      const seen = new Set(s.bbsFeatured.map(c => c.pid));
      const fresh = items.filter(c => !seen.has(c.pid));
      if (fresh.length === 0) {
        s.bbsHasMore = false;
      } else {
        s.bbsFeatured = [...s.bbsFeatured, ...fresh];
        s.bbsPage     = nextPage;
        s.bbsHasMore  = items.length >= BBS_PAGE_SIZE;
        s.bbsLastLoad = Date.now();
        toast(s, `loaded ${fresh.length} more carts`);
      }
    }
    s.bbsLoading = false;
  });
}
