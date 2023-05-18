const { BACKEND_URL, PUBLIC_HOST, MATOMO_URL, MATOMO_SITE_ID, SITE_KEY } = process.env

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
      apiNavigation: '/app/api/question/navigation',
    },
    publicRuntimeConfig: {
      publicHost: PUBLIC_HOST,
      siteKey: SITE_KEY,
      apiAuth: '/app/api/account/check',
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
          "destination": "/azonositas",
          "permanent": false
        }
      ]
    },
  }

  return nextConfig
}
