import { createTRPCRouter } from "~/server/api/trpc";
import { sampleRouter } from "./routers/samples";
import { authRouter } from "./routers/user";
import { sampleIDMappingRouter, donorIDMappingRouter, masterIDMappingRouter } from "./routers/idmapping";
import { mappingsRouter } from "./routers/mappings";

export const appRouter = createTRPCRouter({
  samples: sampleRouter,
  mappings: mappingsRouter,
  auth: authRouter,
  sampleidmapping: sampleIDMappingRouter,
  donoridmapping: donorIDMappingRouter,
  masteridmapping: masterIDMappingRouter,
});

export type AppRouter = typeof appRouter;
