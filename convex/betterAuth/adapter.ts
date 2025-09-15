import { createApi } from "@convex-dev/better-auth";
import { createAuth } from "../../src/lib/auth";
import schema from "./schema";

export const {
	create,
	findOne,
	findMany,
	updateOne,
	updateMany,
	deleteOne,
	deleteMany,
} = createApi(schema, createAuth);