import { PrismaClient } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { readFile } from "fs/promises";

import fs from 'fs';
import csv from 'csv-parser';
import Excel from 'exceljs';
import path from 'path';
import cuid from 'cuid';
import { z } from "zod";
import { Samples } from "@prisma/client";
import { useState } from "react";

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

      /*const csv = require('csv-parser');
      const fs = require('fs');
  
      const transformDateOfCollect = (value: string | undefined): Date | null => {
        if (!value) {
          return null
        }
  
        const date = new Date(value);
        return date
      };
  
      const samples: Samples[] = [];

      fs.createReadStream(filepathcsv)
      .pipe(csv())
      .on('data', (row: { [key: string]: string }) => {
        const sample: Samples = {
          id: cuid(),
          CBH_Donor_ID: row['CBH Donor ID'] as string,
          CBH_Master_ID: row['CBH Master ID'] as string,
          CBH_Sample_ID: row['CBH Sample ID'] as string,
          Price: parseNumber(row['Price']) ?? null,
          Quantity: parseNumber(row['Quantaty']) ?? null,
          Unit: row['Unit'] as string,
          Matrix: row['Matrix'] as string,
          Storage_Temperature: row['Storage Temperature'] as string,
          Freeze_Thaw_Cycles: parseNumber(row['Freeze Thaw Cycles']) ?? null,
          Sample_Condition: row['Sample Condition'] as string,
          Infectious_Disease_Test_Result: row['Infection Disease Test Result'] as string,
          Gender: row['Gender'] as string,
          Age: parseNumber(row['Age']) ?? null,
          Ethnicity: row['Ethnicity'] as string,
          BMI: parseNumber(row['BMI']) ?? null,
          Lab_Parameter: row['Lab Parameter'] as string,
          Result_Interpretation: row['Result Interpretation'] as string,
          Result_Raw: row['Result Raw'] as string,
          Result_Numerical: parseNumber(row['Result Numerical']) ?? null,
          Result_Unit: row['Result Unit'] as string,
          Cut_Off_Raw: row['Cut Off Raw'] as string,
          Cut_Off_Numerical: parseNumber(row['Cut Off Numerical']) ?? null,
          Test_Method: row['Test Method'] as string,
          Test_System: row['Test System'] as string,
          Test_System_Manufacturer: row['Test System Manufacturer'] as string,
          Result_Obtained_From: row['Result Obtained From'] as string,
          Diagnosis: row['Diagnosis'] as string,
          Diagnosis_Remarks: row['Diagnosis Remarks'] as string,
          ICD_Code: row['ICD Code'] as string,
          Pregnancy_Week: parseNumber(row['Pregnancy Week']) ?? null,
          Pregnancy_Trimester: row['Pregnancy Trimester'] as string,
          Medication: row['Medication'] as string,
          Therapy: row['Therapy'] as string,
          Histological_Diagnosis: row['Hoistological Diagnosis'] as string,
          Organ: row['Organ'] as string,
          Disease_Presentation: row['Disease Presentation'] as string,
          TNM_Class_T: row['TMN Class T'] as string,
          TNM_Class_N: row['TMN Class N'] as string,
          TNM_Class_M: row['TMN Class M'] as string,
          Tumour_Grade: row['Tumor Grade'] as string,
          Tumour_Stage: row['Tumor Stage'] as string,
          Viable_Cells__per_: row['Viable Cells per'] as string,
          Necrotic_Cells__per_: row['Necrotic Cells per'] as string,
          Tumour_Cells__per_: row['Tumor Cells per'] as string,
          Proliferation_Rate__Ki67_per_: row['Proliferation Rate Ki67 per'] as string,
          Estrogen_Receptor: row['Estrogen Receptor'] as string,
          Progesteron_Receptor: row['Progesteron Receptor'] as string,
          HER_2_Receptor: row['HER 2 Receptor'] as string,
          Other_Gene_Mutations: row['Other Gene Mutations'] as string,
          Country_of_Collection: row['Country of Collection'] as string,
          Date_of_Collection: transformDateOfCollect(row['Date of Collection']),
          Procurement_Type: row['Procurement Type'] as string,
          Informed_Consent: row['Informed Consent'] as string,
        };

        sample.Date_of_Collection = transformDateOfCollect(row['Date of Collection']);

        samples.push(sample);
      })
      .on('end', () => {
        ctx.prisma.samples
        .createMany({ data: samples })    
        .then(() => {
          console.log('Data import successful');
        })
        .catch((error) => {
          console.error('Data import error', error);
        });
      });
      */
    }else {
      throw new Error('Unsupported file format');
    }
  }), 
})


function mapColumns (inputarray: string[][]): Samples[] {
const objectsToCreate: Samples[] = [];


    const zahlenarray: number[] = [3];

    for(let i = 0; i < inputarray.length; i++) {
      // @ts-ignore
      //console.log(inputarray[i][0])

      const dateValue = zahlenarray[50] !== undefined ? new Date(String(inputarray[i]?.[zahlenarray[50]])) : null;

      objectsToCreate.push ({
        id: i.toString(),
        // @ts-ignore
        CBH_Donor_ID: zahlenarray[0] !== undefined && typeof inputarray[i]!='undefined' ? inputarray[i][zahlenarray[0]]?.toString() ?? null : null,
        CBH_Master_ID: zahlenarray[1] !== undefined ? inputarray[i]?.[zahlenarray[1]]?.toString() ?? null : null,
        CBH_Sample_ID: zahlenarray[2] !== undefined ? inputarray[i]?.[zahlenarray[2]]?.toString() ?? null : null,
        Price: zahlenarray[3] !== undefined ? parseNumber(inputarray[i]?.[zahlenarray[3]]) ?? null : null,
        Quantity: zahlenarray[4] !== undefined ? parseNumber(inputarray[i]?.[zahlenarray[4]]) ?? null : null,
        Unit: zahlenarray[5] !== undefined ? inputarray[i]?.[zahlenarray[5]]?.toString() ?? null : null,
        Matrix: zahlenarray[6] !== undefined ? inputarray[i]?.[zahlenarray[6]]?.toString() ?? null : null,
        Storage_Temperature: zahlenarray[7] !== undefined ? inputarray[i]?.[zahlenarray[7]]?.toString() ?? null : null,
        Freeze_Thaw_Cycles: zahlenarray[8] !== undefined ? parseNumber(inputarray[i]?.[zahlenarray[8]]) ?? null : null,
        Sample_Condition: zahlenarray[9] !== undefined ? inputarray[i]?.[zahlenarray[9]]?.toString() ?? null : null,
        Infectious_Disease_Test_Result: zahlenarray[10] !== undefined ? inputarray[i]?.[zahlenarray[10]]?.toString() ?? null : null,
        Gender: zahlenarray[11] !== undefined ? inputarray[i]?.[zahlenarray[11]]?.toString() ?? null : null,
        Age: zahlenarray[12] !== undefined ? parseNumber(inputarray[i]?.[zahlenarray[12]]) ?? null : null,
        Ethnicity: zahlenarray[13] !== undefined ? inputarray[i]?.[zahlenarray[13]]?.toString() ?? null : null,
        BMI: zahlenarray[14] !== undefined ? parseNumber(inputarray[i]?.[zahlenarray[14]]) ?? null : null,
        Lab_Parameter: zahlenarray[15] !== undefined ? inputarray[i]?.[zahlenarray[15]]?.toString() ?? null : null,
        Result_Interpretation: zahlenarray[16] !== undefined ? inputarray[i]?.[zahlenarray[16]]?.toString() ?? null : null,
        Result_Raw: zahlenarray[17] !== undefined ? inputarray[i]?.[zahlenarray[17]]?.toString() ?? null : null,
        Result_Numerical: zahlenarray[18] !== undefined ? parseNumber(inputarray[i]?.[zahlenarray[18]]) ?? null : null,
        Result_Unit: zahlenarray[19] !== undefined ? inputarray[i]?.[zahlenarray[19]]?.toString() ?? null : null,
        Cut_Off_Raw: zahlenarray[20] !== undefined ? inputarray[i]?.[zahlenarray[20]]?.toString() ?? null : null,
        Cut_Off_Numerical: zahlenarray[21] !== undefined ? parseNumber(inputarray[i]?.[zahlenarray[21]]) ?? null : null,
        Test_Method: zahlenarray[22] !== undefined ? inputarray[i]?.[zahlenarray[22]]?.toString() ?? null : null,
        Test_System: zahlenarray[23] !== undefined ? inputarray[i]?.[zahlenarray[23]]?.toString() ?? null : null,
        Test_System_Manufacturer: zahlenarray[24] !== undefined ? inputarray[i]?.[zahlenarray[24]]?.toString() ?? null : null,
        Result_Obtained_From: zahlenarray[25] !== undefined ? inputarray[i]?.[zahlenarray[25]]?.toString() ?? null : null,
        Diagnosis: zahlenarray[26] !== undefined ? inputarray[i]?.[zahlenarray[26]]?.toString() ?? null : null,
        Diagnosis_Remarks: zahlenarray[27] !== undefined ? inputarray[i]?.[zahlenarray[27]]?.toString() ?? null : null,
        ICD_Code: zahlenarray[28] !== undefined ? inputarray[i]?.[zahlenarray[28]]?.toString() ?? null : null,
        Pregnancy_Week: zahlenarray[29] !== undefined ? parseNumber(inputarray[i]?.[zahlenarray[29]]) ?? null : null,
        Pregnancy_Trimester: zahlenarray[30] !== undefined ? inputarray[i]?.[zahlenarray[30]]?.toString() ?? null : null,
        Medication: zahlenarray[31] !== undefined ? inputarray[i]?.[zahlenarray[31]]?.toString() ?? null : null,
        Therapy: zahlenarray[32] !== undefined ? inputarray[i]?.[zahlenarray[32]]?.toString() ?? null : null,
        Histological_Diagnosis: zahlenarray[33] !== undefined ? inputarray[i]?.[zahlenarray[33]]?.toString() ?? null : null,
        Organ: zahlenarray[34] !== undefined ? inputarray[i]?.[zahlenarray[34]]?.toString() ?? null : null,
        Disease_Presentation: zahlenarray[35] !== undefined ? inputarray[i]?.[zahlenarray[35]]?.toString() ?? null : null,
        TNM_Class_T: zahlenarray[36] !== undefined ? inputarray[i]?.[zahlenarray[36]]?.toString() ?? null : null,
        TNM_Class_N: zahlenarray[37] !== undefined ? inputarray[i]?.[zahlenarray[37]]?.toString() ?? null : null,
        TNM_Class_M: zahlenarray[38] !== undefined ? inputarray[i]?.[zahlenarray[38]]?.toString() ?? null : null,
        Tumour_Grade: zahlenarray[39] !== undefined ? inputarray[i]?.[zahlenarray[39]]?.toString() ?? null : null,
        Tumour_Stage: zahlenarray[40] !== undefined ? inputarray[i]?.[zahlenarray[40]]?.toString() ?? null : null,
        Viable_Cells__per_: zahlenarray[41] !== undefined ? inputarray[i]?.[zahlenarray[41]]?.toString() ?? null : null,
        Necrotic_Cells__per_: zahlenarray[42] !== undefined ? inputarray[i]?.[zahlenarray[42]]?.toString() ?? null : null,
        Tumour_Cells__per_: zahlenarray[43] !== undefined ? inputarray[i]?.[zahlenarray[43]]?.toString() ?? null : null,
        Proliferation_Rate__Ki67_per_: zahlenarray[44] !== undefined ? inputarray[i]?.[zahlenarray[44]]?.toString() ?? null : null,
        Estrogen_Receptor: zahlenarray[45] !== undefined ? inputarray[i]?.[zahlenarray[45]]?.toString() ?? null : null,
        Progesteron_Receptor: zahlenarray[46] !== undefined ? inputarray[i]?.[zahlenarray[46]]?.toString() ?? null : null,
        HER_2_Receptor: zahlenarray[47] !== undefined ? inputarray[i]?.[zahlenarray[47]]?.toString() ?? null : null,
        Other_Gene_Mutations: zahlenarray[48] !== undefined ? inputarray[i]?.[zahlenarray[48]]?.toString() ?? null : null,
        Country_of_Collection: zahlenarray[49] !== undefined ? inputarray[i]?.[zahlenarray[49]]?.toString() ?? null : null,
        Date_of_Collection: dateValue,
        Procurement_Type: zahlenarray[51] !== undefined ? inputarray[i]?.[zahlenarray[51]]?.toString() ?? null : null,
        Informed_Consent: zahlenarray[52] !== undefined ? inputarray[i]?.[zahlenarray[52]]?.toString() ?? null : null,
      }) 
    }
    return objectsToCreate;
  }


/*const [objectsToCreate, setObjectsToCreate] = useState<Samples[]>([]);
const [columnMappings, setColumnMappings] = useState({});

const inputarray = ;// Your input array;

// Function to handle user-defined column mappings
const handleColumnMapping = (columnName: string, inputColumn: string) => {
  setColumnMappings(prevMappings => ({
    ...prevMappings,
    [columnName]: inputColumn,
  }));
};

for (let i = 0; i < inputarray.length; i++) {
  const newObject = {};

  // Iterate over column mappings and create the new object
  for (const columnName in columnMappings) {
    const inputColumn = columnMappings[columnName];
    if (inputColumn !== undefined) {
      newObject[columnName] = inputarray[i][inputColumn];
    }
  }

  setObjectsToCreate(prevObjects => [...prevObjects, newObject]);
}*/
