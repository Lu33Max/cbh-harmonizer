import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const mappingsRouter = createTRPCRouter({
    
    getAll: protectedProcedure
        .query(async({ ctx }) => {
            return await ctx.prisma.mapping.findMany({
                where: {
                    userId: ctx.session.user.id
                }
            })
        }),

    create: protectedProcedure
        .input(z.object({ name: z.string(), mapping: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.mapping.create({
                data: {
                    name: input.name,
                    mapping: input.mapping,
                    userId: ctx.session.user.id,
                }
            })
        }),
})