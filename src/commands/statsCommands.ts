import { Command, CommandDeps } from './types';
import { fetchGitHubStats, formatDate, fetchUserPortfolioRepos, PortfolioRepo } from '../utils/githubApi';
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
          async () => {
            const [globalStats, repos] = await Promise.all([
              fetchGlobalStats(),
              fetchUserPortfolioRepos(),
            ]);
            return { globalStats, repos };
          },
          ({ globalStats, repos }) => {
            const statsLines: string[] = [];
            const now = new Date();
            const timeStr = now.toLocaleString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            statsLines.push('');
            statsLines.push('GLOBAL STATISTICS'.padEnd(50) + `Last Updated: ${timeStr}`);
            statsLines.push('═'.repeat(70));
            statsLines.push('');

            if (globalStats) {
              const totalPageLoads = globalStats.totalPageLoads || 0;
              const totalCommands = globalStats.totalCommands || 0;
              const avgCmdsPerLoad = totalPageLoads > 0 ? (totalCommands / totalPageLoads).toFixed(1) : 0;

              statsLines.push('USAGE OVERVIEW');
              statsLines.push(
                `  Page Loads${' '.repeat(13)}${totalPageLoads.toString().padStart(10)}`
              );
              statsLines.push(
                `  Total Commands${' '.repeat(9)}${totalCommands.toString().padStart(10)}`
              );
              statsLines.push(
                `  Avg Cmds/Load${' '.repeat(9)}${avgCmdsPerLoad.toString().padStart(10)}`
              );
              statsLines.push(
                `  Last Activity${' '.repeat(10)}${
                  globalStats.lastPageLoad ? formatDate(globalStats.lastPageLoad) : 'Never'
                }`
              );
              statsLines.push('');

              if (globalStats.commands && Object.keys(globalStats.commands).length > 0) {
                statsLines.push('TOP COMMANDS');
                statsLines.push(
                  'Rank'.padEnd(6) +
                  'Command'.padEnd(16) +
                  'Count'.padStart(8) +
                  'Percent'.padStart(10)
                );
                statsLines.push('─'.repeat(42));

                const cmds = Object.entries(globalStats.commands)
                  .map(([cmd, count]: [string, any]) => ({ cmd, count }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10);

                cmds.forEach((item, index) => {
                  const percent = ((item.count / totalCommands) * 100).toFixed(1);
                  statsLines.push(
                    `${(index + 1).toString().padEnd(6)}` +
                    `${item.cmd.padEnd(16)}` +
                    `${item.count.toString().padStart(8)}` +
                    `${percent.padStart(9)}%`
                  );
                });
                statsLines.push('');
              }
            } else {
              statsLines.push('No global stats available yet.');
              statsLines.push('Make sure Firebase is configured in .env.local');
              statsLines.push('');
            }

            if (repos && repos.length > 0) {
              statsLines.push('GITHUB PORTFOLIO');
              statsLines.push('Repository'.padEnd(35) + 'Stars'.padStart(8) + 'Forks'.padStart(8));
              statsLines.push('─'.repeat(51));

              const topRepos = repos.slice(0, 10);
              let totalStars = 0;

              topRepos.forEach((repo: PortfolioRepo) => {
                totalStars += repo.stars;
                statsLines.push(
                  repo.name.padEnd(35) +
                  repo.stars.toString().padStart(8) +
                  repo.forks.toString().padStart(8)
                );
              });

              statsLines.push('─'.repeat(51));
              statsLines.push(
                'Total'.padEnd(35) +
                totalStars.toString().padStart(8) +
                repos.reduce((sum: number, r: PortfolioRepo) => sum + r.forks, 0).toString().padStart(8)
              );
              statsLines.push(`Repositories: ${repos.length}`);
              statsLines.push('');
            }

            statsLines.push('═'.repeat(70));
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
