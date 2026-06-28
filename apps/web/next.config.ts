import type { NextConfig } from "next";

function apiUploadImagePatterns() {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "http", hostname: "localhost", port: "3001", pathname: "/uploads/**" },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return patterns;

  try {
    const url = new URL(apiUrl);
    const protocol = url.protocol.replace(":", "") as "http" | "https";
    patterns.push({
      protocol,
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/uploads/**",
    });
  } catch {
    // ignore invalid URL at build time
  }

  return patterns;
}

const nextConfig: NextConfig = {
  transpilePackages: ["@real-estate/shared"],
  images: {
    remotePatterns: apiUploadImagePatterns(),
  },
};

export default nextConfig;
