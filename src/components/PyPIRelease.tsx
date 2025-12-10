import { useEffect, useState } from "react";
import { baseUrl } from "../lib/utils";

interface PyPIReleaseProps {
  initialVersion: string | null;
  initialReleaseDate: string | null;
}

export default function PyPIRelease({
  initialVersion,
  initialReleaseDate,
}: PyPIReleaseProps) {
  const [version, setVersion] = useState<string | null>(null);
  const [releaseDate, setReleaseDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"static" | "live">("static");

  useEffect(() => {
    // Step 1: Initialize from static JSON file
    const initializeFromJSON = async () => {
      try {
        console.log(
          "[Build Data] 🔄 Initializing PyPI data from static JSON file..."
        );
        const response = await fetch(baseUrl("build-data-pypi.json"));
        if (response.ok) {
          const data = await response.json();
          if (data.version) {
            setVersion(data.version);
            setReleaseDate(data.releaseDate);
            setDataSource("static");
            setIsLoading(false);
            console.log(
              `[Build Data] ✓ Initialized from static JSON: v${data.version} (${
                data.releaseDate || "date unknown"
              })`
            );
            return true;
          }
        }
      } catch (error) {
        console.error(
          "[Build Data] ✗ Failed to initialize from static JSON:",
          error
        );
      }
      setIsLoading(false);
      return false;
    };

    // Step 2: Try to update with direct PyPI API call
    const updateFromPyPI = async () => {
      setIsLoading(true);
      console.log(
        "[PyPI API] 🔄 Attempting to update PyPI data from PyPI API..."
      );

      try {
        const response = await fetch("https://pypi.org/pypi/ipython/json");

        if (response.ok) {
          const data = await response.json();
          const newVersion = data.info.version;
          const releases = data.releases[newVersion];
          let newReleaseDate: string | null = null;

          if (releases && releases.length > 0) {
            const latestRelease = releases[releases.length - 1];
            if (latestRelease.upload_time) {
              const date = new Date(latestRelease.upload_time);
              newReleaseDate = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            }
          }

          setVersion(newVersion);
          setReleaseDate(newReleaseDate);
          setDataSource("live");
          console.log(
            `[PyPI API] ✓ Updated from PyPI: v${newVersion} (${
              newReleaseDate || "date unknown"
            })`
          );
        } else {
          console.error(
            `[PyPI API] ✗ Could not reach PyPI API: ${response.status} ${response.statusText}`
          );
          // Don't change dataSource - keep it as 'static' since update failed
        }
      } catch (error) {
        console.error("[PyPI API] ✗ Could not reach PyPI API:", error);
        // Don't change dataSource - keep it as 'static' since update failed
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize from JSON, then try to update from PyPI
    initializeFromJSON().then((initialized) => {
      if (initialized) {
        // Only try to update if we successfully initialized
        setTimeout(updateFromPyPI, 100);
      }
    });
  }, []);

  if (!version) {
    return null;
  }

  return (
    <div className="gradient-stats-green-cyan rounded-lg p-6 border border-theme-accent/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Latest Release
            {dataSource === "static" && (
              <span className="ml-2 text-xs opacity-75">(static)</span>
            )}
            {dataSource === "live" && (
              <span className="ml-2 text-xs opacity-75">(live)</span>
            )}
            {isLoading && (
              <span className="ml-2 text-xs opacity-75">(updating...)</span>
            )}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            v{version}
          </p>
          {releaseDate && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Released {releaseDate}
            </p>
          )}
        </div>
        <a
          href="https://pypi.org/project/ipython/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-theme-secondary hover:text-theme-primary transition-colors"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            ></path>
          </svg>
        </a>
      </div>
    </div>
  );
}
