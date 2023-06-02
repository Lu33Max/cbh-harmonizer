import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { api } from "~/utils/api";
import Excel from 'exceljs';
import { type Samples } from "@prisma/client";
import cuid from "cuid";
import { SampleSchema } from "~/common/database/samples";

const Home: NextPage = () => {
  // General Table
  const [page,] = useState<number>(1)
  const [pagelength,] = useState<number>(100)

  // API Requests
  const { data: samples, refetch: refetchSamples } = api.samples.getMany.useQuery({ take: pagelength, skip: 0})
  const upload = api.samples.create.useMutation()

  // File Reader
  const [input, setInput] = useState<File | undefined>(undefined)
  const [startRow, setStartRow] = useState<number>(1)
  const [header, setHeader] = useState<string[]>([])
  const [rawSamples, setRawSamples] = useState<string[][]>([])
  const [newSamples, setNewSamples] = useState<Samples[]>([])
  const [errorSamples, setErrorSamples] = useState<Samples[]>([])
  const [mappings, setMappings] = useState<number[]>([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52])

  function readFile() {
    if(input !== undefined){
      if(input?.name.endsWith(".xlsx")){
        const wb = new Excel.Workbook()
        const reader = new FileReader()

        reader.readAsArrayBuffer(input)
        reader.onload = () => {
          const buffer = reader.result;

          if(buffer instanceof ArrayBuffer){
            wb.xlsx.load(buffer).then(workbook => {
              let rowLength = 0;
              const tempSampleArray: string[][] = []

              workbook.eachSheet((sheet) => {
                sheet.eachRow((row, rowIndex) => {
                  if(rowIndex === startRow){
                    const tempHeader: string[] = []

                    row.eachCell((cell) => {
                      tempHeader.push(cell.text)
                    })

                    rowLength = tempHeader.length
                    setHeader(tempHeader)
                  }

                  if(rowIndex > startRow){
                    const tempSample: string[] = []
                    let index = 1

                    row.eachCell((cell, i) => {
                      while(i > index){
                        tempSample.push("")
                        index++
                      }
                      tempSample.push(cell.text)
                      index++
                    })

                    while(tempSample.length < rowLength){
                      tempSample.push("")
                    }

                    tempSampleArray.push(tempSample)
                  }   
                })
              })

              setRawSamples(tempSampleArray)
            })
            .catch(error => {
              console.error(error)
            })
          }
        }
      } else if(input.name.endsWith(".csv")){

        // Add csv code

      } else {
        alert("Filetype not supported. Try uploading data in Excel or csv format.")
      }
    } else {
      alert("No File selected")
    }
  }

  function mapColumns (): void {
    const objectsToCreate: Samples[] = [];
  
    rawSamples.forEach(sample => {
    
      const dateValue = (mappings[50] !== undefined && sample[mappings[50]] !== "") ? new Date(String(sample[mappings[50]])) ?? null : null;
  
      objectsToCreate.push ({
        id: cuid(),
        CBH_Donor_ID: (mappings[0] !== undefined && sample[mappings[0]] !== "") ? sample[mappings[0]] ?? null : null,
        CBH_Master_ID: (mappings[1] !== undefined && sample[mappings[1]] !== "") ? sample[mappings[1]] ?? null : null,
        CBH_Sample_ID: (mappings[2] !== undefined && sample[mappings[2]] !== "") ? sample[mappings[2]] ?? null : null,
        Price: (mappings[3] !== undefined && sample[mappings[3]] !== "") ? Number(sample[mappings[3]]) ?? null : null,
        Quantity: (mappings[4] !== undefined && sample[mappings[4]] !== "") ? Number(sample[mappings[4]]) ?? null : null,
        Unit: (mappings[5] !== undefined && sample[mappings[5]] !== "") ? sample[mappings[5]] ?? null : null,
        Matrix: (mappings[6] !== undefined && sample[mappings[6]] !== "") ? sample[mappings[6]] ?? null : null,
        Storage_Temperature: (mappings[7] !== undefined && sample[mappings[7]] !== "") ? sample[mappings[7]] ?? null : null,
        Freeze_Thaw_Cycles: (mappings[8] !== undefined && sample[mappings[8]] !== "") ? Number(sample[mappings[8]]) ?? null : null,    
        Sample_Condition: (mappings[9] !== undefined && sample[mappings[9]] !== "") ? sample[mappings[9]] ?? null : null,       
        Infectious_Disease_Test_Result: (mappings[10] !== undefined && sample[mappings[10]] !== "") ? sample[mappings[10]] ?? null : null,       
        Gender: (mappings[11] !== undefined && sample[mappings[11]] !== "") ? sample[mappings[11]] ?? null : null,       
        Age: (mappings[12] !== undefined && sample[mappings[12]] !== "") ? Number(sample[mappings[12]]) ?? null : null,       
        Ethnicity: (mappings[13] !== undefined && sample[mappings[13]] !== "") ? sample[mappings[13]] ?? null : null,       
        BMI: (mappings[14] !== undefined && sample[mappings[14]] !== "") ? Number(sample[mappings[14]]) ?? null : null,        
        Lab_Parameter: (mappings[15] !== undefined && sample[mappings[15]] !== "") ? sample[mappings[15]] ?? null : null, 
        Result_Interpretation: (mappings[16] !== undefined && sample[mappings[16]] !== "") ? sample[mappings[16]] ?? null : null,       
        Result_Raw: (mappings[17] !== undefined && sample[mappings[17]] !== "") ? sample[mappings[17]] ?? null : null,        
        Result_Numerical: (mappings[18] !== undefined && sample[mappings[18]] !== "") ? Number(sample[mappings[18]]) ?? null : null,        
        Result_Unit: (mappings[19] !== undefined && sample[mappings[19]] !== "") ? sample[mappings[19]] ?? null : null,       
        Cut_Off_Raw: (mappings[20] !== undefined && sample[mappings[20]] !== "") ? sample[mappings[20]] ?? null : null,       
        Cut_Off_Numerical: (mappings[21] !== undefined && sample[mappings[21]] !== "") ? Number(sample[mappings[21]]) ?? null : null,       
        Test_Method: (mappings[22] !== undefined && sample[mappings[22]] !== "") ? sample[mappings[22]] ?? null : null,        
        Test_System: (mappings[23] !== undefined && sample[mappings[23]] !== "") ? sample[mappings[23]] ?? null : null,        
        Test_System_Manufacturer: (mappings[24] !== undefined && sample[mappings[24]] !== "") ? sample[mappings[24]] ?? null : null,        
        Result_Obtained_From: (mappings[25] !== undefined && sample[mappings[25]] !== "") ? sample[mappings[25]] ?? null : null,        
        Diagnosis: (mappings[26] !== undefined && sample[mappings[26]] !== "") ? sample[mappings[26]] ?? null : null,        
        Diagnosis_Remarks: (mappings[27] !== undefined && sample[mappings[27]] !== "") ? sample[mappings[27]] ?? null : null,        
        ICD_Code: (mappings[28] !== undefined && sample[mappings[28]] !== "") ? sample[mappings[28]] ?? null : null,        
        Pregnancy_Week: (mappings[29] !== undefined && sample[mappings[29]] !== "") ? Number(sample[mappings[29]]) ?? null : null,        
        Pregnancy_Trimester: (mappings[30] !== undefined && sample[mappings[30]] !== "") ? sample[mappings[30]] ?? null : null,        
        Medication: (mappings[31] !== undefined && sample[mappings[31]] !== "") ? sample[mappings[31]] ?? null : null,        
        Therapy: (mappings[32] !== undefined && sample[mappings[32]] !== "") ? sample[mappings[32]] ?? null : null,       
        Histological_Diagnosis: (mappings[33] !== undefined && sample[mappings[33]] !== "") ? sample[mappings[33]] ?? null : null,       
        Organ: (mappings[34] !== undefined && sample[mappings[34]] !== "") ? sample[mappings[34]] ?? null : null,        
        Disease_Presentation: (mappings[35] !== undefined && sample[mappings[35]] !== "") ? sample[mappings[35]] ?? null : null,        
        TNM_Class_T: (mappings[36] !== undefined && sample[mappings[36]] !== "") ? sample[mappings[36]] ?? null : null,       
        TNM_Class_N: (mappings[37] !== undefined && sample[mappings[37]] !== "") ? sample[mappings[37]] ?? null : null,        
        TNM_Class_M: (mappings[38] !== undefined && sample[mappings[38]] !== "") ? sample[mappings[38]] ?? null : null,        
        Tumour_Grade: (mappings[39] !== undefined && sample[mappings[39]] !== "") ? sample[mappings[39]] ?? null : null,        
        Tumour_Stage: (mappings[40] !== undefined && sample[mappings[40]] !== "") ? sample[mappings[40]] ?? null : null,        
        Viable_Cells__per_: (mappings[41] !== undefined && sample[mappings[41]] !== "") ? sample[mappings[41]] ?? null : null,       
        Necrotic_Cells__per_: (mappings[42] !== undefined && sample[mappings[42]] !== "") ? sample[mappings[42]] ?? null : null,       
        Tumour_Cells__per_: (mappings[43] !== undefined && sample[mappings[43]] !== "") ? sample[mappings[43]] ?? null : null,        
        Proliferation_Rate__Ki67_per_: (mappings[44] !== undefined && sample[mappings[44]] !== "") ? sample[mappings[44]] ?? null : null,        
        Estrogen_Receptor: (mappings[45] !== undefined && sample[mappings[45]] !== "") ? sample[mappings[45]] ?? null : null,        
        Progesteron_Receptor: (mappings[46] !== undefined && sample[mappings[46]] !== "") ? sample[mappings[46]] ?? null : null,        
        HER_2_Receptor: (mappings[47] !== undefined && sample[mappings[47]] !== "") ? sample[mappings[47]] ?? null : null,        
        Other_Gene_Mutations: (mappings[48] !== undefined && sample[mappings[48]] !== "") ? sample[mappings[48]] ?? null : null,        
        Country_of_Collection: (mappings[49] !== undefined && sample[mappings[49]] !== "") ? sample[mappings[49]] ?? null : null,       
        Date_of_Collection: dateValue,       
        Procurement_Type: (mappings[51] !== undefined && sample[mappings[51]] !== "") ? sample[mappings[51]] ?? null : null,
        Informed_Consent: (mappings[52] !== undefined && sample[mappings[52]] !== "") ? sample[mappings[52]] ?? null : null,
      }) 
    })
  
    setNewSamples(objectsToCreate)
  }

  function onSubmit() {
    const errors: Samples[] = []
    const uploadSamples: Samples[][] = []
    const size = 200

    // Weil ein zu großes Array die maximalen Beschränkungen für einen HTTP Body überschreitet, wird das große Array hier in kleinere Arrays unterteilt, die jeweils mit 1 Sekunfde Delay
    // nacheinander ausgeführt werden, um so die Datenbank nicht zu überlasten
    for (let i = 0; i < newSamples.length; i += size) {
      uploadSamples.push(newSamples.slice(i, i + size));
    }

   /* newSamples.forEach((sample, i) => {
      if(i < 100){
        console.log(sample)
      }
      
      upload.mutate(sample)

      if(upload.isError){
        errors.push(sample)
      }
    });*/

    uploadSamples.forEach((samples, i) => {
      setTimeout(() => uploadFunction(samples), i *1000)
    })

    setErrorSamples(errors)
    setRawSamples([])
    setHeader([])
    setNewSamples([])
    setInput(undefined)

    void refetchSamples()
  }

  function uploadFunction(uploadSamples: Samples[]){
    const errors: Samples[] = []

    uploadSamples.forEach((sample) => {      
      upload.mutate(sample)

      if(upload.isError){
        errors.push(sample)
      }
    })

    setErrorSamples([...errorSamples, ...errors])
  }

  return (
    <>
      <Head>
        <title>CBH Harmonizer</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col px-5 py-5 text-lg max-w-[100vw] overflow-x-hidden">

        <div className="flex flex-row gap-3 mx-4">
          <input type="file" accept=".xlsx,.csv" onChange={(e) => setInput(e.target.files !== null ? e.target.files[0] : undefined)}></input>
          <input type="number" onChange={(e) => setStartRow(Number(e.target.value) ?? 1)} className="border-2 border-black py-1" placeholder="Start Column"></input>
          <button onClick={readFile} className="bg-green-300 rounded-xl px-3 py-1">Read File</button>
        </div>

        {input !== undefined && (
          <>
            <div className="max-w-[100vw] flex flex-row flex-wrap">
              {header.map((cell, i) => {
                return (
                  <label key={i} className="px-2">{cell}</label>
                )
              })}
              {/*Object.getOwnPropertyNames(SampleSchema.shape).map((name, i) => {
                return(
                  <label key={i}>{name}</label>
                )
              })*/}
            </div>

            {header.length > 0 && (
              <button onClick={mapColumns}>Apply Mappings</button>
            )}

            {newSamples.length > 0 && (
              <>
                <button onClick={onSubmit}>Submit</button>
              </>
            )}
          </>
        )}

        {errorSamples.length > 0 && (
          <>
            {JSON.stringify(errorSamples)}
          </>
        )}

        <div className="mx-4 my-5">
          <table className="w-full text-lg border-separate border-spacing-y-1 max-h-[50vh] overflow-y-auto">
            <thead>
              <tr className="bg-[rgb(131,182,94)] text-gray-100 font-extralight">
                <th className="py-2 rounded-l-xl border-dotted border-black border-r-2">CBHDonorID</th>
                <th className="py-2 border-dotted border-black border-r-2">CBHSampleID</th>
                <th className="py-2 border-dotted border-black border-r-2">Matrix</th>
                <th className="py-2 border-dotted border-black border-r-2">Quantity</th>
                <th className="py-2 border-dotted border-black border-r-2">Unit</th>
                <th className="py-2 border-dotted border-black border-r-2">Age</th>
                <th className="py-2 border-dotted border-black border-r-2">Gender</th>
                <th className="py-2 rounded-r-xl">Price</th>
              </tr>
            </thead>
            <tbody>
              {samples?.map((sample, index) => (
                <tr key={index} className="text-center">
                  <td className="py-2 px-3 bg-gray-300 rounded-l-xl">{sample.CBH_Donor_ID}</td>
                  <td className="py-2 px-3 bg-gray-300">{sample.CBH_Sample_ID}</td>
                  <td className="py-2 px-3 bg-gray-300">{sample.Matrix}</td>
                  <td className="py-2 px-3 bg-gray-300">{sample.Quantity}</td>
                  <td className="py-2 px-3 bg-gray-300">{sample.Unit}</td>
                  <td className="py-2 px-3 bg-gray-300">{sample.Age}</td>
                  <td className="py-2 px-3 bg-gray-300">{sample.Gender}</td>
                  <td className="py-2 px-3 bg-gray-300 rounded-r-xl">{sample.Price} €</td> 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Home;
