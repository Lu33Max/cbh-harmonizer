import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from 'zod';

export const sampleIDMappingRouter = createTRPCRouter ({
    getAll: publicProcedure
    .query(async ({ ctx }) => {
        // Retrieve al sample ID mappings
        return ctx.prisma.sampleIDMapping.findMany();
    }),
    
    create: publicProcedure
    .input( z.object({
        Input_Sample_ID: z.string(),
        Mapped_Sample_ID: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
        // Create a new sample ID mapping
        return await ctx.prisma.sampleIDMapping.create({
            data: {
                Input_Sample_ID: input.Input_Sample_ID,
                Mapped_Sample_ID: input.Mapped_Sample_ID,
            }
        })
    }),

})

    
export const donorIDMappingRouter = createTRPCRouter ({
    getAll: publicProcedure
    .query(async ({ ctx }) => {
        // Retrieve all donor ID mappings
        return ctx.prisma.donorIDMapping.findMany();
    }),
    
    create: publicProcedure
    .input( z.object({
        Input_Donor_ID: z.string(),
        Mapped_Donor_ID: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
        // Create a new donor ID mapping
        return await ctx.prisma.donorIDMapping.create({
            data: {
                Input_Donor_ID: input.Input_Donor_ID,
                Mapped_Donor_ID: input.Mapped_Donor_ID,
            }
        })
    })
})

    
export const masterIDMappingRouter = createTRPCRouter ({
    getAll: publicProcedure
    .query(async ({ ctx }) => {
        // Retrieve all master ID mappings
        return ctx.prisma.masterIDMapping.findMany();
    }),
    
    create: publicProcedure
    .input( z.object({
        Input_Master_ID: z.string(),
        Mapped_Master_ID: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
        // Create a new master ID mapping
        return await ctx.prisma.masterIDMapping.create({
            data: {
                Input_Master_ID: input.Input_Master_ID,
                Mapped_Master_ID: input.Mapped_Master_ID,
            }
        })
    })
})