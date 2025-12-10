import { useEffect, useState } from 'react';
import { baseUrl } from '../lib/utils';

type Contributor = {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  name?: string;
};

type Maintainer = {
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string;
  bio?: string;
  contributions?: number;
};

interface GitHubContributorsProps {
  initialContributors: Contributor[];
  initialMaintainer: Maintainer | null;
}

export default function GitHubContributors({
  initialContributors,
  initialMaintainer,
}: GitHubContributorsProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [maintainer, setMaintainer] = useState<Maintainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contributorsError, setContributorsError] = useState(false);
  const [maintainerError, setMaintainerError] = useState(false);
  // Data source is always 'static' since we don't fetch from client-side
  const [dataSource] = useState<'static' | 'live'>('static');

  useEffect(() => {
    // Step 1: Initialize from static JSON file
    const initializeFromJSON = async () => {
      try {
        console.log('[Build Data] 🔄 Initializing contributors/maintainer from static JSON file...');
        const response = await fetch(baseUrl('build-data-contributors.json'));
        if (response.ok) {
          const data = await response.json();
          let loaded = false;
          if (data.contributors && Array.isArray(data.contributors) && data.contributors.length > 0) {
            setContributors(data.contributors);
            setContributorsError(false);
            loaded = true;
          }
          if (data.maintainer) {
            setMaintainer(data.maintainer);
            setMaintainerError(false);
            loaded = true;
          }
          if (loaded) {
            setDataSource('static');
            setIsLoading(false);
            console.log(
              `[Build Data] ✓ Initialized from static JSON: ${data.contributors?.length || 0} contributors, maintainer: ${data.maintainer ? 'Yes' : 'No'}`
            );
            return true;
          }
        }
      } catch (error) {
        console.error('[Build Data] ✗ Failed to initialize from static JSON:', error);
      }
      setIsLoading(false);
      return false;
    };

    // No client-side fetching - GitHub API has CORS restrictions
    // Data is only loaded from static JSON files generated at build time
    initializeFromJSON();
  }, []);

  return (
    <>
      {/* Current Maintainer */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Current Maintainer
          {isLoading && (
            <span className="ml-2 text-sm font-normal opacity-75">(loading...)</span>
          )}
        </h2>
        {maintainerError && !maintainer ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300">
              Unable to load maintainer information at this time. This may be due to GitHub API
              rate limits. Please visit{' '}
              <a
                href="https://github.com/Carreau"
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-secondary hover:text-theme-secondary/80 transition-colors underline"
              >
                @Carreau's GitHub profile
              </a>{' '}
              directly.
            </p>
          </div>
        ) : maintainer ? (
          <div className="gradient-stats-cyan-blue border-2 border-theme-secondary rounded-lg p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <a
                href={maintainer.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 group"
              >
                <img
                  src={maintainer.avatar_url}
                  alt={`${maintainer.name}'s avatar`}
                  className="w-24 h-24 rounded-full border-4 border-theme-secondary group-hover:scale-110 transition-transform"
                />
              </a>
              <div className="flex-1 text-center sm:text-left">
                <a
                  href={maintainer.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 hover:text-theme-secondary transition-colors">
                    {maintainer.name}
                  </h3>
                  <p className="text-theme-secondary mb-3">@{maintainer.login}</p>
                </a>
                {maintainer.contributions !== undefined && (
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {maintainer.contributions}{' '}
                    {maintainer.contributions === 1 ? 'contribution' : 'contributions'}
                  </p>
                )}
                {maintainer.bio && (
                  <p className="text-gray-600 dark:text-gray-400">{maintainer.bio}</p>
                )}
              </div>
            </div>
          </div>
          ) : !maintainer ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300">
                Unable to load maintainer information at this time. Please visit{' '}
                <a
                  href="https://github.com/Carreau"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-theme-secondary hover:text-theme-secondary/80 transition-colors underline"
                >
                  @Carreau's GitHub profile
                </a>{' '}
                directly.
              </p>
            </div>
          ) : null}
      </div>

      {/* Developers */}
      <div>
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Developers & Contributors
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          IPython is built and maintained by a vibrant community of developers and contributors
          from around the world. Here are some of the key contributors to the project:
        </p>
        {contributorsError && contributors.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Unable to load contributors at this time. This may be due to GitHub API rate limits.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Please visit our{' '}
              <a
                href="https://github.com/ipython/ipython/graphs/contributors"
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-secondary hover:text-theme-secondary/80 transition-colors underline"
              >
                GitHub contributors page
              </a>{' '}
              to see all contributors.
            </p>
          </div>
        ) : contributors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {contributors
              .filter((c) => c.login !== 'Carreau')
              .map((contributor) => (
                <a
                  key={contributor.login}
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-ipython-slate hover:border-theme-secondary hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-theme-secondary/20 transition-all group"
                >
                  <img
                    src={contributor.avatar_url}
                    alt={`${contributor.name || contributor.login}'s avatar`}
                    className="w-16 h-16 rounded-full mb-2 group-hover:scale-110 transition-transform"
                    loading="lazy"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-center truncate w-full">
                    {contributor.name || contributor.login}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center truncate w-full">
                    @{contributor.login}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {contributor.contributions}{' '}
                    {contributor.contributions === 1 ? 'contribution' : 'contributions'}
                  </span>
                </a>
              ))}
          </div>
        ) : contributors.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Unable to load contributors at this time.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Please visit our{' '}
              <a
                href="https://github.com/ipython/ipython/graphs/contributors"
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-secondary hover:text-theme-secondary/80 transition-colors underline"
              >
                GitHub contributors page
              </a>{' '}
              to see all contributors.
            </p>
          </div>
        ) : null}
        <p className="text-gray-600 dark:text-gray-400 mt-6">
          Want to contribute? Check out our{' '}
          <a
            href="https://github.com/ipython/ipython"
            className="text-theme-secondary hover:text-theme-secondary/80 transition-colors"
          >
            GitHub repository
          </a>{' '}
          to get started!
        </p>
      </div>

    </>
  );
}
