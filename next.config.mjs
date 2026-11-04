/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "shiva-sai.vercel.app" }],
        destination: "https://shivasai.is-a.dev/:path*",
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
