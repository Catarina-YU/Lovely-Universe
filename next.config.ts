import type { NextConfig } from "next";

/** `npm run app:build` define APP_BUILD=1: gera um site estatico em `out/` para o app de desktop. */
const isAppBuild = process.env.APP_BUILD === "1";

const nextConfig: NextConfig = {
  // PPR/cache components nao funcionam em exportacao estatica
  ...(isAppBuild ? {} : { cacheComponents: true, partialPrefetching: true }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  ...(isAppBuild ? { output: "export" as const, distDir: ".next-app" } : {}),
};

export default nextConfig;
