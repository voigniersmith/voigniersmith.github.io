/**
 * Convert old setTimeout delay (ms) to chars per second for RAF-based animation.
 *
 * Old system: setTimeout with X ms between characters
 * New system: characters per second for RAF
 *
 * Formula: chars_per_sec = 1000 / ms_delay
 *
 * @param msDelay - Milliseconds delay between characters in old system
 * @returns Characters per second for new RAF-based system
 */
export function msDelayToCharsPerSec(msDelay: number): number {
  return Math.round(1000 / msDelay);
}

/**
 * Standard animation speeds based on old implementation timings.
 *
 * These map the old setTimeout delays to the new chars/second system:
 * - FAST: was 1ms delay (1000 chars/sec)
 * - NORMAL: was 2ms delay (500 chars/sec)
 * - MEDIUM: was 10ms delay (100 chars/sec)
 * - SLOW: was 15ms delay (~67 chars/sec)
 */
export const AnimationSpeed = {
  FAST: msDelayToCharsPerSec(1),    // 1000 chars/sec
  NORMAL: msDelayToCharsPerSec(2),  // 500 chars/sec
  MEDIUM: msDelayToCharsPerSec(10), // 100 chars/sec
  SLOW: msDelayToCharsPerSec(15),   // 67 chars/sec
  VERY_SLOW: msDelayToCharsPerSec(100), // 10 chars/sec
} as const;
