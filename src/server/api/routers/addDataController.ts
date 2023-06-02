import { createTRPCRouter, publicProcedure } from "../trpc";

import Excel from 'exceljs';
import path from 'path';
import cuid from 'cuid';
import { z } from "zod";
import { type Samples } from "@prisma/client";
import { SampleSchema } from "~/common/types";

//const filepath = path.resolve(__dirname, 'SampleDataExamples.xlsx');
const filepath = path.resolve(__dirname, 'SampleDataExamples.csv');

export const addDataController = createTRPCRouter({

  upload: publicProcedure
    .input(SampleSchema.array()) 
    .mutation(async ({ ctx, input }) => {    
      /*const workbook = new Excel.Workbook();

      if (filepath.endsWith('.xlsx')) {
        const content = await workbook.xlsx.readFile(filepath);
          
        const worksheet = content.worksheets[0];
        const rowStartIndex = 9;
        const numberOfRows = worksheet?.rowCount ? worksheet.rowCount - 8 : 0;
          
        const rows = worksheet?.getRows(rowStartIndex, numberOfRows) ?? [];
          
        const rawSamples: string [][] = [[]];
          
        rows.map((row, i) => {
          const temp: string[] = [];
          row.eachCell((cell, j) => 
            {
              console.log(cell.value)
              temp.push(cell.value?.toString() ?? '')
            })
            rawSamples.push(temp);
        });

        const samples = mapColumns(rawSamples)
        return ctx.prisma.samples.createMany({data:samples})

      } else if (filepath.endsWith('.csv')) {
        // read csv file
        const content = await workbook.csv.readFile(filepath);
          
        const rowStartIndex = 0;
        const numberOfRows = content?.rowCount ? content.rowCount - 0 : 0;
          
        const rows = content?.getRows(rowStartIndex, numberOfRows) ?? [];

        const rawSamples: string[][] = [];
          
        rows.map((row, i) => {
          row.eachCell((cell, j) => 
            {
              //console.log(cell.value)
              rawSamples.push(cell.value?.toString().split(';') ?? [''])
            })
        });

        const samples = mapColumns(rawSamples)
        return ctx.prisma.samples.createMany({data: samples})

      } else {
        throw new Error('Unsupported file format');
      }*/

      return await ctx.prisma.samples.createMany({ data: input })
    }), 
})
