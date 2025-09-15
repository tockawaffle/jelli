import { httpRouter } from "convex/server";
import { createAuth } from '../src/lib/auth';
import { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";
import { authComponent } from './auth';

const http = httpRouter()

authComponent.registerRoutes(http, createAuth)

http.route({
	path: "/getImage",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		const { searchParams } = new URL(request.url);
		const storageId = searchParams.get("storageId") as Id<"_storage">;

		if (!storageId) {
			return new Response("No storage ID provided", {
				status: 400,
			});
		}

		const blob = await ctx.storage.get(storageId);
		if (blob === null) {
			return new Response("Image not found", {
				status: 404,
			});
		}
		return new Response(blob);
	}),
});

export default http