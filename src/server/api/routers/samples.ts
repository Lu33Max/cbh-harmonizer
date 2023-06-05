import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { SampleSchema } from "~/common/database/samples";

export const sampleRouter = createTRPCRouter({

    getMany: publicProcedure
        .input(z.object({ lines: z.number().optional(), pages: z.number().optional()}))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.samples.findMany({
                take: input.lines,
                skip: (input.pages && input.lines) ? (input.pages - 1) * input.lines : 0,
            })
        }),

    getAll: publicProcedure
        .query(async ({ ctx }) => {
            return ctx.prisma.samples.findMany()
        }),

    countNormal: publicProcedure
        .query(async ({ ctx }) => {
            const result = await ctx.prisma.samples.findMany({
                distinct: ['CBH_Sample_ID'],
                orderBy: {
                    CBH_Sample_ID: 'desc',
                },
                select: {
                    CBH_Sample_ID: true
                }
            });
            
            return result.length
        }),

    create: publicProcedure
        .input(SampleSchema)
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.samples.create({ data: input })
        }),

    createMany: publicProcedure
        .input(SampleSchema.array())
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.samples.createMany({ data: input })
        }),

    updateMany: publicProcedure
        .input(SampleSchema.array())
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.samples.updateMany({
                where: {
                    id: {
                        in: input.map(sample => sample.id)
                    }
                },
                data: input
            })
        }),

    update: publicProcedure
        .input(SampleSchema)
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.samples.update({
                where: {
                    id: input.id
                },
                data: input
            })
        }),

    delete: publicProcedure
        .input( z.string() )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.samples.delete({
                where: {
                    id: input
                }
            })
        }),

    deleteMany: publicProcedure
        .input( z.string().array() )
        .mutation(async ({ ctx, input }) => {
            return await ctx.prisma.samples.deleteMany({
                where: {
                    id: {
                        in: input
                    }
                }
            })
        }),

    sortDonor: publicProcedure
    .query(async ({ ctx }) => {
        return ctx.prisma.samples.findFirst({
            orderBy: {
                CBH_Donor_ID: "desc",
            }
        });
    }),
   
    sortMaster: publicProcedure
    .query(async ({ ctx }) => {
        return ctx.prisma.samples.findFirst({
            orderBy: {
                CBH_Master_ID: "desc",
            }
        });
    }),
   
    sortSample: publicProcedure
    .query(async ({ ctx }) => {
        return ctx.prisma.samples.findFirst({
            orderBy: {
                CBH_Sample_ID: "desc",
            }
        });
    })
})