import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";

const isUserPage = repositoryName?.endsWith(".github.io") ?? false;

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  basePath:
    isGitHubActions && repositoryName && !isUserPage
      ? `/${repositoryName}`
      : undefined,

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
