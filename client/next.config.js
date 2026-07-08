import "./src/env.js";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/generate",
        destination: `${BACKEND}/api/generate`,
      },
      {
        source: "/api/voices",
        destination: `${BACKEND}/api/voices`,
      },
      {
        source: "/api/generate-voice",
        destination: `${BACKEND}/api/generate-voice`,
      },
      {
        source: "/api/history",
        destination: `${BACKEND}/api/history`,
      },
      {
        source: "/api/history/:path*",
        destination: `${BACKEND}/api/history/:path*`,
      },
      {
        source: "/api/audio/:path*",
        destination: `${BACKEND}/api/audio/:path*`,
      },
    ];
  },
};

export default config;
