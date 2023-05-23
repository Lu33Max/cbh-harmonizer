import { PrismaClient } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";

import Excel from 'exceljs';
import path from 'path';
import cuid from 'cuid';
import { z } from "zod";
import { Samples } from "@prisma/client";


const prisma = new PrismaClient();

//const filepath = path.resolve(__dirname, 'SampleDataExamples.xlsx');
const filepath = path.resolve(__dirname, 'SampleDataExamples.csv');

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

function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsedValue = Number(value);

  if (isNaN(parsedValue)) {
    return undefined;
  }

  return parsedValue;
}

export const addDataController = createTRPCRouter({

  upload: publicProcedure
  .input(z.string()) 
  .mutation(async({ctx, input}) => {
    
        
      const workbook = new Excel.Workbook();
      if (filepath.endsWith('.xlsx')) {
      const content = await workbook.xlsx.readFile(filepath);
        
      const worksheet = content.worksheets[0];
      const rowStartIndex = 9;
      const numberOfRows = worksheet?.rowCount ? worksheet.rowCount - 8 : 0;
        
      const rows = worksheet?.getRows(rowStartIndex, numberOfRows) ?? [];
        
      let rawSamples: string [][] = [[]];
        
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

    }else if (filepath.endsWith('.csv')) {
      // read csv file
      const content = await workbook.csv.readFile(filepath);
        
      const rowStartIndex = 0;
      const numberOfRows = content?.rowCount ? content.rowCount - 0 : 0;
        
      const rows = content?.getRows(rowStartIndex, numberOfRows) ?? [];

      let rawSamples: string [][] = [[]];

        
      rows.map((row, i) => {
        row.eachCell((cell, j) => 
          {
            //console.log(cell.value)
            rawSamples.push(cell.value?.toString().split(';') ??[''])
          })
      });
      const samples = mapColumns(rawSamples)
      return ctx.prisma.samples.createMany({data:samples})
    }else {
      throw new Error('Unsupported file format');
    }
  }), 
})


function mapColumns (inputarray: string[][]): Samples[] {
const objectsToCreate: Samples[] = [];


    const zahlenarray: number[] = [0];

    for(let i = 0; i < inputarray.length; i++) {
    
      // @ts-ignore
      const dateValue = zahlenarray[50] !== undefined && typeof inputarray[i]!='undefined' ? new Date(String(inputarray[i][zahlenarray[50]])) ?? null : null;

      objectsToCreate.push ({
        id: cuid(),
        // @ts-ignore
        CBH_Donor_ID: zahlenarray[0] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[0]]?.toString() ?? null : null,
        // @ts-ignore
        CBH_Master_ID: zahlenarray[1] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[1]]?.toString() ?? null : null,
        // @ts-ignore
        CBH_Sample_ID: zahlenarray[2] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[2]]?.toString() ?? null : null,
        // @ts-ignore
        Price: zahlenarray[3] !== undefined && typeof inputarray[i]!='undefined' ? parseNumber(inputarray[i][zahlenarray[3]]) ?? null : null,
        // @ts-ignore
        Quantity: zahlenarray[4] !== undefined && typeof inputarray[i]!='undefined' ? parseNumber(inputarray[i][zahlenarray[4]]) ?? null : null,
        // @ts-ignore
        Unit: zahlenarray[5] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[5]]?.toString() ?? null : null,
        // @ts-ignore
        Matrix: zahlenarray[6] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[6]]?.toString() ?? null : null,
        // @ts-ignore
        Storage_Temperature: zahlenarray[7] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[7]]?.toString() ?? null : null,
        // @ts-ignore
        Freeze_Thaw_Cycles: zahlenarray[8] !== undefined && typeof inputarray[i]!='undefined' ? parseNumber(inputarray[i][zahlenarray[8]]) ?? null : null,
        // @ts-ignore
        Sample_Condition: zahlenarray[9] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[9]]?.toString() ?? null : null,
        // @ts-ignore
        Infectious_Disease_Test_Result: zahlenarray[10] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[10]]?.toString() ?? null : null,
        // @ts-ignore
        Gender: zahlenarray[11] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[11]]?.toString() ?? null : null,
        // @ts-ignore
        Age: zahlenarray[12] !== undefined && typeof inputarray[i]!='undefined' ? parseNumber(inputarray[i][zahlenarray[12]]) ?? null : null,
        // @ts-ignore
        Ethnicity: zahlenarray[13] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[13]]?.toString() ?? null : null,
        // @ts-ignore
        BMI: zahlenarray[14] !== undefined && typeof inputarray[i]!='undefined' ? parseNumber(inputarray[i][zahlenarray[14]]) ?? null : null,
        // @ts-ignore
        Lab_Parameter: zahlenarray[15] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[15]]?.toString() ?? null : null,
        // @ts-ignore
        Result_Interpretation: zahlenarray[16] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[16]]?.toString() ?? null : null,
        // @ts-ignore
        Result_Raw: zahlenarray[17] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[17]]?.toString() ?? null : null,
        // @ts-ignore
        Result_Numerical: zahlenarray[18] !== undefined && typeof inputarray[i]!='undefined' ? parseNumber(inputarray[i][zahlenarray[18]]) ?? null : null,
        // @ts-ignore
        Result_Unit: zahlenarray[19] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[19]]?.toString() ?? null : null,
        // @ts-ignore
        Cut_Off_Raw: zahlenarray[20] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[20]]?.toString() ?? null : null,
        // @ts-ignore
        Cut_Off_Numerical: zahlenarray[21] !== undefined && typeof inputarray[i]!='undefined' ? parseNumber(inputarray[i][zahlenarray[21]]) ?? null : null,
        // @ts-ignore
        Test_Method: zahlenarray[22] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[22]]?.toString() ?? null : null,
        // @ts-ignore
        Test_System: zahlenarray[23] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[23]]?.toString() ?? null : null,
        // @ts-ignore
        Test_System_Manufacturer: zahlenarray[24] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[24]]?.toString() ?? null : null,
        // @ts-ignore
        Result_Obtained_From: zahlenarray[25] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[25]]?.toString() ?? null : null,
        // @ts-ignore
        Diagnosis: zahlenarray[26] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[26]]?.toString() ?? null : null,
        // @ts-ignore
        Diagnosis_Remarks: zahlenarray[27] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[27]]?.toString() ?? null : null,
        // @ts-ignore
        ICD_Code: zahlenarray[28] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[28]]?.toString() ?? null : null,
        // @ts-ignore
        Pregnancy_Week: zahlenarray[29] !== undefined && typeof inputarray[i]!='undefined' ? parseNumber(inputarray[i][zahlenarray[29]]) ?? null : null,
        // @ts-ignore
        Pregnancy_Trimester: zahlenarray[30] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[30]]?.toString() ?? null : null,
        // @ts-ignore
        Medication: zahlenarray[31] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[31]]?.toString() ?? null : null,
        // @ts-ignore
        Therapy: zahlenarray[32] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[32]]?.toString() ?? null : null,
        // @ts-ignore
        Histological_Diagnosis: zahlenarray[33] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[33]]?.toString() ?? null : null,
        // @ts-ignore
        Organ: zahlenarray[34] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[34]]?.toString() ?? null : null,
        // @ts-ignore
        Disease_Presentation: zahlenarray[35] !== undefined ? inputarray[i][zahlenarray[35]]?.toString() ?? null : null,
        // @ts-ignore
        TNM_Class_T: zahlenarray[36] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[36]]?.toString() ?? null : null,
        // @ts-ignore
        TNM_Class_N: zahlenarray[37] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[37]]?.toString() ?? null : null,
        // @ts-ignore
        TNM_Class_M: zahlenarray[38] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[38]]?.toString() ?? null : null,
        // @ts-ignore
        Tumour_Grade: zahlenarray[39] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[39]]?.toString() ?? null : null,
        // @ts-ignore
        Tumour_Stage: zahlenarray[40] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[40]]?.toString() ?? null : null,
        // @ts-ignore
        Viable_Cells__per_: zahlenarray[41] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[41]]?.toString() ?? null : null,
        // @ts-ignore
        Necrotic_Cells__per_: zahlenarray[42] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[42]]?.toString() ?? null : null,
        // @ts-ignore
        Tumour_Cells__per_: zahlenarray[43] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[43]]?.toString() ?? null : null,
        // @ts-ignore
        Proliferation_Rate__Ki67_per_: zahlenarray[44] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[44]]?.toString() ?? null : null,
        // @ts-ignore
        Estrogen_Receptor: zahlenarray[45] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[45]]?.toString() ?? null : null,
        // @ts-ignore
        Progesteron_Receptor: zahlenarray[46] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[46]]?.toString() ?? null : null,
        // @ts-ignore
        HER_2_Receptor: zahlenarray[47] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[47]]?.toString() ?? null : null,
        // @ts-ignore
        Other_Gene_Mutations: zahlenarray[48] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[48]]?.toString() ?? null : null,
        // @ts-ignore
        Country_of_Collection: zahlenarray[49] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[49]]?.toString() ?? null : null,
        // @ts-ignore
        Date_of_Collection: dateValue,
        // @ts-ignore
        Procurement_Type: zahlenarray[51] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[51]]?.toString() ?? null : null,
        // @ts-ignore
        Informed_Consent: zahlenarray[52] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[52]]?.toString() ?? null : null,
      }) 
    }
    return objectsToCreate;
  }
