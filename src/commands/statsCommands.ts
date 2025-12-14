import { Command, CommandDeps } from './types';
import { fetchGitHubStats, formatDate } from '../utils/githubApi';
import { getStats, formatStatsDate } from '../utils/visitorStats';
import { fetchGlobalStats } from '../utils/firebase';
import { AnimationSpeed } from '../utils/animationSpeed';

export function createStatsCommands(deps: CommandDeps): Command[] {
  const { createOutput, onAnimationRef, onUpdateLineData0Ref, executeAsyncCommand, onStopAnimationRef } = deps;

  return [
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'global-stats',
      description: "'global-stats': show aggregate visitor statistics",
      execute: (input, ld) => {
        ld.push(createOutput('fetching global statistics...'));

        executeAsyncCommand(
          'global-stats',
          'fetching global statistics...',
          () => fetchGlobalStats(),
          (globalStats) => {
            const statsLines: string[] = [];
            statsLines.push('');
            statsLines.push('═════════════════════════════════════════');
            statsLines.push('      GLOBAL PORTFOLIO STATISTICS');
            statsLines.push('═════════════════════════════════════════');
            statsLines.push('');

            if (globalStats) {
              statsLines.push('Overall Usage');
              statsLines.push(`  Total Page Loads:     ${globalStats.totalPageLoads || 0}`);
              statsLines.push(`  Total Commands:       ${globalStats.totalCommands || 0}`);
              statsLines.push(`  Last Page Load:       ${globalStats.lastPageLoad ? formatDate(globalStats.lastPageLoad) : 'Never'}`);
              statsLines.push('');

              if (globalStats.commands && Object.keys(globalStats.commands).length > 0) {
                statsLines.push('Most Used Commands');
                const cmds = Object.entries(globalStats.commands)
                  .map(([cmd, count]: [string, any]) => ({ cmd, count }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10);

                cmds.forEach(({ cmd, count }) => {
                  statsLines.push(`  ${cmd}: ${count}`);
                });
                statsLines.push('');
              }
            } else {
              statsLines.push('No global stats available yet.');
              statsLines.push('Make sure Firebase is configured in .env.local');
              statsLines.push('');
            }

            statsLines.push('═════════════════════════════════════════');
            statsLines.push('');

            return statsLines;
          },
          (lines) => {
            onStopAnimationRef.current?.();
            onUpdateLineData0Ref.current?.(() => lines.map(line => createOutput(line)));
          }
        );

        return ld;
      },
    },
    {
      match: (input) => input.toLocaleLowerCase().trim() === 'stats',
      description: "'stats': show your personal session statistics",
      execute: (input, ld) => {
        ld.push(createOutput(''));
        ld.push(createOutput('═════════════════════════════════════════'));
        ld.push(createOutput('          PORTFOLIO STATISTICS'));
        ld.push(createOutput('═════════════════════════════════════════'));
        ld.push(createOutput(''));
        ld.push(createOutput('fetching statistics...'));

        executeAsyncCommand(
          'stats',
          'fetching statistics...',
          async () => {
            try {
              const githubStats = await fetchGitHubStats();
              const visitorStats = getStats();
              return { githubStats, visitorStats };
            } catch (error) {
              console.error('Error fetching stats:', error);
              return { githubStats: null, visitorStats: getStats() };
            }
          },
          ({ githubStats, visitorStats }) => {
            const statsOutput: string[] = [];
            statsOutput.push('');
            statsOutput.push('═════════════════════════════════════════');
            statsOutput.push('          PORTFOLIO STATISTICS');
            statsOutput.push('═════════════════════════════════════════');
            statsOutput.push('');

            if (githubStats) {
              statsOutput.push('GitHub Repository (voigniersmith.github.io)');
              statsOutput.push(`  Stars:        ${githubStats.stars}`);
              statsOutput.push(`  Forks:        ${githubStats.forks}`);
              statsOutput.push(`  Watchers:     ${githubStats.watchers}`);
              statsOutput.push(`  Open Issues:  ${githubStats.openIssues}`);
              statsOutput.push(`  Language:     ${githubStats.language}`);
              statsOutput.push(`  Last Update:  ${formatDate(githubStats.lastUpdate)}`);
              statsOutput.push('');
            } else {
              statsOutput.push('(GitHub stats unavailable)');
              statsOutput.push('');
            }

            statsOutput.push('Visitor Statistics');
            statsOutput.push(`  Total Sessions:      ${visitorStats.totalSessions}`);
            statsOutput.push(`  Commands Executed:   ${visitorStats.commandsExecuted}`);
            statsOutput.push(`  First Visit:         ${formatStatsDate(visitorStats.firstVisit)}`);
            statsOutput.push(`  Last Visit:          ${formatStatsDate(visitorStats.lastVisit)}`);
            statsOutput.push('');
            statsOutput.push('═════════════════════════════════════════');
            statsOutput.push('');

            return statsOutput;
          },
          (lines) => {
            onAnimationRef.current?.(lines, AnimationSpeed.FAST);
          }
        );

        return ld;
      },
    },
  ];
}
