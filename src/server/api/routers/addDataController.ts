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

const filepath = path.resolve(__dirname, 'SampleDataExamples.xlsx');
const filepathcsv = path.resolve(__dirname, 'SampleDataExamples.csv');

//async function readFileData(filepath: string): Promise<any> {
  //let fileData: any[];

  if (filepath.endsWith('.xlsx')) {
    // read excel file
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
    
    module.exports.addDataController = createTRPCRouter ({
      upload: publicProcedure
      .input(z.string()) 
      .mutation(async({ctx, input}) => {
        
          const workbook = new Excel.Workbook();
          const content = await workbook.xlsx.readFile(filepath);
        
          const worksheet = content.worksheets[0];
          const rowStartIndex = 9;
          const numberOfRows = worksheet?.rowCount ? worksheet.rowCount - 8 : 0;
        
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
        return ctx.prisma.samples.createMany({data:samples})
      })
    })
    
  } else if (filepathcsv.endsWith('.csv')) {
    // read csv file
    const csv = require('csv-parser');
    const fs = require('fs');

    interface Samples {
      id: string;
      CBH_Donor_ID: string;
      CBH_Master_ID: string;
      CBH_Sample_ID: string;
      Price: number | undefined;
      Quantity: number | undefined;
      Unit: string;
      Matrix: string;
      Storage_Temperature: string;
      Freeze_Thaw_Cycles: number | undefined;
      Sample_Condition: string;
      Infectious_Disease_Test_Result: string;
      Gender: string;
      Age: number | undefined;
      Ethnicity: string;
      BMI: number | undefined;
      Lab_Parameter: string;
      Result_Interpretation: string;
      Result_Raw: string;
      Result_Numerical: number | undefined;
      Result_Unit: string;
      Cut_Off_Raw: string;
      Cut_Off_Numerical: number | undefined;
      Test_Method: string;
      Test_System: string;
      Test_System_Manufacturer: string;
      Result_Obtained_From: string;
      Diagnosis: string;
      Diagnosis_Remarks: string;
      ICD_Code: string;
      Pregnancy_Week: number | undefined;
      Pregnancy_Trimester: string;
      Medication: string;
      Therapy: string;
      Histological_Diagnosis: string;
      Organ: string;
      Disease_Presentation:string;
      TNM_Class_T: string;
      TNM_Class_N: string;
      TNM_Class_M: string;
      Tumour_Grade: string;
      Viable_Cells__per_: string;
      Necrotic_Cells__per_: string;
      Tumour_Cells__per_: string;
      Proliferation_Rate__Ki67_per_: string;
      Estrogen_Receptor: string;
      Progesteron_Receptor: string;
      HER_2_Receptor: string;
      Other_Gene_Mutations: string;
      Country_of_Collection: string;
      Date_of_Collection: Date | null;
      Procurement_Type: string;
      Informed_Consent: string;
    }

    const transformDateOfCollect = (value: string | undefined): Date | null => {
      if (!value) {
        return null
      }

      const date = new Date(value);
      return date
    };

    module.exports.addDataController = createTRPCRouter({
      upload: publicProcedure
      .input(z.string())
      .mutation(async ({ ctx, input }) => {
        const samples: Samples[] = [];

        fs.createReadStream(filepathcsv)
        .pipe(csv())
        .on('data', (row: { [key: string]: string }) => {
          const sample = {
            id: cuid(),
            CBH_Donor_ID: row['CBH Donor ID'] as string,
            CBH_Master_ID: row['CBH Master ID'] as string,
            CBH_Sample_ID: row['CBH Sample ID'] as string,
            Price: parseNumber(row['Price']),
            Quantity: parseNumber(row['Quantaty']),
            Unit: row['Unit'] as string,
            Matrix: row['Matrix'] as string,
            Storage_Temperature: row['Storage Temperature'] as string,
            Freeze_Thaw_Cycles: parseNumber(row['Freeze Thaw Cycles']),
            Sample_Condition: row['Sample Condition'] as string,
            Infectious_Disease_Test_Result: row['Infection Disease Test Result'] as string,
            Gender: row['Gender'] as string,
            Age: parseNumber(row['Age']),
            Ethnicity: row['Ethnicity'] as string,
            BMI: parseNumber(row['BMI']),
            Lab_Parameter: row['Lab Parameter'] as string,
            Result_Interpretation: row['Result Interpretation'] as string,
            Result_Raw: row['Result Raw'] as string,
            Result_Numerical: parseNumber(row['Result Numerical']),
            Result_Unit: row['Result Unit'] as string,
            Cut_Off_Raw: row['Cut Off Raw'] as string,
            Cut_Off_Numerical: parseNumber(row['Cut Off Numerical']),
            Test_Method: row['Test Method'] as string,
            Test_System: row['Test System'] as string,
            Test_System_Manufacturer: row['Test System Manufacturer'] as string,
            Result_Obtained_From: row['Result Obtained From'] as string,
            Diagnosis: row['Diagnosis'] as string,
            Diagnosis_Remarks: row['Diagnosis Remarks'] as string,
            ICD_Code: row['ICD Code'] as string,
            Pregnancy_Week: parseNumber(row['Pregnancy Week']),
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
      }),
    });

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
  } else {
    throw new Error('Unsupported file format');
  }

  
const [objectsToCreate, setObjectsToCreate] = useState<Samples[]>([])


const inputarray: number[][] = [];

const zahlenarray: number[] = [];

for(let i = 0; i < inputarray.length; i++) {
  const dateValue = zahlenarray[50] !== undefined ? new Date(String(inputarray[i]?.[zahlenarray[50]])) : null;
  const newObject = {
    id: i.toString(),
    CBH_Donor_ID: zahlenarray[0] !== undefined ? inputarray[i]?.[zahlenarray[0]]?.toString() : null,
    CBH_Master_ID: zahlenarray[1] !== undefined ? inputarray[i]?.[zahlenarray[1]]?.toString() : null,
    CBH_Sample_ID: zahlenarray[2] !== undefined ? inputarray[i]?.[zahlenarray[2]]?.toString() : null,
    Price: zahlenarray[3] !== undefined ? inputarray[i]?.[zahlenarray[3]] : undefined,
    Quantity: zahlenarray[4] !== undefined ? inputarray[i]?.[zahlenarray[4]] : undefined,
    Unit: zahlenarray[5] !== undefined ? inputarray[i]?.[zahlenarray[5]]?.toString() : null,
    Matrix: zahlenarray[6] !== undefined ? inputarray[i]?.[zahlenarray[6]]?.toString() : null,
    Storage_Temperature: zahlenarray[7] !== undefined ? inputarray[i]?.[zahlenarray[7]]?.toString() : null,
    Freeze_Thaw_Cycles: zahlenarray[8] !== undefined ? inputarray[i]?.[zahlenarray[8]] : undefined,
    Sample_Condition: zahlenarray[9] !== undefined ? inputarray[i]?.[zahlenarray[9]]?.toString() : null,
    Infectious_Disease_Test_Result: zahlenarray[10] !== undefined ? inputarray[i]?.[zahlenarray[10]]?.toString() : null,
    Gender: zahlenarray[11] !== undefined ? inputarray[i]?.[zahlenarray[11]]?.toString() : null,
    Age: zahlenarray[12] !== undefined ? inputarray[i]?.[zahlenarray[12]] : undefined,
    Ethnicity: zahlenarray[13] !== undefined ? inputarray[i]?.[zahlenarray[13]]?.toString() : null,
    BMI: zahlenarray[14] !== undefined ? inputarray[i]?.[zahlenarray[14]] : undefined,
    Lab_Parameter: zahlenarray[15] !== undefined ? inputarray[i]?.[zahlenarray[15]]?.toString() : null,
    Result_Interpretation: zahlenarray[16] !== undefined ? inputarray[i]?.[zahlenarray[16]]?.toString() : null,
    Result_Raw: zahlenarray[17] !== undefined ? inputarray[i]?.[zahlenarray[17]]?.toString() : null,
    Result_Numerical: zahlenarray[18] !== undefined ? inputarray[i]?.[zahlenarray[18]]?.toString() : null,
    Result_Unit: zahlenarray[19] !== undefined ? inputarray[i]?.[zahlenarray[19]]?.toString() : null,
    Cut_Off_Raw: zahlenarray[20] !== undefined ? inputarray[i]?.[zahlenarray[20]]?.toString() : null,
    Cut_Off_Numerical: zahlenarray[21] !== undefined ? inputarray[i]?.[zahlenarray[21]] : undefined,
    Test_Method: zahlenarray[22] !== undefined ? inputarray[i]?.[zahlenarray[22]]?.toString() : null,
    Test_System: zahlenarray[23] !== undefined ? inputarray[i]?.[zahlenarray[23]]?.toString() : null,
    Test_System_Manufacturer: zahlenarray[24] !== undefined ? inputarray[i]?.[zahlenarray[24]]?.toString() : null,
    Result_Obtained_From: zahlenarray[25] !== undefined ? inputarray[i]?.[zahlenarray[25]]?.toString() : null,
    Diagnosis: zahlenarray[26] !== undefined ? inputarray[i]?.[zahlenarray[26]]?.toString() : null,
    Diagnosis_Remarks: zahlenarray[27] !== undefined ? inputarray[i]?.[zahlenarray[27]]?.toString() : null,
    ICD_Code: zahlenarray[28] !== undefined ? inputarray[i]?.[zahlenarray[28]] : undefined,
    Pregnancy_Week: zahlenarray[29] !== undefined ? inputarray[i]?.[zahlenarray[29]]?.toString() : null,
    Pregnancy_Trimester: zahlenarray[30] !== undefined ? inputarray[i]?.[zahlenarray[30]]?.toString() : null,
    Medication: zahlenarray[31] !== undefined ? inputarray[i]?.[zahlenarray[31]]?.toString() : null,
    Therapy: zahlenarray[32] !== undefined ? inputarray[i]?.[zahlenarray[32]]?.toString() : null,
    Histological_Diagnosis: zahlenarray[33] !== undefined ? inputarray[i]?.[zahlenarray[33]]?.toString() : null,
    Organ: zahlenarray[34] !== undefined ? inputarray[i]?.[zahlenarray[34]]?.toString() : null,
    Disease_Presentation: zahlenarray[35] !== undefined ? inputarray[i]?.[zahlenarray[35]]?.toString() : null,
    TNM_Class_T: zahlenarray[36] !== undefined ? inputarray[i]?.[zahlenarray[36]]?.toString() : null,
    TNM_Class_N: zahlenarray[37] !== undefined ? inputarray[i]?.[zahlenarray[37]]?.toString() : null,
    TNM_Class_M: zahlenarray[38] !== undefined ? inputarray[i]?.[zahlenarray[38]]?.toString() : null,
    Tumour_Grade: zahlenarray[39] !== undefined ? inputarray[i]?.[zahlenarray[39]]?.toString() : null,
    Tumour_Stage: zahlenarray[40] !== undefined ? inputarray[i]?.[zahlenarray[40]]?.toString() : null,
    Viable_Cells__per_: zahlenarray[41] !== undefined ? inputarray[i]?.[zahlenarray[41]]?.toString() : null,
    Necrotic_Cells__per_: zahlenarray[42] !== undefined ? inputarray[i]?.[zahlenarray[42]]?.toString() : null,
    Tumour_Cells__per_: zahlenarray[43] !== undefined ? inputarray[i]?.[zahlenarray[43]]?.toString() : null,
    Proliferation_Rate__Ki67_per_: zahlenarray[44] !== undefined ? inputarray[i]?.[zahlenarray[44]]?.toString() : null,
    Estrogen_Receptor: zahlenarray[45] !== undefined ? inputarray[i]?.[zahlenarray[45]]?.toString() : null,
    Progesteron_Receptor: zahlenarray[46] !== undefined ? inputarray[i]?.[zahlenarray[46]]?.toString() : null,
    HER_2_Receptor: zahlenarray[47] !== undefined ? inputarray[i]?.[zahlenarray[47]]?.toString() : null,
    Other_Gene_Mutations: zahlenarray[48] !== undefined ? inputarray[i]?.[zahlenarray[48]]?.toString() : null,
    Country_of_Collection: zahlenarray[49] !== undefined ? inputarray[i]?.[zahlenarray[49]]?.toString() : null,
    Date_of_Collection: dateValue,
    Procurement_Type: zahlenarray[51] !== undefined ? inputarray[i]?.[zahlenarray[51]]?.toString() : null,
    Informed_Consent: zahlenarray[52] !== undefined ? inputarray[i]?.[zahlenarray[52]]?.toString() : null,
  }
  setObjectsToCreate(objectsToCreate => [...objectsToCreate, newObject])
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
