// Minecraft server status via mcstatus.io (CORS-enabled, caches ~1 min).
const SERVER = 'adv-varied.tun.ply.gg:1094';

export interface Status {
  online: boolean;
  version?: string;
  players?: { online: number; max: number };
  motd?: string;
}

export async function status(): Promise<Status> {
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${SERVER}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`status check failed (${res.status})`);
  const d = await res.json();
  return {
    online: Boolean(d.online),
    version: d.version?.name_clean,
    players: d.players && { online: d.players.online, max: d.players.max },
    motd: d.motd?.clean?.trim(),
  };
}
