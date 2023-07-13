import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const mappingsRouter = createTRPCRouter({
    
    getAll: protectedProcedure
        .query(async({ ctx }) => {
            // Retrieve all mappings associated with the current user
            return await ctx.prisma.mapping.findMany({
                where: {
                    userId: ctx.session.user.id
                }
            })
        }),

    create: protectedProcedure
        .input(z.object({ name: z.string(), mapping: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Create a new mapping associated with the current user
            return await ctx.prisma.mapping.create({
                data: {
                    name: input.name,
                    mapping: input.mapping,
                    userId: ctx.session.user.id,
                }
            })
        }),
})