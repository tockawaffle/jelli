import { httpRouter } from "convex/server";
import { createAuth } from '../src/lib/auth';
import { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";
import { betterAuthComponent } from './auth';

const http = httpRouter()

betterAuthComponent.registerRoutes(http, createAuth)

http.route({
	path: "/getImage",
	method: "GET",
	handler: httpAction(async (ctx, request) => {
		const { searchParams } = new URL(request.url);
		const storageId = searchParams.get("storageId")! as Id<"_storage">;
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