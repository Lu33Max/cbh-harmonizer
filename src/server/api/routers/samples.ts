import { Prisma, type Samples } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const sampleRouter = createTRPCRouter({

    // Get All or Filtered
    getAll: publicProcedure
        .input(z.object({ 
            pages: z.number().optional(), 
            lines: z.number().optional(), 
            search: z.string().optional(), 
            filter: z.object({
                cbhMasterID: z.string().optional(), 
                cbhDonorID: z.string().optional(), 
                cbhSampleID: z.string().optional(), 
                price: z.object({
                    min: z.number().optional(), 
                    max: z.number().optional() 
                }), 
                matrix: z.array(z.string()), 
                quantity: z.object({
                    min: z.number().optional(), 
                    max: z.number().optional() 
                }), 
                unit: z.array(z.string()), 
                labParameter: z.array(z.string()), 
                resultInterpretation: z.array(z.string()), 
                resultUnit: z.array(z.string()), 
                diagnosis: z.array(z.string()), 
                ICDCode: z.array(z.string()),
            }) 
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.samples.findMany({ 
                take: input.lines, 
                skip: (input.pages && input.lines) ? (input.pages -1) * input.lines : 0,
                where: {
                    AND: [
                        { 
                            CBH_Master_ID: { 
                                contains: input.filter.cbhMasterID, 
                                mode: 'insensitive',
                            } 
                        },
                        { 
                            CBH_Donor_ID: { 
                                contains: input.filter.cbhDonorID, 
                                mode: 'insensitive' 
                            } 
                        },
                        { 
                            CBH_Sample_ID: { 
                                contains: input.filter.cbhSampleID, 
                                mode: 'insensitive' 
                            } 
                        },
                        { 
                            Price: { 
                                lte: input.filter.price.max, 
                                gte: input.filter.price.min 
                            } 
                        },
                        { 
                            Matrix: { 
                                in: input.filter.matrix?.length > 0 ? input.filter.matrix : undefined, 
                                mode: 'insensitive' 
                            } 
                        },
                        { 
                            Quantity: { 
                                lte: input.filter.quantity.max, 
                                gte: input.filter.quantity.min 
                            } 
                        },
                        { 
                            Unit: { 
                                in: input.filter.unit?.length > 0 ? input.filter.unit : undefined,
                                mode: 'insensitive'
                            } 
                        },
                        { 
                            Lab_Parameter: { 
                                in: input.filter.labParameter?.length > 0 ? input.filter.labParameter : undefined, 
                                mode: 'insensitive' 
                            } 
                        },
                        { 
                            Result_Interpretation: { 
                                in: input.filter.resultInterpretation?.length > 0 ? input.filter.resultInterpretation : undefined,
                                mode: 'insensitive' 
                            } 
                        },
                        { 
                            Result_Unit: { 
                                in: input.filter.resultUnit?.length > 0 ? input.filter.resultUnit : undefined, 
                                mode: 'insensitive' 
                            } 
                        },
                        { 
                            Diagnosis: { 
                                in: input.filter.diagnosis?.length > 0 ? input.filter.diagnosis : undefined, 
                                mode: 'insensitive' 
                            } 
                        },
                        { 
                            ICD_Code: { 
                                in: input.filter.ICDCode?.length > 0 ? input.filter.ICDCode : undefined, 
                                mode: 'insensitive' 
                            } 
                        },
                        {
                            OR: [
                                { 
                                    CBH_Master_ID: { 
                                        contains: input.search, 
                                        mode: 'insensitive',
                                    } 
                                },
                                { 
                                    CBH_Donor_ID: { 
                                        contains: input.search, 
                                        mode: 'insensitive' 
                                    } 
                                },
                                { 
                                    CBH_Sample_ID: { 
                                        contains: input.search, 
                                        mode: 'insensitive' 
                                    } 
                                },
                                { 
                                    Matrix: { 
                                        contains: input.search, 
                                        mode: 'insensitive' 
                                    } 
                                },
                                { 
                                    Lab_Parameter: { 
                                        contains: input.search, 
                                        mode: 'insensitive' 
                                    } 
                                },
                                { 
                                    Result_Interpretation: { 
                                        contains: input.search, 
                                        mode: 'insensitive' 
                                    } 
                                },
                                { 
                                    Result_Unit: { 
                                        contains: input.search, 
                                        mode: 'insensitive' 
                                    } 
                                },
                                { 
                                    Diagnosis: { 
                                        contains: input.search, 
                                        mode: 'insensitive' 
                                    } 
                                },
                                { 
                                    ICD_Code: { 
                                        contains: input.search,
                                        mode: 'insensitive' 
                                    } 
                                },
                            ]
                        }
                    ]
                },
            });
        }),

    // Counts all entries in table
    count: publicProcedure
    .query(({ctx}) => {
        return ctx.prisma.samples.count()
    }),

    // Delete
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input}) => {
            return ctx.prisma.samples.delete({
                where: {
                    id: input.id,
                },
            });
        }),

    //--- Test purpose only ----//
    test: publicProcedure
        .input(z.object({ obj: z.string().or(z.number()).optional()}))
        .query(({ ctx, input }) => {
            return ctx.prisma.$queryRaw<Samples[]>`SELECT * FROM "Samples" ${
                input.obj ? Prisma.sql`WHERE "cbhDonorID" = ${getValue(input.obj)}` : Prisma.empty
            }`
        }),

    simpleFilter: publicProcedure
        .input(z.object({ filters: z.object({ sampleID: z.array(z.string()), labParameter: z.array(z.string()) })}))
        .query(({ctx, input}) => {
            return "hi"
        }),
    //-------------------------//

    getDistinct: publicProcedure
        .input( z.string() )
        .query(async ({ ctx, input }) => {

            switch (input) {
                case 'Price':
                    const result = await ctx.prisma.samples.findMany({
                        distinct: ['Price'],
                    });
                    return result.map(item => item.Price);
                case 'Quantity':
                    const result_1 = await ctx.prisma.samples.findMany({
                        distinct: ['Quantity'],
                    });
                    return result_1.map(item_1 => item_1.Quantity);
                case 'Unit':
                    const result_2 = await ctx.prisma.samples.findMany({
                        distinct: ['Unit'],
                    });
                    return result_2.map(item_2 => item_2.Unit);
                case 'Matrix':
                    const result_3 = await ctx.prisma.samples.findMany({
                        distinct: ['Matrix'],
                    });
                    return result_3.map(item_3 => item_3.Matrix);
                case 'Storage_Temperature':
                    const result_4 = await ctx.prisma.samples.findMany({
                        distinct: ['Storage_Temperature'],
                    });
                    return result_4.map(item_4 => item_4.Storage_Temperature);
                case 'Freeze_Thaw_Cycles':
                    const result_5 = await ctx.prisma.samples.findMany({
                        distinct: ['Freeze_Thaw_Cycles'],
                    });
                    return result_5.map(item_5 => item_5.Freeze_Thaw_Cycles);
                case 'Sample_Condition':
                    const result_6 = await ctx.prisma.samples.findMany({
                        distinct: ['Sample_Condition'],
                    });
                    return result_6.map(item_6 => item_6.Sample_Condition);
                case 'Gender':
                    const result_7 = await ctx.prisma.samples.findMany({
                        distinct: ['Gender'],
                    });
                    return result_7.map(item_7 => item_7.Gender);
                case 'Age':
                    const result_8 = await ctx.prisma.samples.findMany({
                        distinct: ['Age'],
                    });
                    return result_8.map(item_8 => item_8.Age);
                case 'Ethnicity':
                    const result_9 = await ctx.prisma.samples.findMany({
                        distinct: ['Ethnicity'],
                    });
                    return result_9.map(item_9 => item_9.Ethnicity);
                case 'BMI':
                    const result_10 = await ctx.prisma.samples.findMany({
                        distinct: ['BMI'],
                    });
                    return result_10.map(item_10 => item_10.BMI);
                case 'Lab_Parameter':
                    const result_11 = await ctx.prisma.samples.findMany({
                        distinct: ['Lab_Parameter'],
                    });
                    return result_11.map(item_11 => item_11.Lab_Parameter);
                case 'Result_Interpretation':
                    const result_12 = await ctx.prisma.samples.findMany({
                        distinct: ['Result_Interpretation'],
                    });
                    return result_12.map(item_12 => item_12.Result_Interpretation);
                case 'Result_Unit':
                    const result_13 = await ctx.prisma.samples.findMany({
                        distinct: ['Result_Unit'],
                    });
                    return result_13.map(item_13 => item_13.Result_Unit);
                case 'Test_Method':
                    const result_14 = await ctx.prisma.samples.findMany({
                        distinct: ['Test_Method'],
                    });
                    return result_14.map(item_14 => item_14.Test_Method);
                case 'Test_System':
                    const result_15 = await ctx.prisma.samples.findMany({
                        distinct: ['Test_System'],
                    });
                    return result_15.map(item_15 => item_15.Test_System);
                case 'Test_System_Manufacturer':
                    const result_16 = await ctx.prisma.samples.findMany({
                        distinct: ['Test_System_Manufacturer'],
                    });
                    return result_16.map(item_16 => item_16.Test_System_Manufacturer);
                case 'Diagnosis':
                    const result_17 = await ctx.prisma.samples.findMany({
                        distinct: ['Diagnosis'],
                    });
                    return result_17.map(item_17 => item_17.Diagnosis);
                case 'Diagnosis_Remarks':
                    const result_18 = await ctx.prisma.samples.findMany({
                        distinct: ['Diagnosis_Remarks'],
                    });
                    return result_18.map(item_18 => item_18.Diagnosis_Remarks);
                case 'ICD_Code':
                    const result_19 = await ctx.prisma.samples.findMany({
                        distinct: ['ICD_Code'],
                    });
                    return result_19.map(item_19 => item_19.ICD_Code);
                case 'Medication':
                    const result_20 = await ctx.prisma.samples.findMany({
                        distinct: ['Medication'],
                    });
                    return result_20.map(item_20 => item_20.Medication);
                case 'Therapy':
                    const result_21 = await ctx.prisma.samples.findMany({
                        distinct: ['Therapy'],
                    });
                    return result_21.map(item_21 => item_21.Therapy);
                case 'Disease_Presentation':
                    const result_22 = await ctx.prisma.samples.findMany({
                        distinct: ['Disease_Presentation'],
                    });
                    return result_22.map(item_22 => item_22.Disease_Presentation);
                case 'TNM_Class_T':
                    const result_23 = await ctx.prisma.samples.findMany({
                        distinct: ['TNM_Class_T'],
                    });
                    return result_23.map(item_23 => item_23.TNM_Class_T);
                case 'TNM_Class_N':
                    const result_24 = await ctx.prisma.samples.findMany({
                        distinct: ['TNM_Class_N'],
                    });
                    return result_24.map(item_24 => item_24.TNM_Class_N);
                case 'TNM_Class_M':
                    const result_25 = await ctx.prisma.samples.findMany({
                        distinct: ['TNM_Class_M'],
                    });
                    return result_25.map(item_25 => item_25.TNM_Class_M);
                case 'Tumour_Grade':
                    const result_26 = await ctx.prisma.samples.findMany({
                        distinct: ['Tumour_Grade'],
                    });
                    return result_26.map(item_26 => item_26.Tumour_Grade);
                case 'Estrogen_Receptor':
                    const result_27 = await ctx.prisma.samples.findMany({
                        distinct: ['Estrogen_Receptor'],
                    });
                    return result_27.map(item_27 => item_27.Estrogen_Receptor);
                case 'HER_2_Receptor':
                    const result_28 = await ctx.prisma.samples.findMany({
                        distinct: ['HER_2_Receptor'],
                    });
                    return result_28.map(item_28 => item_28.HER_2_Receptor);
                case 'Other_Gene_Mutations':
                    const result_29 = await ctx.prisma.samples.findMany({
                        distinct: ['Other_Gene_Mutations'],
                    });
                    return result_29.map(item_29 => item_29.Other_Gene_Mutations);
                case 'Country_of_Collection':
                    const result_30 = await ctx.prisma.samples.findMany({
                        distinct: ['Country_of_Collection'],
                    });
                    return result_30.map(item_30 => item_30.Country_of_Collection);
                case 'Date_of_Collection':
                    const result_31 = await ctx.prisma.samples.findMany({
                        distinct: ['Date_of_Collection'],
                    });
                    return result_31.map(item_31 => item_31.Date_of_Collection);
                case 'Procurement_Type':
                    const result_32 = await ctx.prisma.samples.findMany({
                        distinct: ['Procurement_Type'],
                    });
                    return result_32.map(item_32 => item_32.Procurement_Type);
                case 'Informed_Consent':
                    const result_33 = await ctx.prisma.samples.findMany({
                        distinct: ['Informed_Consent'],
                    });
                    return result_33.map(item_33 => item_33.Informed_Consent);
                default:
                    throw new Error(`Invalid column name: ${input}`);
            }
        }),
})

function getValue(obj: string | number): string {
    return `${obj}`
}