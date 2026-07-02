import type { NextConfig } from "next";

/**
 * Hugging Face Spaces' edge proxy intercepts CORS preflight (OPTIONS)
 * requests and answers them itself, stripping the
 * `Access-Control-Allow-Credentials: true` header our app needs. That
 * makes the browser reject every credentialed request.
 *
 * Workaround: proxy `/api/*` through this Next.js app's own origin so the
 * browser never makes a cross-origin request in the first place. No CORS,
 * no preflight, no HF edge involvement.
 *
 * Set `NEXT_PUBLIC_API_BASE_URL=/api/v1` in Vercel and
 * `HF_BACKEND_ORIGIN=https://pranav190705-gtrack-backend.hf.space` there too.
 */
const HF_BACKEND_ORIGIN =
  process.env.HF_BACKEND_ORIGIN ??
  "https://pranav190705-gtrack-backend.hf.space";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${HF_BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
