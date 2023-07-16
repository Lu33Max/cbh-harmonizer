import { createTRPCRouter } from "~/server/api/trpc";

// Import routers
import { sampleRouter } from "./routers/samples";
import { authRouter } from "./routers/user";
import { sampleIDMappingRouter, donorIDMappingRouter, masterIDMappingRouter } from "./routers/idmapping";
import { mappingsRouter } from "./routers/mappings";

// Create the main app route and all sub-routers
export const appRouter = createTRPCRouter({
  samples: sampleRouter,
  mappings: mappingsRouter,
  auth: authRouter,
  sampleidmapping: sampleIDMappingRouter,
  donoridmapping: donorIDMappingRouter,
  masteridmapping: masterIDMappingRouter,
});

// Type definition for the AppRouter
export type AppRouter = typeof appRouter;
