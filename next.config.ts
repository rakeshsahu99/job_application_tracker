import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  outputFileTracingIncludes: {
    "/api/resumes/upload": [
      "./node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs",
    ],
  },
};

export default nextConfig;
