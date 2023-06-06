import { type NextPage } from "next";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { api } from "~/utils/api";
import Excel from 'exceljs';
import { type Samples } from "@prisma/client";
import cuid from "cuid";
import { SampleSchema } from "~/common/database/samples";
import Sidebar from "~/components/sidebar";
import { signIn, useSession } from "next-auth/react";

const Home: NextPage = () => {
  const { data: session } = useSession()

  if(!session){
    return (
      <div>
        <p>You are not signed in.</p>
        <button onClick={() => void signIn()}>Sign in</button>
      </div>
    )
  }

  return (
    <div className="flex flex-row max-w-[100vw] max-h-[100vh] overflow-x-hidden overflow-y-hidden font-poppins">
      <Sidebar/>
      <Import/>
    </div>
  )
}

const Import: React.FC = () => {
  // General Table
  const [pagelength,] = useState<number>(100)
  const [search, setSearch] = useState<string>("")

  // API Requests
  const upload = api.samples.create.useMutation()
  const uploadMany = api.samples.createMany.useMutation()
  const createDonorID = api.donoridmapping.create.useMutation()
  const createMasterID = api.masteridmapping.create.useMutation()
  const createSampleID = api.sampleidmapping.create.useMutation()
  const { data: sampleIDs, refetch: refetchSampleID } = api.sampleidmapping.getAll.useQuery()
  const { data: donorIDs, refetch: refetchDonorID } = api.donoridmapping.getAll.useQuery()
  const { data: masterIDs, refetch: refetchMasterID } = api.masteridmapping.getAll.useQuery()
  const { data: currentDonorID, refetch: refetchCurrentDonorID } = api.samples.sortDonor.useQuery()
  const { data: currentMasterID, refetch: refetchCurrentMasterID } = api.samples.sortMaster.useQuery()
  const { data: currentSampleID, refetch: refetchCurrentSampleID } = api.samples.sortSample.useQuery()
  

  // File Reader
  const [input, setInput] = useState<File | undefined>(undefined)
  const [startRow, setStartRow] = useState<number>(1)
  const [header, setHeader] = useState<string[]>([])
  const [rawSamples, setRawSamples] = useState<string[][]>([])
  const [newSamples, setNewSamples] = useState<Samples[]>([])
  const [errorSamples, setErrorSamples] = useState<Samples[]>([])
  const [mappings, setMappings] = useState<(number | undefined)[]>([])
  const [donorNumber, setDonorNumber] = useState<number>(0)
  const [masterNumber, setMasterNumber] = useState<number>(0)
  const [sampleNumber, setSampleNumber] = useState<number>(0)

  type SampleKey = keyof typeof newSamples[0];

  useEffect(() => {
    if (mappings.length < Object.getOwnPropertyNames(SampleSchema.shape).length - 1) {
      const tempArray = [] 
      for (let i = 0; i < Object.getOwnPropertyNames(SampleSchema.shape).length - 1; i ++) {
        tempArray.push(undefined)
      }
      setMappings(tempArray)
    }
  }, [])

  useEffect(() => {
    void refetchCurrentDonorID()
    void refetchCurrentMasterID()
    void refetchCurrentSampleID()
    void refetchDonorID()
    void refetchMasterID()
    void refetchSampleID()
  }, [input, refetchCurrentDonorID, refetchCurrentMasterID, refetchCurrentSampleID, refetchDonorID, refetchMasterID, refetchSampleID])

  useEffect(() => {
    setDonorNumber(currentDonorID ? Number(currentDonorID?.CBH_Donor_ID?.slice(4)) + 1 : 1000000)
  }, [currentDonorID])

  useEffect(() => {
    setMasterNumber(currentMasterID ? Number(currentMasterID?.CBH_Master_ID?.slice(4)) + 1 : 1000000)
  }, [currentMasterID])

  useEffect(() => {
    setSampleNumber(currentSampleID ? Number(currentSampleID?.CBH_Sample_ID?.slice(4)) + 1 : 1000000)
  }, [currentSampleID])
  
  function handleOnDrag(e: React.DragEvent, index: number) {
    e.dataTransfer.setData("index", index.toString());
  }

  function handleOnDrop(e: React.DragEvent, targetIndex: number) {
    const index = Number(e.dataTransfer.getData("index"));
    const tempMappings = [...mappings];

    tempMappings[targetIndex] = index
    setMappings(tempMappings)
  }

  function handleDragOver(e: React.DragEvent) {
    e.stopPropagation();
    e.preventDefault();
  }

  function castStringToNumber(inputString: string): number {
    // Remove letters and special characters using regex
    const cleanedString = inputString.replace(/[^0-9.-]+/g, '');
  
    // Cast the cleaned string to a number
    const numberValue = parseFloat(cleanedString);
  
    return numberValue;
  }

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
      
        const reader = new FileReader();
        
        reader.readAsText(input);
        reader.onload = () => {
          const csvData = reader.result as string;

          if(csvData){
            const rows = csvData.split("\n");
            const tempSampleArray = [];
          
            if (rows.length > 0) {
            // Assuming the header is in the first row
              const tempHeader = rows[0]?.split(";") || []; // fallback value if undefined, so always valid arrays
              setHeader(tempHeader);
            
              for (let i = 1; i < rows.length; i++) {
                const rowData = rows[i]?.split(";") || [];
                const tempSample = [];
            
                for (let j = 0; j < tempHeader.length; j++) {
                  tempSample.push(rowData[j] || ""); // Push empty string if no value present
                }
            
                tempSampleArray.push(tempSample);
              }
            }
          
            setRawSamples(tempSampleArray);
          }
        };
        
      } else {
        alert("Filetype not supported. Try uploading data in Excel or csv format.")
      }
    } else {
      alert("No File selected")
    }
  }

  function mapColumns (): void {
    const objectsToCreate: Samples[] = [];

    // Wenn wir eine neue ID erstellen, aber sich nachfolgend im Input Array noch weitere Einträge mit gleicher AusgangsID befinden, so würden diese alle auf unterschiedliche IDs gemappt
    // werden, weil die Datenbank in der ZWischenzeit nicht nochmal gefetcht wird. Deswegen werden temporär alle neuen Arrays schonmal in ein lokales Array geschrieben, während sie
    // parallel zusätzlich noch in der Datenbank ergänzt werden
    const tempDonorIDs = donorIDs ? [...donorIDs] : []
    const tempMasterIDs = masterIDs ? [...masterIDs] : []
    const tempSampleIDs = sampleIDs ? [...sampleIDs] : []

    /*const isLastEntryEmpty = async (): Promise<boolean> => {
      // Fetch the data from your data source using Prisma
      const data = await api.samples.getMany.useQuery();
    
      // Check if the data array is empty
      if (data.length === 0) {
        return false; // Data array is empty, so the last entry is not empty
      }
    
      // Get the last entry from the data array
      const lastEntry = data[data.length - 1];
    
      // Check if the last entry is empty
      const isEmpty = Object.keys(lastEntry).every((key) => {
        const value = lastEntry[key];
        return value === null || value === undefined || value === '';
      });
    
      return isEmpty;
    };*/

    function parseDate(dateValue: string): Date | null{
      const slashSeperated = /\d{2}\/\d{2}\/\d{4}/;
      const dotSeperated = /\d{2}\.\d{2}\.\d{4}/;
      const hyphenSeperated = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

      if (slashSeperated.test(dateValue)) {
        const [month, day, year] = dateValue.split("/");
        return new Date(`${year}-${month}-${day}T00:00:00`);
      }

      if (dotSeperated.test(dateValue)) {
        const [day, month, year] = dateValue.split(".");
        return new Date(`${year}-${month}-${day}T00:00:00`);
      }

      if (hyphenSeperated.test(dateValue)) {
        return new Date(dateValue);
      }

      return null;
    }

    let tempDonorNumber = donorNumber
    let tempMasterNumber = masterNumber
    let tempSampleNumber = sampleNumber

    // Die Funktionen sind jetzt in die mapColumns Method egewandert, um Zugriff die IDs und Arrays über sch zu haben
    function donorMapping (donorID: string | undefined, inputID: string | undefined): string {
      if(donorID !== undefined)
      {
        return donorID;
      } 
      else 
      {
        const newDonorID = "CBHD" + tempDonorNumber.toString()
        tempDonorNumber++
  
        // Test, if the input had an ID assigned and only then create a new mapping
        if(inputID !== undefined){
          tempDonorIDs.push({id: "", Input_Donor_ID: inputID, Mapped_Donor_ID: newDonorID})
          // API Request to create new entry here
          
          try {
            createDonorID.mutate({
              Input_Donor_ID: inputID,
              Mapped_Donor_ID: newDonorID,
            });
            
            return newDonorID;
          }catch (error) {
            console.error('API request error:', error);
            throw error;
          }
        }
      
        return newDonorID
      }
    }
  
    function masterMapping (masterID: string | undefined, inputID: string | undefined): string {
      if(masterID !== undefined)
      {
        return masterID;
      }
      else 
      {
        const newMasterID = "CBHM" + tempMasterNumber.toString()
        tempMasterNumber++
  
        // Test, if the input had an ID assigned and only then create a new mapping
        if(inputID !== undefined){
          tempMasterIDs.push({id: "", Input_Master_ID: inputID, Mapped_Master_ID: newMasterID})
          // API Request to create new entry here
          try {
            createMasterID.mutate({
              Input_Master_ID: inputID,
              Mapped_Master_ID: newMasterID,
            });
            
            return newMasterID;
          }catch (error) {
            console.error('API request error:', error);
            throw error;
          }
        }
        return newMasterID
      }
    }
  
    function sampleMapping (sampleID: string | undefined, inputID: string | undefined): string {
      if(sampleID !== undefined){
        return sampleID;
      }
      else 
      {
        const newSampleID = "CBHS" + tempSampleNumber.toString()
        tempSampleNumber++
  
        // Test, if the input had an ID assigned and only then create a new mapping
        if(inputID !== undefined){
          tempSampleIDs.push({id: "", Input_Sample_ID: inputID, Mapped_Sample_ID: newSampleID})
          // API Request to create new entry here
          try {
            createSampleID.mutate({
              Input_Sample_ID: inputID,
              Mapped_Sample_ID: newSampleID,
            });
            
            return newSampleID;
          }catch (error) {
            console.error('API request error:', error);
            throw error;
          }
        }
        return newSampleID;
      }
    }
  
    rawSamples.forEach((sample, index) => {
      if (index === rawSamples.length -1) {
        const LastLine: String[] = [];
        for(let i = 0; i < sample.length; i++){
          LastLine.push("");
        }
        console.log((sample));
        console.log((LastLine));
        console.log(JSON.stringify(sample) === JSON.stringify(LastLine));
        if (JSON.stringify(sample) === JSON.stringify(LastLine)) {
          return false;
        }
      }
      const donorID = tempDonorIDs.find(c => (mappings[0] !== undefined && sample[mappings[0]] !== "") ? c.Input_Donor_ID ===  sample[mappings[0]] ?? null : false);
      const masterID = tempMasterIDs.find(c => (mappings[1] !== undefined && sample[mappings[1]] !== "") ? c.Input_Master_ID ===  sample[mappings[1]] ?? null : false);
      const sampleID = tempSampleIDs.find(c => (mappings[2] !== undefined && sample[mappings[2]] !== "") ? c.Input_Sample_ID ===  sample[mappings[2]] ?? null : false);

      const dateValue = (mappings[50] !== undefined && sample[mappings[50]] !== "") ? parseDate(String(sample[mappings[50]])) ?? null : null;
  
      const newObject = {
        id: cuid(),
        CBH_Donor_ID: donorMapping(donorID?.Mapped_Donor_ID, (mappings[0] !== undefined && sample[mappings[0]] !== "") ? sample[mappings[0]] : undefined),
        CBH_Master_ID: masterMapping(masterID?.Mapped_Master_ID, (mappings[1] !== undefined && sample[mappings[1]] !== "") ? sample[mappings[1]] : undefined),
        CBH_Sample_ID: sampleMapping(sampleID?.Mapped_Sample_ID, (mappings[2] !== undefined && sample[mappings[2]] !== "") ? sample[mappings[2]] : undefined),
        Price: (mappings[3] !== undefined && sample[mappings[3]] !== "") ? castStringToNumber(sample[mappings[3]] as string) || null : null,
        Quantity: (mappings[4] !== undefined && sample[mappings[4]] !== "") ? castStringToNumber(sample[mappings[4]] as string) || null : null,
        Unit: (mappings[5] !== undefined && sample[mappings[5]] !== "") ? sample[mappings[5]] ?? null : null,
        Matrix: (mappings[6] !== undefined && sample[mappings[6]] !== "") ? sample[mappings[6]] ?? null : null,
        Storage_Temperature: (mappings[7] !== undefined && sample[mappings[7]] !== "") ? sample[mappings[7]] ?? null : null,
        Freeze_Thaw_Cycles: (mappings[8] !== undefined && sample[mappings[8]] !== "") ? castStringToNumber(sample[mappings[8]] as string) || null : null,    
        Sample_Condition: (mappings[9] !== undefined && sample[mappings[9]] !== "") ? sample[mappings[9]] ?? null : null,       
        Infectious_Disease_Test_Result: (mappings[10] !== undefined && sample[mappings[10]] !== "") ? sample[mappings[10]] ?? null : null,       
        Gender: (mappings[11] !== undefined && sample[mappings[11]] !== "") ? sample[mappings[11]] ?? null : null,       
        Age: (mappings[12] !== undefined && sample[mappings[12]] !== "") ? castStringToNumber(sample[mappings[12]] as string) || null : null,       
        Ethnicity: (mappings[13] !== undefined && sample[mappings[13]] !== "") ? sample[mappings[13]] ?? null : null,       
        BMI: (mappings[14] !== undefined && sample[mappings[14]] !== "") ? castStringToNumber(sample[mappings[14]] as string) || null : null,        
        Lab_Parameter: (mappings[15] !== undefined && sample[mappings[15]] !== "") ? sample[mappings[15]] ?? null : null, 
        Result_Interpretation: (mappings[16] !== undefined && sample[mappings[16]] !== "") ? sample[mappings[16]] ?? null : null,       
        Result_Raw: (mappings[17] !== undefined && sample[mappings[17]] !== "") ? sample[mappings[17]] ?? null : null,        
        Result_Numerical: (mappings[18] !== undefined && sample[mappings[18]] !== "") ? castStringToNumber(sample[mappings[18]] as string) || null : null,        
        Result_Unit: (mappings[19] !== undefined && sample[mappings[19]] !== "") ? sample[mappings[19]] ?? null : null,       
        Cut_Off_Raw: (mappings[20] !== undefined && sample[mappings[20]] !== "") ? sample[mappings[20]] ?? null : null,       
        Cut_Off_Numerical: (mappings[21] !== undefined && sample[mappings[21]] !== "") ? castStringToNumber(sample[mappings[21]] as string) || null : null,       
        Test_Method: (mappings[22] !== undefined && sample[mappings[22]] !== "") ? sample[mappings[22]] ?? null : null,        
        Test_System: (mappings[23] !== undefined && sample[mappings[23]] !== "") ? sample[mappings[23]] ?? null : null,        
        Test_System_Manufacturer: (mappings[24] !== undefined && sample[mappings[24]] !== "") ? sample[mappings[24]] ?? null : null,        
        Result_Obtained_From: (mappings[25] !== undefined && sample[mappings[25]] !== "") ? sample[mappings[25]] ?? null : null,        
        Diagnosis: (mappings[26] !== undefined && sample[mappings[26]] !== "") ? sample[mappings[26]] ?? null : null,        
        Diagnosis_Remarks: (mappings[27] !== undefined && sample[mappings[27]] !== "") ? sample[mappings[27]] ?? null : null,        
        ICD_Code: (mappings[28] !== undefined && sample[mappings[28]] !== "") ? sample[mappings[28]] ?? null : null,        
        Pregnancy_Week: (mappings[29] !== undefined && sample[mappings[29]] !== "") ? castStringToNumber(sample[mappings[29]] as string) || null : null,        
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
      }

      try {
        SampleSchema.parse(newObject)
        objectsToCreate.push(newObject)
      } catch (error) {
        newObject.Date_of_Collection = null

        try {
          SampleSchema.parse(newObject)
          objectsToCreate.push(newObject)
        } catch(error) {
          errorSamples.push(newObject)
          console.error(error)
        }
      }
    })
  
    setDonorNumber(tempDonorNumber)
    setMasterNumber(tempMasterNumber)
    setSampleNumber(tempSampleNumber)
    
    setNewSamples(objectsToCreate)
  }

  function onSubmit() {
    const uploadSamples: Samples[][] = []
    const size = 200

    // Weil ein zu großes Array die maximalen Beschränkungen für einen HTTP Body überschreitet, wird das große Array hier in kleinere Arrays unterteilt, die jeweils mit 1 Sekunfde Delay
    // nacheinander ausgeführt werden, um so die Datenbank nicht zu überlasten
    for (let i = 0; i < newSamples.length; i += size) {
      uploadSamples.push(newSamples.slice(i, i + size));
    }

    uploadSamples.forEach((samples, i) => {
      setTimeout(() => uploadFunction(samples), i * 5000)
    })
  }

  function uploadFunction(uploadSamples: Samples[]){
    const errors: Samples[] = []

    uploadSamples.forEach((sample) => {      
      upload.mutate(sample)

      if(upload.isError){
        errors.push(sample)
      }
    })
    //uploadMany.mutate(uploadSamples)

    setErrorSamples([...errorSamples, ...errors])
  }

  function getColumnName(index: number) : string {
    const temp = mappings[index];
    if (temp !== undefined) {
      return header[temp] ?? ""
    } else {
      return ""
    }
  }

  function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName]
  }

  return (
    <>
      <Head>
        <title>CBH Harmonizer</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col pl-5 pr-10 py-5 text-lg max-w-[100vw] overflow-x-hidden overflow-y-scroll">
        <h1 className="text-6xl font-semibold text-[#164A41] mb-5">Upload</h1>
        
        {/*<div className="flex flex-row gap-3 mx-4">
          <input type="file" accept=".xlsx,.csv" onChange={(e) => setInput(e.target.files !== null ? e.target.files[0] : undefined)}></input>
          <input type="number" onChange={(e) => setStartRow(Number(e.target.value) ?? 1)} className="border-2 border-black py-1" placeholder="Start Column"></input>
          <button onClick={readFile} className="bg-green-300 rounded-xl px-3 py-1">Read File</button>
        </div>*/}

        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolor in maxime saepe autem! Reprehenderit ab, et fugiat doloremque aliquam corrupti illum cumque deserunt quasi iure accusantium sunt qui incidunt alias.
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis, sint harum nesciunt impedit, exercitationem hic, accusamus aliquam ea consequuntur autem error? Excepturi nam culpa a obcaecati est? Saepe, vero nemo.
        </p>

        {/* Phase 1 */}
        <div className="grid grid-flow-col grid-cols-10 mt-4 mb-2">
          <div className="flex flex-row justify-center items-center">
            <div className="flex bg-[#4D774E] rounded-full w-[4vw] h-[4vw] text-center items-center justify-center">
              <h1 className="text-white text-4xl">1</h1>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2 col-span-9">
            <h1 className="text-[#4D774E] text-4xl">Choosing your data</h1>
          </div>  
        </div>
        <p className="ml-36 mb-3">
          Simply choose the file you want to upload. Currently only .xlsx and .csv files are supported. When uploading an Excel file, please also specify in which row your header is placed. This is the row with all column names in it. Once you are done click the &quot;Read File&quot; button to continue with the next step.
        </p>
        <div className="flex flex-row items-center gap-10 ml-36 mt-3 justify-stretch">
          <div className="flex flex-row gap-3 items-center min-w-[50%]">
            <input type="file" accept=".xlsx,.csv" onChange={(e) => setInput(e.target.files !== null ? e.target.files[0] : undefined)} className="relative m-0 block min-w-10 flex-auto rounded-xl border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-600 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-500 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-500 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"/>
          </div>
          <div className={`flex flex-row items-center ${input?.name.endsWith(".xlsx") ? "text-black" : "text-gray-400"}`}>
            <label className="bg-neutral-700 py-1 text-white px-3 rounded-l-xl font-extralight whitespace-nowrap">Starting row</label>
            <input type="number" disabled={input?.name.endsWith(".xlsx") ? false : true} onChange={(e) => setStartRow(Number(e.target.value) ?? 1)} className="relative min-w-0 m-0 block min-w-10 flex-auto rounded-r-xl border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-600 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-500 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-500 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary" placeholder="Starting row"></input>
          </div>
          <button onClick={readFile} className="bg-[#4D774E] hover:bg-[#7da37d] transition duration-300 ease-in-out px-5 py-1 w-full text-white rounded-xl">Read File</button>
        </div>
        
        {/* Phase 2 */}
        <div className="grid grid-flow-col grid-cols-10 mt-8 mb-2">
          <div className="flex flex-row justify-center items-center">
            <div className="flex bg-[#4D774E] rounded-full w-[4vw] h-[4vw] text-center items-center justify-center">
              <h1 className="text-white text-4xl">2</h1>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2 col-span-9">
            <h1 className="text-[#4D774E] text-4xl">Preparing your data for upload</h1>
          </div>  
        </div>
        {/* Drag and Drop Elements */}
        <div>
          <div className="flex flex-wrap flex-row ml-36 my-5 justify-center gap-2">
            {header.map((head, index) => (
              <div key={index} draggable onDragStart={(e) => handleOnDrag(e, index)} className={` px-3 py-1 rounded-2xl ${(search !== "" && head.toLowerCase().includes(search)) ? "bg-[rgb(131,182,94)]" : "bg-gray-300"}`}>
                {head}
              </div>
            ))}
          </div>

          <div className="ml-36 flex flex-row justify-center gap-20">
            <div className="flex flex-row">
              <label className="bg-neutral-700 py-1 text-white px-3 rounded-l-xl font-extralight whitespace-nowrap">Search</label>
              <input className="relative min-w-0 m-0 block min-w-10 flex-auto rounded-r-xl border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-600 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-500 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-500 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary" value={search} onChange={(e) => setSearch(e.target.value)}></input>
            </div>
          </div>

          {/* Mappings Table */}
          <div className="ml-36 my-5 max-h-[50vh] overflow-y-scroll">
            <div className="flex flex-row justify-between">
              <table>
                <thead>
                  <tr className="text-white">
                    <th className="w-[12vw] font-light bg-[#4D774E] py-1 rounded-tl-xl">Database Column</th>
                    <th className="w-[12vw] font-light bg-[#4D774E] py-1 rounded-tr-xl">Input Column</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.getOwnPropertyNames(SampleSchema.shape).map((name, i) => {
                    if(i !== 0 && i < Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3)){
                      return(
                        <tr key={i}>
                          <td className={`bg-gray-300 text-center border-t-2 border-r-2 border-white px-2 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3) -1 ? "pb-1 rounded-bl-xl" : ""}`}>{name.replaceAll("_", " ")}</td>
                          <td className={`bg-gray-300 border-t-2 border-white px-2 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3) -1 ? "pb-1 rounded-br-xl" : ""}`}>
                            <div className='min-h-[2rem] h-auto w-[11vw] text-gray-600' onDrop={(e) => handleOnDrop(e, i-1)} onDragOver={handleDragOver}> {getColumnName(i-1)} </div>           
                          </td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </table>

              <table>
                <thead>
                  <tr className="text-white">
                    <th className="w-[12vw] font-light bg-[#4D774E] py-1 rounded-tl-xl">Database Column</th>
                    <th className="w-[12vw] font-light bg-[#4D774E] py-1 rounded-tr-xl">Input Column</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.getOwnPropertyNames(SampleSchema.shape).map((name, i) => {
                    if(i >= Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3) && i < Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3 * 2)){
                      return(
                        <tr key={100 + i}>
                          <td className={`bg-gray-300 text-center border-t-2 border-r-2 border-white px-2 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3 * 2) -1 ? "pb-1 rounded-bl-xl" : ""}`}>{name.replaceAll("_", " ")}</td>
                          <td className={`bg-gray-300 text-center border-t-2 border-white px-2 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3 * 2) -1 ? "pb-1 rounded-br-xl" : ""}`}>
                            <div className='min-h-[2rem] h-auto w-[11vw] text-gray-600' onDrop={(e) => handleOnDrop(e, i-1)} onDragOver={handleDragOver}> {getColumnName(i-1)} </div>              
                          </td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </table>

              <table>
                <thead>
                  <tr className="text-white">
                    <th className="w-[12vw] font-light bg-[#4D774E] py-1 rounded-tl-xl">Database Column</th>
                    <th className="w-[12vw] font-light bg-[#4D774E] py-1 rounded-tr-xl">Input Column</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.getOwnPropertyNames(SampleSchema.shape).map((name, i) => {
                    if(i >= Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3 * 2)){
                      return(
                        <tr key={1000 + i}>
                          <td className={`bg-gray-300 text-center border-t-2 border-r-2 border-white px-2 ${i === Object.getOwnPropertyNames(SampleSchema.shape).length -1 ? "pb-1 rounded-bl-xl" : ""}`}>{name.replaceAll("_", " ")}</td>
                          <td className={`bg-gray-300 text-center border-t-2 border-white px-2 ${i === Object.getOwnPropertyNames(SampleSchema.shape).length -1 ? "pb-1 rounded-br-xl" : ""}`}>
                            <div className='min-h-[2rem] h-auto w-[11vw] text-gray-600' onDrop={(e) => handleOnDrop(e, i-1)} onDragOver={handleDragOver}> {getColumnName(i-1)} </div>              
                          </td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex flex-row w-full justify-center">
          <button className="bg-[#4D774E] hover:bg-[#7da37d] w-fit transition duration-300 ease-in-out ml-36 px-10 py-1 text-white rounded-xl" onClick={mapColumns}>Apply Mappings</button>
        </div>

        {/* Phase 3 */}
        <div className="grid grid-flow-col grid-cols-10 mt-8 mb-2">
          <div className="flex flex-row justify-center items-center">
            <div className="flex bg-[#4D774E] rounded-full w-[4vw] h-[4vw] text-center items-center justify-center">
              <h1 className="text-white text-4xl">3</h1>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2 col-span-9">
            <h1 className="text-[#4D774E] text-4xl">Final check and upload</h1>
          </div>  
        </div>

        <div className="ml-36 w-[75vw]">
          <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {Object.getOwnPropertyNames(SampleSchema.shape).map((name,i) => {
                  if(i > 0){
                    return(
                      <th key={2000 + i} className={`bg-[#4D774E] whitespace-nowrap font-extralight text-white px-2 py-1 ${i === 1 ? "rounded-tl-xl" : i === Object.getOwnPropertyNames(SampleSchema.shape).length -1 ? "rounded-tr-xl" : ""}`}>{name.replaceAll("_"," ")}</th>
                    )
                  }
                })}
              </tr>
            </thead>
            <tbody>
              {newSamples.map((sample, i) => {
                if(i < 5){
                  return (
                    <tr key={3000 + i}>
                      {Object.getOwnPropertyNames(SampleSchema.shape).map((name, j) => {
                        if(j > 0){
                          return (
                            <td key={4000 + j} className="py-2 px-3 bg-gray-300">{getProperty(sample, name as SampleKey)?.toString()}</td>
                          )
                        }
                      })}
                    </tr>
                  )
                }
              })}
            </tbody>
          </table>
          </div>
        </div>

        <div className="flex flex-row w-full justify-center">
          <button className="bg-[#4D774E] hover:bg-[#7da37d] mt-3 w-fit transition duration-300 ease-in-out ml-36 px-10 py-1 text-white rounded-xl" onClick={onSubmit}>Submit</button>
        </div>


        {errorSamples.length > 0 && (
          <div className="overflow-x-auto">
            {JSON.stringify(errorSamples)}
          </div>
        )}
      </main>
    </>
  );
};

export default Home;
