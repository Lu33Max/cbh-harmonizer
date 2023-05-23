/*import { PrismaClient } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from 'zod';

const prisma = new PrismaClient();

export const sampleIDMapping = createTRPCRouter ({
    .query('sampleIDMapping.getAll', {
        resolve(){
            return prisma.sampleIDMapping.findMany();
        },
    })

    .mutation('sampleIDMapping.create', {
        input: z.object({
            Input_Sample_ID: z.string(),
            Mapped_Sample_ID: z.string(),
        })
    })
})

export const donorIDMapping = createTRPCRouter ({
    .query('donorIDMapping.getAll', {
        resolve(){
            return prisma.donorIDMapping.findMany();
        },
    })

    .mutation('donorIDMapping.create', {
        input: z.object({
            Input_Sample_ID: z.string(),
            Mapped_Sample_ID: z.string(),
        })
    })
})

export const masterIDMapping = createTRPCRouter ({
    .query('masterIDMapping.getAll', {
        resolve(){
            return prisma.masterIDMapping.findMany();
        },
    })

    .mutation('masterIDMapping.create', {
        input: z.object({
            Input_Sample_ID: z.string(),
            Mapped_Sample_ID: z.string(),
        })
    })
})*/