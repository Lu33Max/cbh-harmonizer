import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { SampleSchema } from "~/common/database/samples";

export const sampleRouter = createTRPCRouter({

    getMany: publicProcedure
        .input(z.object({ lines: z.number().optional(), pages: z.number().optional()}))
        .query(async ({ ctx, input }) => {
            // Retrieve unique sample IDs
            const uniqueSampleIDs = await ctx.prisma.samples.findMany({
                distinct: ['CBH_Sample_ID'],
                take: input.lines,
                skip: (input.pages && input.lines) ? (input.pages - 1) * input.lines : 0,
                orderBy: {
                    CBH_Sample_ID: 'desc',
                },
                select: {
                    CBH_Sample_ID: true
                },
            })

            // Convert unique sample IDs to strings
            const uniqueSampleIDStrings : string[] = uniqueSampleIDs.map(item => item.CBH_Sample_ID?.toString() ?? "") ?? [];

            // Retrieve samples with matching unique sample IDs
            return await ctx.prisma.samples.findMany({
                where: {
                    CBH_Sample_ID: {
                        in: uniqueSampleIDStrings,
                    }
                },
                orderBy: {
                    CBH_Sample_ID: 'desc',
                },
            })
        }),

    getAll: publicProcedure
        .query(async ({ ctx }) => {
            // Retrieve all samples
            return ctx.prisma.samples.findMany()
        }),

    countNormal: publicProcedure
        .query(async ({ ctx }) => {
            // Retrieve distinct CBH_Sample_ID
            const result = await ctx.prisma.samples.findMany({
                distinct: ['CBH_Sample_ID'],
                orderBy: {
                    CBH_Sample_ID: 'desc',
                },
                select: {
                    CBH_Sample_ID: true
                }
            });
            
            // Return the count of distinct CBH_Sample_ID
            return result.length
        }),

    create: publicProcedure
        .input(SampleSchema)
        .mutation(async ({ ctx, input }) => {
            // Create a single sample using the input data
            return await ctx.prisma.samples.create({ data: input })
        }),

    createMany: publicProcedure
        .input(SampleSchema.array())
        .mutation(async ({ ctx, input }) => {
            // Create multiple samples using an array of input data
            return await ctx.prisma.samples.createMany({ data: input })
        }),

    updateMany: publicProcedure
        .input(SampleSchema.array())
        .mutation(async ({ ctx, input }) => {
            // Update multiple samples based on their IDs
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
            // Update a single sample based on its ID
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
            // Delete a single sample based on its ID
            return await ctx.prisma.samples.delete({
                where: {
                    id: input
                }
            })
        }),

    deleteMany: publicProcedure
        .input( z.string().array() )
        .mutation(async ({ ctx, input }) => {
            // Delete multiple samples based on their IDs
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
            // Retrieve the sample with the highest CBH_Donor_ID
            return ctx.prisma.samples.findFirst({
                orderBy: {
                    CBH_Donor_ID: "desc",
                }
            });
        }),
   
    sortMaster: publicProcedure
        .query(async ({ ctx }) => {
            // Retrieve the sample with the highest CBH_Master_ID
            return ctx.prisma.samples.findFirst({
                orderBy: {
                    CBH_Master_ID: "desc",
                }
            });
        }),
   
    sortSample: publicProcedure
        .query(async ({ ctx }) => {
            // Retrieve the sample with the highest CBH_Sample_ID
            return ctx.prisma.samples.findFirst({
                orderBy: {
                    CBH_Sample_ID: "desc",
                }
            });
        })
})