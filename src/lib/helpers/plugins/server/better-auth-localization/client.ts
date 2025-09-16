import type { BetterAuthClientPlugin } from "better-auth";
import type { localization } from "./index";

type BetterAuthLocalizationPlugin = typeof localization;

export const betterAuthLocalizationClientPlugin = () => {
	return {
		id: "localization",
		$InferServerPlugin: {} as ReturnType<BetterAuthLocalizationPlugin>,
	} satisfies BetterAuthClientPlugin;
};
