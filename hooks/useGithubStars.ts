"use client";

import { useEffect, useState } from "react";

interface GithubData {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  loading: boolean;
}

const CACHE_KEY = "bc_github_data";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export function useGithubStars(): GithubData {
  const [data, setData] = useState<GithubData>({
    stars: 0,
    forks: 0,
    watchers: 0,
    openIssues: 0,
    loading: true,
  });

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          setData({ ...parsed.data, loading: false });
          return;
        }
      } catch {
        // ignore parse errors
      }
    }

    fetch("https://api.github.com/repos/aakash-1702/basecase")
      .then((res) => res.json())
      .then((json) => {
        const result = {
          stars: json.stargazers_count ?? 0,
          forks: json.forks_count ?? 0,
          watchers: json.subscribers_count ?? 0,
          openIssues: json.open_issues_count ?? 0,
        };
        setData({ ...result, loading: false });
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: result, timestamp: Date.now() })
        );
      })
      .catch(() => {
        setData((prev) => ({ ...prev, loading: false }));
      });
  }, []);

  return data;
}
