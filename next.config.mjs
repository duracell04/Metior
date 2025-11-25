const offline = process.env.MEO_OFFLINE === "1" || Boolean(process.env.MEO_FREEZE_DATE);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: offline ? "build" : ".next",
  webpack: config => {
    if (offline) {
      // Avoid writing heavy webpack caches when running the offline demo
      config.cache = false;
    }
    return config;
  },
  telemetry: false,
};

export default nextConfig;
