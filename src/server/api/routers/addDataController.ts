/*import * as fs from "fs";
import * as csvParser from "csv-parser";
import * as ExcelJS from "exceljs";
import { PrismaClient } from "@prisma/client";
import { createTRPCRouter } from "../server/api/trpc";

async function addDataToDatabase(file: Express.Multer.File): Promise<void> {
  // Determine the file type based on the file extension
  const fileType = file.originalname.endsWith(".csv") ? "csv" : "xlsx";

  if (fileType === "csv") {
    // Read the CSV data from the file and parse it using csv-parser
    const rows: any[] = [];
    fs.createReadStream(file.path)
      .pipe(csvParser())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        // Add the parsed CSV data to the database using Prisma
        const prisma = new PrismaClient();
        await prisma.samples.createMany({ data: rows });
        await prisma.$disconnect();
      });
  } else {
    // Read the XLSX data from the file and parse it using exceljs
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.getWorksheet(1);
    const rows: any[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 6) {
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          rowData[`column${colNumber}`] = cell.value;
        });
        rows.push(rowData);
      }
    });

    // Add the parsed XLSX data to the database using Prisma
    const prisma = new PrismaClient();
    await prisma.samples.createMany({ data: rows });
    await prisma.$disconnect();
  }
}

// Define the trpc method
const addDataHandler = trpc
  .mutation("addData", {
    input: trpc.shape({
      file: trpc.upload(),
    }),
    async resolve({ input }) {
      await addDataToDatabase(input.file);
      return true;
    },
  })
  .middleware(
    trpc.middlewares.createWrapErrorMiddleware({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to add data to the database",
    })
  );*/

/*  // Import required libraries
const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

// Create a Prisma client instance
const prisma = new PrismaClient();

// Define the tRPC controller
async function uploadFile({ file }) {
  try {
    // Read the uploaded file
    const workbook = xlsx.readFile(file.path);

    // Get the first sheet of the workbook
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Convert the sheet data to an array of objects
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Add the data to the database
    await prisma.yourModelName.createMany({
      data,
    });

    // Return a success message
    return { success: true, message: 'File uploaded successfully' };
  } catch (error) {
    console.error(error);
    // Return an error message
    return { success: false, message: 'Failed to upload file' };
  }
}

// Export the tRPC controller
module.exports = uploadFile;
*/

import { PrismaClient } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";

import fs from 'fs';
import csv from 'csv-parser';
import Excel from 'exceljs';
import path from 'path';
import cuid from 'cuid';
import { z } from "zod";
import { Samples } from "@prisma/client";

const prisma = new PrismaClient();

const filepath = path.resolve(__dirname, 'SampleDataExamples.xlsx');

const getCellValue = (row: Excel.Row, cellIndex: number) => {
  const cell = row.getCell(cellIndex);

  console.log(cell.value);

  return cell.value ? cell.value.toString() : '';
};

const getCellFormularValue = (row: Excel.Row, cellIndex: number) => {
  const value = row.getCell(cellIndex).value as Excel.CellFormulaValue;

  return value.result ? value.result.toString() : '';
}

const transformDateOfCollect = (value: string) => {
  const date = new Date(value);

  return date;
};

export const addDataController = createTRPCRouter ({
  upload: publicProcedure
  .input(z.string()) 
  .mutation(async({ctx, input}) => {
    
      const workbook = new Excel.Workbook();
      const content = await workbook.xlsx.readFile(filepath);
    
      const worksheet = content.worksheets[1];
      const rowStartIndex = 7;
      const numberOfRows = worksheet?.rowCount ? - 6 : 0;
    
      const rows = worksheet?.getRows(rowStartIndex, numberOfRows) ?? [];
    
      const samples = rows.map((row): Samples => {
        return {
          id: cuid(),
          CBH_Donor_ID: getCellValue(row,1),
          CBH_Master_ID: getCellValue(row,2),
          CBH_Sample_ID: getCellValue(row,3),
          Price: +getCellValue(row,4),
          Quantity: +getCellValue(row,5),
          Unit: getCellValue(row,6),
          Matrix: getCellValue(row,7),
          Storage_Temperature: getCellValue(row,8),
          Freeze_Thaw_Cycles: +getCellValue(row,9),
          Sample_Condition: getCellValue(row,10),
          Infectious_Disease_Test_Result: getCellValue(row,11),
          Gender: getCellValue(row,12),
          Age: +getCellValue(row,13),
          Ethnicity: getCellValue(row,14),
          BMI: +getCellValue(row,15),
          Lab_Parameter: getCellValue(row,16),
          Result_Interpretation: getCellValue(row,17),
          Result_Raw: getCellValue(row,18),
          Result_Numerical: +getCellValue(row,19),
          Result_Unit: getCellValue(row,20),
          Cut_Off_Raw: getCellValue(row,21),
          Cut_Off_Numerical: +getCellValue(row,22),
          Test_Method: getCellValue(row,23),
          Test_System: getCellValue(row,24),
          Test_System_Manufacturer: getCellValue(row,25),
          Result_Obtained_From: getCellValue(row,26),
          Diagnosis: getCellValue(row,27),
          Diagnosis_Remarks: getCellValue(row,28),
          ICD_Code: getCellValue(row,29),
          Pregnancy_Week: +getCellValue(row,30),
          Pregnancy_Trimester: getCellValue(row,31),
          Medication: getCellValue(row,32),
          Therapy: getCellValue(row,33),
          Histological_Diagnosis: getCellValue(row,34),
          Organ: getCellValue(row,35),
          Disease_Presentation: getCellValue(row,36),
          TNM_Class_T: getCellValue(row,37),
          TNM_Class_N: getCellValue(row,38),
          TNM_Class_M: getCellValue(row,39),
          Tumour_Grade: getCellValue(row,40),
          Tumour_Stage: getCellValue(row,41),
          Viable_Cells__per_: getCellValue(row,42),
          Necrotic_Cells__per_: getCellValue(row,43),
          Tumour_Cells__per_: getCellValue(row,44),
          Proliferation_Rate__Ki67_per_: getCellValue(row,45),
          Estrogen_Receptor: getCellValue(row,46),
          Progesteron_Receptor: getCellValue(row,47),
          HER_2_Receptor: getCellValue(row,48),
          Other_Gene_Mutations: getCellValue(row,49),
          Country_of_Collection: getCellValue(row,50),
          Date_of_Collection: transformDateOfCollect(getCellValue(row,51)),
          Procurement_Type: getCellValue(row,52),
          Informed_Consent: getCellValue(row,53),
        }
      });
    return ctx.prisma.addDataController.createMany({data:samples})
     
    
      console.log(samples);
    
  })
})


//main().then();
