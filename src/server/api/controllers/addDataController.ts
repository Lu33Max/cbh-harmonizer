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
import { createTRPCRouter } from "../trpc";

import fs from 'fs';
import csv from 'csv-parser';
import Excel from 'exceljs';
import path from 'path';

const prisma = new PrismaClient();

//const sampleRouter = createTRPCRouter();

const filepath = path.resolve(__dirname, 'Sample Data Examples_230421 (1).xlsx');



type Sample = {
  donorID: string;
  masterID: string;
  sampleID: string;
  price: number;
  quantaty: number;
  unit: string;
  matrix: string;
  storageTemperature: string;
  freezeCycles: number;
  sampleCondition: string;
  infecDisTestRes: string;
  gender: string;
  age: number;
  ethnicity: string;
  bmi: number;
  labParam: string;
  resultInterpr: string;
  resultRaw: string;
  resultNum: number;
  resultUnit: string;
  cutOffRaw: string;
  cutOffNum: number;
  testMethod: string;
  testSystem: string;
  testSysMan: string;
  resObtFrom: string;
  diagnosis: string;
  diagRemarks: string;
  icdCode: string;
  pregnWeek: string;
  pregnTrimester: string;
  medication: string;
  therapy: string;
  histDiagnosis: string;
  organ: string;
  diseasePresentation: string;
  tmnClassT: string;
  tmnClassN: string;
  tmnClassM: string;
  tumorGrade: string;
  tumorStage: string;
  viableCellsPer: number;
  necroticCellsPer: number;
  tumorCellsPer: number;
  prolifRateKi67Per: string;
  estrogenRecept: string;
  progesteronRecept: string;
  her2Recept: string;
  otherGeneMutations: string;
  countryOfCollect: string;
  dateOfCollect: string; // (MM/DD/YYYY)
  procurementType: string;
  infConstent: string;
}

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

  return '${date.getDate()}-${date.getMonth()}-${date.getFullYear()}';
};


export const main = async () => {
  const workbook = new Excel.Workbook();
  const content = await workbook.xlsx.readFile(filepath);

  const worksheet = content.worksheets[1];
  const rowStartIndex = 7;
  const numberOfRows = worksheet?.rowCount ? - 6 : 0;

  const rows = worksheet?.getRows(rowStartIndex, numberOfRows) ?? [];

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  const { Samples } = prisma;

  const samples = rows.map((row): Sample => {
    return {
      donorID: getCellValue(row,1),
      masterID: getCellValue(row,2),
      sampleID: getCellValue(row,3),
      price: +getCellValue(row,4),
      quantaty: +getCellValue(row,5),
      unit: getCellValue(row,6),
      matrix: getCellValue(row,7),
      storageTemperature: getCellValue(row,8),
      freezeCycles: +getCellValue(row,9),
      sampleCondition: getCellValue(row,10),
      infecDisTestRes: getCellValue(row,11),
      gender: getCellValue(row,12),
      age: +getCellValue(row,13),
      ethnicity: getCellValue(row,14),
      bmi: +getCellValue(row,15),
      labParam: getCellValue(row,16),
      resultInterpr: getCellValue(row,17),
      resultRaw: getCellValue(row,18),
      resultNum: +getCellValue(row,19),
      resultUnit: getCellValue(row,20),
      cutOffRaw: getCellValue(row,21),
      cutOffNum: +getCellValue(row,22),
      testMethod: getCellValue(row,23),
      testSystem: getCellValue(row,24),
      testSysMan: getCellValue(row,25),
      resObtFrom: getCellValue(row,26),
      diagnosis: getCellValue(row,27),
      diagRemarks: getCellValue(row,28),
      icdCode: getCellValue(row,29),
      pregnWeek: getCellValue(row,30),
      pregnTrimester: getCellValue(row,31),
      medication: getCellValue(row,32),
      therapy: getCellValue(row,33),
      histDiagnosis: getCellValue(row,34),
      organ: getCellValue(row,35),
      diseasePresentation: getCellValue(row,36),
      tmnClassT: getCellValue(row,37),
      tmnClassN: getCellValue(row,38),
      tmnClassM: getCellValue(row,39),
      tumorGrade: getCellValue(row,40),
      tumorStage: getCellValue(row,41),
      viableCellsPer: +getCellValue(row,42),
      necroticCellsPer: +getCellValue(row,43),
      tumorCellsPer: +getCellValue(row,44),
      prolifRateKi67Per: getCellValue(row,45),
      estrogenRecept: getCellValue(row,46),
      progesteronRecept: getCellValue(row,47),
      her2Recept: getCellValue(row,48),
      otherGeneMutations: getCellValue(row,49),
      countryOfCollect: getCellValue(row,50),
      dateOfCollect: transformDateOfCollect(getCellValue(row,51)),
      procurementType: getCellValue(row,52),
      infConstent: getCellValue(row,53),
    }
  });

  const result = await Samples.createMany({
    data: samples,
  })

  console.log(samples);
};

main().then();
