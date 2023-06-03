import { PrismaClient } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from 'zod';

const prisma = new PrismaClient();

export const saveMappingPresets = createTRPCRouter({
    getAll: publicProcedure
    .query(async ({ ctx }) => {
        return ctx.prisma.savedPresets.findMany()
    }),

    getByID: publicProcedure
    .input(z.object({
        id: z.string()
    }))
    .query(async ({ ctx, input }) => {
        return ctx.prisma.savedPresets.findUnique({
            where: {
                id: input.id
            }
        })
    }),

    create: publicProcedure
    .input( z.object({
        id: z.string(),
        Preset_Name: z.string(),
        CBH_Donor_ID: z.number().optional(),
        CBH_Master_ID: z.number().optional(),
        CBH_Sample_ID: z.number().optional(),
        Price: z.number().optional(),
        Quantaty: z.number().optional(),
        Unit: z.number().optional(),
        Matrix: z.number().optional(),
        Storage_Temperatures: z.number().optional(),
        Freeze_Thaw_Cycles: z.number().optional(),
        Sample_Condition: z.number().optional(),
        Infectious_Disease_Test_Result: z.number().optional(),
        Gender: z.number().optional(),
        Age: z.number().optional(),
        Ethnicity: z.number().optional(),
        BMI: z.number().optional(),
        Lab_Parameter: z.number().optional(),
        Result_Interpretation: z.number().optional(),
        Result_Raw: z.number().optional(),
        Result_Numerical: z.number().optional(),
        Result_Unit: z.number().optional(),
        Cut_Off_Raw: z.number().optional(),
        Cut_Off_Numerical: z.number().optional(),
        Test_Method: z.number().optional(),
        Test_System: z.number().optional(),
        Test_System_Manufacturer: z.number().optional(),
        Result_Obtained_From: z.number().optional(),
        Diagnosis: z.number().optional(),
        Diagnosis_Remarks: z.number().optional(),
        ICD_Code: z.number().optional(),
        Pregnancy_Week: z.number().optional(),
        Pregnancy_Trimester: z.number().optional(),
        Medication: z.number().optional(),
        Therapy: z.number().optional(),
        Histological_Diagnosis: z.number().optional(),
        Organ: z.number().optional(),
        Disease_Presentation: z.number().optional(),
        TNM_Class_T: z.number().optional(),
        TNM_Class_N: z.number().optional(),
        TNM_Class_M: z.number().optional(),
        Tumour_Grade: z.number().optional(),
        Tumour_Stage: z.number().optional(),
        Viable_Cells__per_: z.number().optional(),
        Necrotic_Cells__per_: z.number().optional(),
        Tumour_Cells__per_: z.number().optional(),
        Proliferation_Rate__Ki67_per_: z.number().optional(),
        Estrogen_Receptor: z.number().optional(),
        Progesteron_Receptor: z.number().optional(),
        HER_2_Receptor: z.number().optional(),
        Other_Gene_Mutations: z.number().optional(),
        Country_of_Collection: z.number().optional(),
        Date_of_Collection: z.number().optional(),
        Procurement_Type: z.number().optional(),
        Informed_Consent: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.savedPresets.create({ data: input })
    }),

    update: publicProcedure
    .input( z.object({
        id: z.string(),
        Preset_Name: z.string(),
        CBH_Donor_ID: z.number().optional(),
        CBH_Master_ID: z.number().optional(),
        CBH_Sample_ID: z.number().optional(),
        Price: z.number().optional(),
        Quantaty: z.number().optional(),
        Unit: z.number().optional(),
        Matrix: z.number().optional(),
        Storage_Temperatures: z.number().optional(),
        Freeze_Thaw_Cycles: z.number().optional(),
        Sample_Condition: z.number().optional(),
        Infectious_Disease_Test_Result: z.number().optional(),
        Gender: z.number().optional(),
        Age: z.number().optional(),
        Ethnicity: z.number().optional(),
        BMI: z.number().optional(),
        Lab_Parameter: z.number().optional(),
        Result_Interpretation: z.number().optional(),
        Result_Raw: z.number().optional(),
        Result_Numerical: z.number().optional(),
        Result_Unit: z.number().optional(),
        Cut_Off_Raw: z.number().optional(),
        Cut_Off_Numerical: z.number().optional(),
        Test_Method: z.number().optional(),
        Test_System: z.number().optional(),
        Test_System_Manufacturer: z.number().optional(),
        Result_Obtained_From: z.number().optional(),
        Diagnosis: z.number().optional(),
        Diagnosis_Remarks: z.number().optional(),
        ICD_Code: z.number().optional(),
        Pregnancy_Week: z.number().optional(),
        Pregnancy_Trimester: z.number().optional(),
        Medication: z.number().optional(),
        Therapy: z.number().optional(),
        Histological_Diagnosis: z.number().optional(),
        Organ: z.number().optional(),
        Disease_Presentation: z.number().optional(),
        TNM_Class_T: z.number().optional(),
        TNM_Class_N: z.number().optional(),
        TNM_Class_M: z.number().optional(),
        Tumour_Grade: z.number().optional(),
        Tumour_Stage: z.number().optional(),
        Viable_Cells__per_: z.number().optional(),
        Necrotic_Cells__per_: z.number().optional(),
        Tumour_Cells__per_: z.number().optional(),
        Proliferation_Rate__Ki67_per_: z.number().optional(),
        Estrogen_Receptor: z.number().optional(),
        Progesteron_Receptor: z.number().optional(),
        HER_2_Receptor: z.number().optional(),
        Other_Gene_Mutations: z.number().optional(),
        Country_of_Collection: z.number().optional(),
        Date_of_Collection: z.number().optional(),
        Procurement_Type: z.number().optional(),
        Informed_Consent: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.savedPresets.update({
            where: {
                id: input.id
            },
            data: input
        })
    }),

    deleteByID: publicProcedure
    .input(z.object({
        id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.savedPresets.delete({
            where: {
                id: input.id
            }
        })
    })
})