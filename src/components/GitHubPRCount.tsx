import { useEffect, useState } from 'react';
import { baseUrl } from '../lib/utils';

interface GitHubPRCountProps {
  initialCount: number | null;
}

export default function GitHubPRCount({ initialCount }: GitHubPRCountProps) {
  const [prCount, setPrCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'static' | 'live'>('static');

  useEffect(() => {
    // Step 1: Initialize from Astro endpoint
    const initializeFromEndpoint = async () => {
      try {
        console.log('[Build Data] 🔄 Initializing PR count from static JSON file...');
        const response = await fetch(baseUrl('build-data-pr.json'));
        if (response.ok) {
          const data = await response.json();
          if (data.count !== null && data.count !== undefined) {
            setPrCount(data.count);
            setDataSource('static');
            setIsLoading(false);
            console.log(`[Build Data] ✓ Initialized from static JSON: ${data.count} open PRs`);
            return true;
          }
        }
      } catch (error) {
        console.error('[Build Data] ✗ Failed to initialize from static JSON:', error);
      }
      return false;
    };

    // Step 2: Try to update with direct GitHub API call
    const updateFromGitHub = async () => {
      setIsLoading(true);
      console.log('[GitHub API] 🔄 Attempting to update PR count from GitHub API...');
      
      try {
        const response = await fetch(
          'https://api.github.com/search/issues?q=repo:ipython/ipython+type:pr+state:open'
        );
        
        if (response.ok) {
          const data = await response.json();
          const count = data.total_count || 0;
          setPrCount(count);
          setDataSource('live');
          console.log(`[GitHub API] ✓ Updated from GitHub: ${count} open PRs`);
        } else {
          console.error(`[GitHub API] ✗ Could not reach GitHub API: ${response.status} ${response.statusText}`);
          // Keep dataSource as 'static' since update failed
          setDataSource('static');
        }
      } catch (error) {
        console.error('[GitHub API] ✗ Could not reach GitHub API:', error);
        // Keep dataSource as 'static' since update failed
        setDataSource('static');
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize from endpoint, then try to update from GitHub
    initializeFromEndpoint().then(() => {
      // Try to update after a short delay
      setTimeout(updateFromGitHub, 100);
    });
  }, []);

  if (prCount === null) {
    return null;
  }

  return (
    <div className="gradient-stats-cyan-blue rounded-lg p-6 border border-theme-secondary/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Open Pull Requests
            {dataSource === 'static' && (
              <span className="ml-2 text-xs opacity-75">(static)</span>
            )}
            {dataSource === 'live' && (
              <span className="ml-2 text-xs opacity-75">(live)</span>
            )}
            {isLoading && (
              <span className="ml-2 text-xs opacity-75">(updating...)</span>
            )}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{prCount}</p>
        </div>
        <a
          href="https://github.com/ipython/ipython/pulls"
          target="_blank"
          rel="noopener noreferrer"
          className="text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"></path>
          </svg>
        </a>
      </div>
    </div>
  );
}
