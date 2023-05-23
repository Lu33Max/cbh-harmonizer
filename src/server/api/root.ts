import { createTRPCRouter } from "~/server/api/trpc";
import { sampleRouter } from "./routers/samples";
import { addDataController } from "./routers/addDataController";
//import { saveMappingPresets } from "./routers/saveMappingPresetsController";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  samples: sampleRouter,
  dataController: addDataController,
  //saveMappingPresetsController: saveMappingPresets,
});


// export type definition of API
export type AppRouter = typeof appRouter;
