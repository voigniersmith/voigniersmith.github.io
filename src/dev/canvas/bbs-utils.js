import { BBS_FEATURED_URL, BBS_MORE_URL, CORS_PROXY } from './desktop.config';

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
