import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	experimental: {
		reactCompiler: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "http",
				hostname: "127.0.0.1",
				pathname: "/getImage",
			},
			{
				protocol: "https",
				hostname: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!.split("//")[1],
				pathname: "/getImage",
			},
			{
				protocol: "https",
				hostname: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!.split("//")[1],
				pathname: "/user/update",
			},
			{
				protocol: "http",
				hostname: "127.0.0.1",
				pathname: "/user/update",
			}
		],
	}
};

export default nextConfig;
