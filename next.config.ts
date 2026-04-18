import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:5000/api/:path*" // Local Python server
            : "/api/", // Vercel Serverless Python
      },
    ];
  },
};

export default nextConfig;