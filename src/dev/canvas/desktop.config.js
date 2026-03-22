// ── Desktop layout config ───────────────────────────────────────────────────
// Edit this file to change window positions, sizes, and BBS settings.

export const ICONS = [
  { id: 'about',        label: 'about'      },
  { id: 'projects',     label: 'projects'   },
  { id: 'resume',       label: 'resume'     },
  { id: 'contact',      label: 'contact'    },
  { id: 'carts',        label: 'carts'      },
  { id: 'pico-browser', label: 'p-explorer' },
  { id: 'terminal',     label: 'terminal'   },
  { id: 'github',  label: 'github'  },
  { id: 'weather', label: 'weather' },
  { id: 'paint',   label: 'paint'   },
];

// x, y, w, h are in canvas-logical pixels (before scale is applied).
export const INIT_WINS = [
  { id: 'about',        title: 'about.txt',   x: 70, y: 20, w: 360, h: 260 },
  { id: 'projects',     title: 'projects/',   x: 90, y: 25, w: 380, h: 290 },
  { id: 'resume',       title: 'resume.pdf',  x: 80, y: 25, w: 340, h: 240 },
  { id: 'contact',      title: 'contact',     x: 75, y: 22, w: 320, h: 230 },
  { id: 'carts',        title: 'carts/',      x: 85, y: 28, w: 340, h: 250 },
  { id: 'pico-browser', title: 'p-explorer',  x: 60, y: 20, w: 420, h: 290 },
  { id: 'terminal',     title: 'terminal',    x: 55, y: 18, w: 400, h: 280 },
  { id: 'github',  title: 'github',      x: 60, y: 18, w: 380, h: 270 },
  { id: 'weather', title: 'weather',     x: 80, y: 25, w: 280, h: 210 },
  { id: 'paint',   title: 'paint.exe',   x: 65, y: 20, w: 340, h: 260 },
];

// ── BBS / PICO-8 settings ───────────────────────────────────────────────────

export const BBS_FEATURED_URL =
  'https://www.lexaloffle.com/bbs/?cat=7&sub=2&mode=carts&orderby=featured';

// Pages 2+ switch to timestamp ordering; page param is `page=` not `p=`
export const BBS_MORE_URL =
  'https://www.lexaloffle.com/bbs/?cat=7&sub=2&mode=carts&orderby=ts&page=';

export const BBS_PAGE_SIZE = 30;  // items per page; fewer than this = last page

export const BBS_WIDGET_URL = 'https://www.lexaloffle.com/bbs/widget.php?pid=';

export const CORS_PROXY = 'https://corsproxy.io/?';

// Shown when the BBS fetch fails (offline, rate-limited, etc.).
// Find pids in BBS URLs: lexaloffle.com/bbs/?pid=XXXXX
export const BBS_FALLBACK = [
  { pid: 185041, title: 'Moss Moss'                            },
  { pid: 172338, title: 'Mouse Required'                       },
  { pid: 184410, title: 'TAD'                                  },
  { pid: 149645, title: 'Baba Is You Demake'                   },
  { pid: 166577, title: 'Dust Bunny'                           },
  { pid: 128883, title: 'A Stardew Valley Demake: Pico Valley' },
  { pid: 172855, title: 'From Rust To Ash'                     },
  { pid: 178576, title: '2025 Advent Calendar'                 },
  { pid: 131736, title: 'Zip Zapper'                           },
  { pid: 102471, title: '512px under'                          },
  { pid: 150377, title: 'Beam'                                 },
  { pid:  92323, title: 'Sphero'                               },
  { pid: 168053, title: 'Walker'                               },
  { pid: 143764, title: 'Bubblegum Spin'                       },
  { pid: 123143, title: 'Combat Chopper'                       },
  { pid: 171244, title: 'PICO-BALL'                            },
  { pid: 164478, title: 'Super Hat Girl!'                      },
  { pid: 163854, title: 'Pole Station'                         },
  { pid: 166904, title: 'Province'                             },
  { pid: 164882, title: 'Top Speed!'                           },
];
