# voigniersmith.com

My personal site: a little pretend shell you can poke around in, with a guestbook
visitors can sign from the command line.

Originally inspired by [react-terminal](https://github.com/bony2023/react-terminal) and
[react-terminal-ui](https://github.com/jonmbake/react-terminal-ui). This is v3, a fresh
rewrite of the 2022 terminal site on Vite.

## Commands

```
help  ls  cd  pwd  cat  open  guestbook [sign]  whoami  start  echo  history  theme  clear  view-source
```

Plus a few hidden ones.

## Running it

```bash
npm install
npm run dev       # localhost:5173
npm run build     # type-check + build to dist/
```

The guestbook needs Firebase: copy `.env.example` to `.env.local` and fill it in.
Without it the site works and the guestbook reports itself offline.

## Deploying

Pushing to `main` builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`).
The guestbook's security rules live in `database.rules.json`; paste them into
Firebase Console > Realtime Database > Rules when they change.
