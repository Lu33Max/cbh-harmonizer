import { createTRPCRouter } from "~/server/api/trpc";
import { sampleRouter } from "./routers/samples";
import { main } from "./controllers/addDataController";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  samples: sampleRouter,
  main: sampleRouter,
});

/*appRouter.query("main" ,{
  async resolve() {
    return main();
  }
})*/
// export type definition of API
export type AppRouter = typeof appRouter;
