import { createCivicAuthPlugin } from "@civic/auth/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.airspace.com']
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "4719a741-04a7-4c8c-a477-30360e66e12e"
});

export default withCivicAuth(nextConfig);
