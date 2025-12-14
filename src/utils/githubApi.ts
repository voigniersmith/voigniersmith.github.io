/**
 * GitHub API utility for fetching repository statistics
 * Uses the public GitHub API (no authentication required for public repos)
 */

export interface GitHubRepoStats {
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  lastUpdate: string;
  url: string;
  language: string;
}

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'voigniersmith';
const REPO_NAME = 'voigniersmith.github.io';

/**
 * Fetch GitHub repository statistics
 * Returns cached stats to avoid rate limiting
 */
export async function fetchGitHubStats(): Promise<GitHubRepoStats | null> {
  try {
    // Check if we have cached stats (cache for 1 hour)
    const cached = localStorage.getItem('github_stats_cache');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      if (timestamp > oneHourAgo) {
        return data;
      }
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}`
    );

    if (!response.ok) {
      console.warn('Failed to fetch GitHub stats:', response.status);
      return null;
    }

    const data = await response.json();

    const stats: GitHubRepoStats = {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      openIssues: data.open_issues_count || 0,
      watchers: data.watchers_count || 0,
      lastUpdate: data.updated_at || '',
      url: data.html_url || '',
      language: data.language || 'Unknown',
    };

    // Cache the stats
    localStorage.setItem(
      'github_stats_cache',
      JSON.stringify({ data: stats, timestamp: Date.now() })
    );

    return stats;
  } catch (error) {
    console.warn('Error fetching GitHub stats:', error);
    return null;
  }
}

/**
 * Fetch all user repositories with stars and forks
 */
export interface PortfolioRepo {
  name: string;
  stars: number;
  forks: number;
}

export async function fetchUserPortfolioRepos(): Promise<PortfolioRepo[]> {
  try {
    // Check cache first (cache for 2 hours)
    const cached = localStorage.getItem('portfolio_repos_cache');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      if (timestamp > twoHoursAgo) {
        return data;
      }
    }

    const response = await fetch(
      `${GITHUB_API_BASE}/users/${REPO_OWNER}/repos?sort=stars&per_page=100`
    );

    if (!response.ok) {
      console.warn('Failed to fetch portfolio repos:', response.status);
      return [];
    }

    const data = await response.json();
    const repos: PortfolioRepo[] = data.map((repo: any) => ({
      name: repo.name,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
    }));

    // Cache the results
    localStorage.setItem(
      'portfolio_repos_cache',
      JSON.stringify({ data: repos, timestamp: Date.now() })
    );

    return repos;
  } catch (error) {
    console.warn('Error fetching portfolio repos:', error);
    return [];
  }
}

/**
 * Format date string to readable format
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    }
  } catch {
    return dateString;
  }
}
