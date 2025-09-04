import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4100/api/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "clipboard-read=*, clipboard-write=*",
          },
        ],
      },
    ];
  },
};

// Ensure single Yjs instance during development (avoid duplicate copies from HMR)
// This forces webpack to resolve 'yjs' to the top-level node_modules path.
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - mutate for dev only
  nextConfig.webpack = (config: any) => {
    if (config && config.resolve && config.resolve.alias) {
      config.resolve.alias['yjs'] = require.resolve('yjs');
    } else if (config && config.resolve) {
      config.resolve = { ...(config.resolve || {}), alias: { yjs: require.resolve('yjs') } };
    }
    return config;
  };
}

export default nextConfig;
