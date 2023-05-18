const { BACKEND_URL, PUBLIC_HOST, SITE_KEY } = process.env

module.exports = async (phase, { defaultConfig }) => {
  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    poweredByHeader: false,
    images: {
      unoptimized: true,
    },
    serverRuntimeConfig: {
      apiUrl: BACKEND_URL,
    },
    publicRuntimeConfig: {
      publicHost: PUBLIC_HOST,
      apiAuth: '/app/api/login',
    },
    experimental: {
      forceSwcTransforms: true,
    },
    async rewrites() {
      return [
        {
          source: "/app/api/:path*",
          destination: `${BACKEND_URL}/app/api/:path*`,
        },
      ];
    },
    async redirects() {
      return [
        {
          "source": "/",
          "destination": "/bejelentkezes",
          "permanent": false
        }
      ]
    },
  }

  return nextConfig
}
