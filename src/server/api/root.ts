import { createTRPCRouter } from "~/server/api/trpc";
import { sampleRouter } from "./routers/samples";
import { authRouter } from "./routers/user";

export const appRouter = createTRPCRouter({
  samples: sampleRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
