import { createTRPCRouter } from "~/server/api/trpc";
import { sampleRouter } from "./routers/samples";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  samples: sampleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
