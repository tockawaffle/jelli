import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
	reactStrictMode: true,
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

const withNextIntl = createNextIntlPlugin(
	"./src/lib/localization/request.ts"
);

export default withNextIntl(nextConfig);
