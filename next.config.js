const { BACKEND_URL, PUBLIC_HOST } = process.env

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
      apiAuth: '/admin/api/login',
      apiAccountSearch: '/admin/api/account/search',
      apiSendAuthCode: '/admin/api/account/send',
      apiPrintAuthCode: '/admin/api/account/print',
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
        {
          source: "/admin/api/:path*",
          destination: `${BACKEND_URL}/admin/api/:path*`,
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
