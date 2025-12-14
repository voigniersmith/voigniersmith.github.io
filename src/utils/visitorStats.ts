/**
 * Visitor statistics tracking using localStorage
 * Tracks visitors, sessions, and commands executed
 */

export interface VisitorStats {
  totalVisitors: number;
  totalSessions: number;
  commandsExecuted: number;
  firstVisit: string;
  lastVisit: string;
}

const STATS_KEY = 'visitor_stats';
const SESSION_KEY = 'current_session_id';

/**
 * Initialize or get visitor stats
 */
export function initializeStats(): VisitorStats {
  try {
    const existing = localStorage.getItem(STATS_KEY);

    if (existing) {
      const stats = JSON.parse(existing) as VisitorStats;
      // Increment sessions on page load
      stats.totalSessions += 1;
      stats.lastVisit = new Date().toISOString();
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
      return stats;
    }

    // First visit
    const newStats: VisitorStats = {
      totalVisitors: 1,
      totalSessions: 1,
      commandsExecuted: 0,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
    };

    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    return newStats;
  } catch (error) {
    console.warn('Error initializing visitor stats:', error);
    // Return default stats if localStorage fails
    return {
      totalVisitors: 1,
      totalSessions: 1,
      commandsExecuted: 0,
      firstVisit: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
    };
  }
}

/**
 * Get current visitor stats
 */
export function getStats(): VisitorStats {
  try {
    const existing = localStorage.getItem(STATS_KEY);
    if (existing) {
      return JSON.parse(existing) as VisitorStats;
    }
  } catch (error) {
    console.warn('Error reading visitor stats:', error);
  }

  return {
    totalVisitors: 1,
    totalSessions: 1,
    commandsExecuted: 0,
    firstVisit: new Date().toISOString(),
    lastVisit: new Date().toISOString(),
  };
}

/**
 * Increment commands executed counter
 */
export function recordCommand(): void {
  try {
    const stats = getStats();
    stats.commandsExecuted += 1;
    stats.lastVisit = new Date().toISOString();
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn('Error recording command:', error);
  }
}

/**
 * Format date for display
 */
export function formatStatsDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
