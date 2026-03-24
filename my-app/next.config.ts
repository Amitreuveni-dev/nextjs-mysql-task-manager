import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["mariadb", "@prisma/adapter-mariadb", "@prisma/client"],
};

export default nextConfig;
