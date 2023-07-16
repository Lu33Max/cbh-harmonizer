import { type NextPage } from "next";
import Head from "next/head";
import React, { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { api } from "~/utils/api";
import Excel from 'exceljs';
import { type Samples } from "@prisma/client";
import cuid from "cuid";
import { ExampleSample, SampleSchema } from "~/common/database/samples";
import Sidebar from "~/components/sidebar";
import { useSession } from "next-auth/react";
import { Login } from "~/components/login";

const Home: NextPage = () => {
  const { data: session } = useSession()
  const [mappings, setMappings] = useState<(number[] | null)[]>([])
  const [delimiters, setDelimiters] = useState<(string | null)[]>([])

  if(!session){
    return (
      <div>
        <Login/>
      </div>
    )
  }
  
  return (
    <div className="flex flex-row max-w-[100vw] max-h-[100vh] overflow-x-hidden overflow-y-hidden font-poppins">
      <Sidebar mappings={mappings} setMapping={setMappings} />
      <Import mappings={mappings} setMappings={setMappings} delimiters={delimiters} setDelimiters={setDelimiters}/>
    </div>
  )
  
}

type props = {
  mappings: (number[] | null)[],
  setMappings: Dispatch<SetStateAction<(number[] | null)[]>>
  delimiters: (string | null)[],
  setDelimiters: Dispatch<SetStateAction<(string | null)[]>>
}

const Import: React.FC<props> = ({mappings, setMappings, delimiters, setDelimiters}) => {
  // General Table
  const [search, setSearch] = useState<string>("")

  // API Requests
  const upload = api.samples.create.useMutation()
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
  const [header, setHeader] = useState<(string | undefined)[]>([])
  const [rawSamples, setRawSamples] = useState<string[][]>([])
  const [newSamples, setNewSamples] = useState<Samples[]>([])
  const [errorSamples, setErrorSamples] = useState<Samples[]>([])
  const [donorNumber, setDonorNumber] = useState<number>(0)
  const [masterNumber, setMasterNumber] = useState<number>(0)
  const [sampleNumber, setSampleNumber] = useState<number>(0)

  const [dragging, setDragging] = useState(false);

  type SampleKey = keyof typeof newSamples[0];

  useEffect(() => {
    if (mappings.length < Object.getOwnPropertyNames(SampleSchema.shape).length - 1) {
      const tempArray = [] 
      for (let i = 0; i < Object.getOwnPropertyNames(SampleSchema.shape).length - 1; i ++) {
        tempArray.push(null)
      }
      setMappings(tempArray)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setDragging(true);
  }

  function handleOnDrop(e: React.DragEvent, targetIndex: number) {
    const index = Number(e.dataTransfer.getData("index"));
    const tempMappings = [...mappings];

    if (tempMappings[targetIndex] == null) {
      tempMappings[targetIndex] = []
      tempMappings[targetIndex]?.push(index)
    } else {
      if (tempMappings[targetIndex]?.includes(index)) {
        if (tempMappings[targetIndex]?.length == 1) {
          tempMappings[targetIndex] = null
        } else {
          const temp = tempMappings[targetIndex]?.indexOf(index)
          tempMappings[targetIndex]?.splice(temp as number,1)
        }
      } else {
        tempMappings[targetIndex]?.push(index)
      }
    }
  
    setMappings(tempMappings);
    setDragging(false);
  }

  function handleDragEnd() {
    setDragging(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.stopPropagation();
    if (dragging) {
      e.preventDefault();
    }
  }

  function handleDelete(index: number) {
    const tempMappings = [...mappings];
    tempMappings[index] = null;
    setMappings(tempMappings);
  }

  function changeDelimiter(delimiter: string, index: number) {
      const tempDelimiters = [...delimiters];

      tempDelimiters.slice(0, index), delimiter
      setDelimiters(tempDelimiters)
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
                    const tempHeader: (string | undefined)[] = []

                    row.eachCell((cell) => {
                      tempHeader.push(cell.text)
                    })

                    tempHeader.push(undefined)

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

    function parseDate(input: string[], index: number): (Date | null){
      const cols = mappings[index]
      if (cols && cols[0]) {
        const col = cols[0]
        const dateValue: string = col && input[col] ? input[col] ?? "" : ""
  
        const slashSeperated = /\d{2}\/\d{2}\/\d{4}/;
        const dotSeperated = /\d{2}\.\d{2}\.\d{4}/;
        const hyphenSeperated = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
        const yearOnly = /^\d{4}$/;
        const yearAndMonth = /^\d{4}-\d{2}$/;
        const yearAndMonthSlashSeperated = /^\d{4}\/\d{2}$/;
        const yearAndMonthDotSeperated = /^\d{4}\.\d{2}$/;
        const monthAndDaySwitchedSlashSeperated = /\d{2}\/\d{2}\/\d{4}/;
        const monthAndDaySwitchedDotSeperated = /\d{2}\.\d{2}\.\d{4}/;
        const monthAndYear = /\d{2}$-\d{4}$/;
        const monthAndYearSlashSeperated = /\d{2}$\/\d{4}$/;
        const monthAndYearDotSeperated = /\d{2}$\.\d{4}$/;
  
        if (slashSeperated.test(dateValue)) {
          const [month, day, year] = dateValue.split("/");
          return new Date(`${year ?? "2022"}-${month ?? "01"}-${day ?? "01"}T00:00:00`);
        }
  
        if (monthAndDaySwitchedSlashSeperated.test(dateValue)) {
          const [day, month, year] = dateValue.split("/");
          return new Date(`${year ?? "2022"}-${month ?? "01"}-${day ?? "01"}T00:00:00`);
        }
  
        if (dotSeperated.test(dateValue)) {
          const [day, month, year] = dateValue.split(".");
          return new Date(`${year ?? "2022"}-${month ?? "01"}-${day ?? "01"}T00:00:00`);
        }
  
        if (monthAndDaySwitchedDotSeperated.test(dateValue)) {
          const [month, day, year] = dateValue.split(".");
          return new Date(`${year ?? "2022"}-${month ?? "01"}-${day ?? "01"}T00:00:00`);
        }
  
        if (hyphenSeperated.test(dateValue)) {
          return new Date(dateValue);
        }
  
        if (yearOnly.test(dateValue)) {
          return new Date(`${dateValue}-01-01T00:00:00`);
        }
  
        if (yearAndMonth.test(dateValue)) {
          const [year, month] = dateValue.split("-");
          return new Date(`${year ?? "2022"}-${month ?? "01"}-01T00:00:00`);
        }
  
        if (yearAndMonthSlashSeperated.test(dateValue)) {
          const [year, month] = dateValue.split("/");
          return new Date(`${year ?? "2022"}-${month ?? "01"}-01T00:00:00`);
        }
  
        if (yearAndMonthDotSeperated.test(dateValue)) {
          const [year, month] = dateValue.split(".");
          return new Date(`${year ?? "2022"}-${month ?? "01"}-01T00:00:00`);
        }
  
        if (monthAndYear.test(dateValue)) {
          const [month, year] = dateValue.split("-");
          return new Date(`${year ?? "2022"}-${month ?? "01"}-01T00:00:00`);
        }
  
        if (monthAndYearSlashSeperated.test(dateValue)) {
          const [month, year] = dateValue.split("/");
          return new Date(`${year ?? "2022"}-${month ?? "01"}-01T00:00:00`);
        }
  
        if (monthAndYearDotSeperated.test(dateValue)) {
          const [month, year] = dateValue.split(".");
          return new Date(`${year ?? "2022"}-${month ?? "01"}-01T00:00:00`);
        }
      }

      return null;
    }

    let tempDonorNumber = donorNumber
    let tempMasterNumber = masterNumber
    let tempSampleNumber = sampleNumber

    // Die Funktionen sind jetzt in die mapColumns Method egewandert, um Zugriff die IDs und Arrays über sch zu haben
    function donorMapping(input: string[], index: number): (string | null) {
      const cols = mappings[index]
      let col = 0

      if (cols) {
        if (cols[0])
        col = cols[0]
      }

      const donorID = tempDonorIDs.find(c => (col !== undefined && col !== null && input[col] !== "") ? c.Input_Donor_ID ===  input[col] ?? null : false);
      const inputID = (col !== undefined && col !== null && input[col] !== "") ? input[col] ?? null : null

      if(donorID?.Mapped_Donor_ID !== undefined)
      {
        return donorID.Mapped_Donor_ID;
      } 
      else 
      {
        const newDonorID = "CBHD" + tempDonorNumber.toString()
        tempDonorNumber++
  
        // Test, if the input had an ID assigned and only then create a new mapping
        if(inputID !== null){
          tempDonorIDs.push({id: "", Input_Donor_ID: inputID, Mapped_Donor_ID: newDonorID})
          
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
  
    function masterMapping(input: string[], index: number): (string | null) {
      const cols = mappings[index]
      let col = 0

      if (cols) {
        if (cols[0])
        col = cols[0]
      }

      const masterID = tempMasterIDs.find(c => (col !== undefined && col !== null && input[col] !== "") ? c.Input_Master_ID === input[col] ?? null : false);
      const inputID = (col !== undefined && col !== null && input[col] !== "") ? input[col] ?? null : null

      if(masterID?.Mapped_Master_ID !== undefined)
      {
        return masterID.Mapped_Master_ID;
      }
      else 
      {
        const newMasterID = "CBHM" + tempMasterNumber.toString()
        tempMasterNumber++
  
        // Test, if the input had an ID assigned and only then create a new mapping
        if(inputID !== null){
          tempMasterIDs.push({id: "", Input_Master_ID: inputID, Mapped_Master_ID: newMasterID})

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
  
    function sampleMapping(input: string[], index: number): (string | null) {
      const cols = mappings[index]
      let col = 0

      if (cols) {
        if (cols[0])
        col = cols[0]
      }

      const sampleID = tempSampleIDs.find(c => (col !== undefined && col !== null && input[col] !== "") ? c.Input_Sample_ID === input[col] ?? null : false);
      const inputID = (col !== undefined && col !== null && input[col] !== "") ? input[col] ?? null : null

      if(sampleID?.Mapped_Sample_ID !== undefined){
        return sampleID.Mapped_Sample_ID;
      }
      else 
      {
        const newSampleID = "CBHS" + tempSampleNumber.toString()
        tempSampleNumber++
  
        // Test, if the input had an ID assigned and only then create a new mapping
        if(inputID !== null){
          tempSampleIDs.push({id: "", Input_Sample_ID: inputID, Mapped_Sample_ID: newSampleID})

          try {
            createSampleID.mutate({
              Input_Sample_ID: inputID,
              Mapped_Sample_ID: newSampleID,
            });
            
            return newSampleID;
          } catch (error) {
            console.error('API request error:', error);
            throw error;
          }
        }
        return newSampleID;
      }
    }

    function stringMapping(input: string[], index: number): (string | null) {
      const cols = mappings[index]
      let string = ""

      if (cols) {
        for (let i = 0; i < cols.length; i++) {
          const col = cols[i]

          string += (col !== undefined && col !== null && input[col] !== "") ? `${input[col] ?? ""}${delimiters[col] ?? ""}` : null
        }
      }

      return string
    }

    function numberMapping(input: string[], index: number): (number | null) {
      const cols = mappings[index]
      if (cols && cols[0]) {
        const col = cols[0]

        if(col !== undefined && col !== null && input[col] !== ""){
          if(/^\d+$/.test(input[col] ?? ""))
          {
            return Number(input[col])
          }
          else
          {
            return null
          }
        }
      }
      return null
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function generateID(input: string[], index: number): string {
      return cuid()
    }

    const functions = {
      id: generateID,
      CBH_Donor_ID: donorMapping,
      CBH_Master_ID: masterMapping,
      CBH_Sample_ID: sampleMapping,
      Price: numberMapping,
      Quantity: numberMapping,
      Unit: stringMapping,
      Matrix: stringMapping,
      Storage_Temperature: stringMapping,
      Freeze_Thaw_Cycles: numberMapping,
      Sample_Condition: stringMapping,
      Infectious_Disease_Test_Result: stringMapping,
      Gender: stringMapping,
      Age: numberMapping,
      Ethnicity: stringMapping,
      BMI: numberMapping,
      Lab_Parameter: stringMapping,
      Result_Interpretation: stringMapping,
      Result_Raw: stringMapping,
      Result_Numerical: numberMapping,
      Result_Unit: stringMapping,
      Cut_Off_Raw: stringMapping,
      Cut_Off_Numerical: numberMapping,
      Test_Method: stringMapping,
      Test_System: stringMapping,
      Test_System_Manufacturer: stringMapping,
      Result_Obtained_From: stringMapping,
      Diagnosis: stringMapping,
      Diagnosis_Remarks: stringMapping,
      ICD_Code: stringMapping,
      Pregnancy_Week: numberMapping,
      Pregnancy_Trimester: stringMapping,
      Medication: stringMapping,
      Therapy: stringMapping,
      Histological_Diagnosis: stringMapping,
      Organ: stringMapping,
      Disease_Presentation: stringMapping,
      TNM_Class_T: stringMapping,
      TNM_Class_N: stringMapping,
      TNM_Class_M: stringMapping,
      Tumour_Grade: stringMapping,
      Tumour_Stage: stringMapping,
      Viable_Cells__per_: stringMapping,
      Necrotic_Cells__per_: stringMapping,
      Tumour_Cells__per_: stringMapping,
      Proliferation_Rate__Ki67_per_: stringMapping,
      Estrogen_Receptor: stringMapping,
      Progesteron_Receptor: stringMapping,
      HER_2_Receptor: stringMapping,
      Other_Gene_Mutations: stringMapping,
      Country_of_Collection: stringMapping,
      Date_of_Collection: parseDate,
      Procurement_Type: stringMapping,
      Informed_Consent: stringMapping,
    }

    type FunctionKeys = keyof typeof functions
  
    rawSamples.forEach(sample => {
      let newObject: Samples = ExampleSample

      // Loop over every property of sample and execute according mapping method
      Object.getOwnPropertyNames(newObject).map((col, i) => {
        const mapper = getProperty(functions, col as FunctionKeys)
        newObject = {...newObject, [col]: mapper(sample, i-1)}
      })

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

  function onSubmitErrorSamples() {
    const uploadSamples: Samples[][] = []
    const size = 200

    // Weil ein zu großes Array die maximalen Beschränkungen für einen HTTP Body überschreitet, wird das große Array hier in kleinere Arrays unterteilt, die jeweils mit 1 Sekunfde Delay
    // nacheinander ausgeführt werden, um so die Datenbank nicht zu überlasten
    for (let i = 0; i < errorSamples.length; i += size) {
      uploadSamples.push(errorSamples.slice(i, i + size));
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
    const cols = mappings[index];
    let string = ""

    if (cols) {
      for (let i = 0; i < cols.length; i++) {
        const col = cols[i]

        if (i > 0) {
          string += ","
        }
        string += (col !== undefined && col !== null && header[col] !== undefined) ? ` ${header[col] || ""}` : ""
      }
    }

    return string
  }

  function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName]
  }

  type sampleKey = keyof typeof ExampleSample

  return (
    <>
      <Head>
        <title>CBH Harmonizer</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col pl-5 pr-10 py-5 text-lg max-w-[100vw] overflow-x-hidden overflow-y-scroll">
      <div className="flex flex-row w-full items-center justify-center ">
        <div className="w-full border-2 border-solid h-1 border-green-900 rounded-3xl m-5"></div>
        <h1 className="text-5xl mt-5 ml-5 mb-2 text-green-900 flex-grow flex-shrink-0 whitespace-nowrap"><b>UPLOAD TO DATABASE</b></h1>
        <div className="w-full border-2 border-solid h-1 border-green-900 rounded-3xl m-5"></div>
      </div>

        <p className="ml-36 mb-3 text-[#164A41]">
          Here you can upload your Excel or csv data into the database of Central BioHub. Simply follow all of the steps bellow and press Submit at the end of the page. Your data will be automatically converted into the specified format und uploaded directly into the database.
        </p>

        {/* Phase 1 */}
        <div className="grid grid-flow-col grid-cols-10 mt-4 mb-2">
          <div className="flex flex-row justify-center items-center">
            <div className="flex bg-[#9DC88D66] rounded-full w-[4vw] h-[4vw] text-center items-center justify-center">
              <h1 className="text-[#164A41] text-4xl">1</h1>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2 col-span-9">
            <h1 className="text-[#164A41] text-4xl">Choosing your data</h1>
          </div>  
        </div>
        <p className="ml-36 mb-3 text-[#164A41]">
          Simply choose the file you want to upload. Currently only .xlsx and .csv files are supported. When uploading an Excel file, please also specify in which row your header is placed. This is the row with all column names in it. Once you are done click the &quot;Read File&quot; button to continue with the next step.
        </p>
        <div className="flex flex-row items-center gap-10 ml-36 mt-3 justify-stretch">
          <div className="flex flex-row gap-3 items-center min-w-[40%]">
            <input type="file" accept=".xlsx,.csv" onChange={(e) => setInput(e.target.files !== null ? e.target.files[0] : undefined)} className="relative m-0 block min-w-10 flex-auto rounded-xl border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.2rem] font-bold text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-600 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-[#617e5766] focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-gray-400 dark:file:bg-[#9DC88D66] dark:file:text-[#164A41] dark:focus:border-primary"/>
          </div>
          <div className={`flex flex-row items-center ${input?.name.endsWith(".xlsx") ? "text-[#164A41]" : "text-gray-400"}`}>
            <label className="bg-[#9DC88D66] hover:bg-[#617e5766] py-[0.2rem] text-[#164A41] px-3 rounded-l-xl font-bold whitespace-nowrap border border-solid dark:border-neutral-600">Starting row</label>
            <input type="number" disabled={input?.name.endsWith(".xlsx") ? false : true} onChange={(e) => setStartRow(Number(e.target.value) ?? 1)} className="relative min-w-0 m-0 block min-w-10 flex-auto rounded-r-xl border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.2rem] font-bold text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-600 file:px-3 file:py-[0.2rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-500 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-500 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary" placeholder="Starting row"></input>
          </div>
          <button onClick={readFile} className="bg-[#F1B24A] hover:bg-[#fdc367a0] transition duration-300 ease-in-out px-15 py-1 w-full text-[#164A41] rounded-xl font-bold">Read File</button>
        </div>
        
        {/* Phase 2 */}
        <div className="grid grid-flow-col grid-cols-10 mt-8 mb-2">
          <div className="flex flex-row justify-center items-center">
            <div className="flex bg-[#9DC88D66] rounded-full w-[4vw] h-[4vw] text-center items-center justify-center">
              <h1 className="text-[#164A41] text-4xl">2</h1>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2 col-span-9">
            <h1 className="text-[#164A41] text-4xl">Preparing your data for upload</h1>
          </div>  
        </div>
        <p className="ml-36 mb-3 text-[#164A41]">
          Drag and drop the desired column into the matching database column in the tables bellow. You can use the search bar to highlight columns. Once you are done, press the &apos;Apply Mappings&apos; button to proceed to the next stage. Not seeing the correct columns? Try slecting a different starting column in the first step.
        </p>
        {/* Drag and Drop Elements */}
        <div>
          <div className="flex flex-wrap flex-row ml-36 my-5 justify-center gap-2">
            {header.map((head, index) => (
              <div key={index} draggable onDragStart={(e) => handleOnDrag(e, index)} onDragEnd={handleDragEnd} className={` px-3 py-1 rounded-2xl ${(search !== "" && head && head.toLowerCase().includes(search)) ? "bg-[rgb(131,182,94)]" : "bg-gray-300"}`}>
                {head}
              </div>
            ))}
          </div>

          <div className=" ml-10 flex flex-row justify-center gap-20">
            <div className="flex flex-row ">
              <label className="bg-[#9DC88D66] hover:bg-[#617e5766] py-[0.2rem] text-[#164A41] px-3 rounded-l-xl font-bold whitespace-nowrap border border-solid dark:border-neutral-600">Search</label>
              <input className="relative min-w-0 m-0 block min-w-10 flex-auto rounded-r-xl border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.2rem] text-base font-bold text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-600 file:px-3 file:py-[0.2rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-500 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-500 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary" value={search} onChange={(e) => setSearch(e.target.value)}></input>
            </div>
          </div>

          {/* Mappings Table */}
          <div className="my-5 ml-10 max-h-[50vh] overflow-y-scroll">
            <div className="flex flex-row justify-between">
              <table>
                <thead>
                  <tr className="text-white">
                    <th className="w-[12vw] font-light bg-[#164A41] py-1 rounded-tl-xl">Database Column</th>
                    <th className="w-[12vw] font-light bg-[#164A41] py-1 rounded-tr-xl">Input Column</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.getOwnPropertyNames(SampleSchema.shape).map((name, i) => {
                    if(i !== 0 && i < Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3)){
                      const type = getProperty(ExampleSample, name as sampleKey )
                      return(
                        <tr key={i}>
                          <td className={`bg-[#E6E6E6] text-center border-t-4 border-r-4 border-white px-4 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3) -1 ? "pb-1 rounded-bl-xl" : ""}`}>{name.replaceAll("_", " ")}</td>
                          <td className={`bg-[#E6E6E6] text-center border-t-4 border-white px-4 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3) -1 ? "pb-1 rounded-br-xl" : ""}`}>
                            <div className={`min-h-[2rem] h-auto w-[11vw] text-gray-600 transition-colors ease-in-out ${dragging ? "bg-[rgb(226,226,231)]" : ""}`} onDrop={(e) => handleOnDrop(e, i-1)} onDragOver={handleDragOver}>
                              <div className="flex">
                                <div className="relative">
                                <select onChange={(e) => changeDelimiter(e.target.value, i - 1)} className="block appearance-none w-7 py-1 px-1 pr-2 rounded leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="-">-</option>
                                    <option value=":">,</option>
                                    <option value=";">;</option>
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                      <path d="M10 12l-5-5 1.5-1.5L10 9.79l3.5-3.5L15 7z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className={`flex-grow ${getColumnName(i - 1) == "" ? "text-gray-400" : "" }`}>{getColumnName(i - 1) != "" ? getColumnName(i - 1) : typeof type == "string" ? "String" : typeof type == "number" ? "Number" : typeof type == "object" ? "Date" : "" }</div>
                                <button className="ml-auto text-red-800" onClick={() => handleDelete(i - 1)}> x </button>                                 
                              </div>
                            </div>           
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
                    <th className="w-[12vw] font-light bg-[#164A41] py-1 rounded-tl-xl">Database Column</th>
                    <th className="w-[12vw] font-light bg-[#164A41] py-1 rounded-tr-xl">Input Column</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.getOwnPropertyNames(SampleSchema.shape).map((name, i) => {
                    if(i >= Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3) && i < Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3 * 2)){
                      const type = getProperty(ExampleSample, name as sampleKey )
                      return(
                        <tr key={100 + i}>
                          <td className={`bg-[#E6E6E6] text-center border-t-2 border-r-2 border-white px-2 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3 * 2) -1 ? "pb-1 rounded-bl-xl" : ""}`}>{name.replaceAll("_", " ")}</td>
                          <td className={`bg-[#E6E6E6] text-center border-t-2 border-white px-2 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3 * 2) -1 ? "pb-1 rounded-br-xl" : ""}`}>
                            <div className={`min-h-[2rem] h-auto w-[11vw] text-gray-600 ${dragging ? "bg-[#A8A8A8]" : ""}`} onDrop={(e) => handleOnDrop(e, i-1)} onDragOver={handleDragOver}>                               
                              <div className="flex">
                                <div className="relative">
                                  <select onChange={(e) => changeDelimiter(e.target.value, i - 1)} className="block appearance-none w-7 py-1 px-1 pr-2 rounded leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="-">-</option>
                                    <option value=":">,</option>
                                    <option value=";">;</option>
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                      <path d="M10 12l-5-5 1.5-1.5L10 9.79l3.5-3.5L15 7z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className={`flex-grow ${getColumnName(i - 1) == "" ? "text-gray-400" : "" }`}>{getColumnName(i - 1) != "" ? getColumnName(i - 1) : typeof type == "string" ? "String" : typeof type == "number" ? "Number" : typeof type == "object" ? "Date" : "" }</div>
                                <button className="ml-auto text-red-800" onClick={() => handleDelete(i - 1)}> x </button>                            
                              </div>
                            </div>              
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
                    <th className="w-[12vw] font-light bg-[#164A41] py-1 rounded-tl-xl">Database Column</th>
                    <th className="w-[12vw] font-light bg-[#164A41] py-1 rounded-tr-xl">Input Column</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.getOwnPropertyNames(SampleSchema.shape).map((name, i) => {
                    if(i >= Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3 * 2)){
                      const type = getProperty(ExampleSample, name as sampleKey )
                      return(
                        <tr key={1000 + i}>
                          <td className={`bg-[#E6E6E6] text-center border-t-2 border-r-2 border-white px-2 ${i === Object.getOwnPropertyNames(SampleSchema.shape).length -1 ? "pb-1 rounded-bl-xl" : ""}`}>{name.replaceAll("_", " ")}</td>
                          <td className={`bg-[#E6E6E6] text-center border-t-2 border-white px-2 ${i === Object.getOwnPropertyNames(SampleSchema.shape).length -1 ? "pb-1 rounded-br-xl" : ""}`}>
                            <div className={`min-h-[2rem] h-auto w-[11vw] text-gray-600 ${dragging ? "bg-[#A8A8A8]" : ""}`} onDrop={(e) => handleOnDrop(e, i-1)} onDragOver={handleDragOver}> 
                              <div className="flex">
                                <div className="relative">
                                <select onChange={(e) => changeDelimiter(e.target.value, i - 1)} className="block appearance-none w-7 py-1 px-1 pr-2 rounded leading-tight focus:outline-none focus:shadow-outline">
                                    <option value="-">-</option>
                                    <option value=":">,</option>
                                    <option value=";">;</option>
                                  </select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                      <path d="M10 12l-5-5 1.5-1.5L10 9.79l3.5-3.5L15 7z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className={`flex-grow ${getColumnName(i - 1) == "" ? "text-gray-400" : "" }`}>{getColumnName(i - 1) != "" ? getColumnName(i - 1) : typeof type == "string" ? "String" : typeof type == "number" ? "Number" : typeof type == "object" ? "Date" : "" }</div>
                                <button className="ml-auto text-red-800" onClick={() => handleDelete(i - 1)}> x </button>                                  
                              </div>
                            </div>              
                          </td>
                        </tr>
                      )
                    }
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className='flex flex-row w-[50%] justify-end'>
          </div>
        </div>
        <div className="flex flex-row w-full justify-center font-bold">
          <button className="bg-[#F1B24A] hover:bg-[#fdc367a0] w-fit transition duration-300 ease-in-out ml-36 px-10 py-1 text-[#164A41] rounded-xl" onClick={mapColumns}>Apply Mappings</button>
        </div>

        {/* Phase 3 */}
        <div className="grid grid-flow-col grid-cols-10 mt-8 mb-2">
          <div className="flex flex-row justify-center items-center">
            <div className="flex bg-[#9DC88D66] rounded-full w-[4vw] h-[4vw] text-center items-center justify-center">
              <h1 className="text-[#164A41] text-4xl">3</h1>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2 col-span-9">
            <h1 className="text-[#164A41] text-4xl">Final check and upload</h1>
          </div>  
        </div>

        <p className="ml-36 mb-3 text-[#164A41]">
          Here you can check if all of the columns are mapped correctly. Some mappings do not look correct? Simply go back one step, change your mappings and hit the &apos;Apply Mappings&apos; button again. Once everything is correct, click the &apos;Submit&apos; button at the end of the page and your data will be automatically uploaded.
        </p>

        <div className="ml-24 w-[75vw]">
          <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {Object.getOwnPropertyNames(SampleSchema.shape).map((name,i) => {
                  if(i > 0){
                    return(
                      <th key={2000 + i} className={`bg-[#164A41] whitespace-nowrap font-extralight text-white px-4 py-2 ${i === 1 ? "rounded-tl-xl" : i === Object.getOwnPropertyNames(SampleSchema.shape).length -1 ? "rounded-tr-xl" : ""}`}>{name.replaceAll("_"," ")}</th>
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
                            <td key={4000 + j} className="py-4 px-6 bg-[#E6E6E6]">{getProperty(sample, name as SampleKey)?.toString()}</td>
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
        <div className="flex flex-row w-full justify-center font-bold">
          <button className="bg-[#F1B24A] hover:bg-[#fdc367a0] mt-3 w-fit transition duration-300 ease-in-out ml-36 px-10 py-1 text-[#164A41] rounded-xl" onClick={onSubmit}>Submit</button>
        </div>

        {errorSamples.length > 0 && (
          <div className="">
            {errorSamples.map((sample, i) => {
              return (
              <>
                {Object.getOwnPropertyNames(sample).map((property, j) => {
                  return (
                    <div key={6000 + i}>
                      <input className="bg-gray-300  w-[206px] border-t-2 border-white px-2 pb-1 white"  key={6000 + j} placeholder={property} value={getProperty(sample, property as SampleKey)?.toString()} onChange={(e) => {
                        sample = {...sample, [property] : e.target.value}
                        const tempSamples = errorSamples
                        tempSamples[i] = sample
                        setErrorSamples(tempSamples)
                      }}></input>
                    </div>
                  )
                })}
                <button className="bg-[#4D774E] text-center w-[100px] mt-2 border-t-2 border-white px-2 pb-1 rounded-l-lg text-white" key={7000 + i} onClick={() => {
                  return upload.mutate(sample)
                }}>Apply</button>
                <button className="bg-[#8c1d1d] text-center w-[100px] ml-1 border-t-2 border-white px-2 pb-1 rounded-r-lg text-white" key={8000 + i} onClick={() => {
                  const tempArray = errorSamples
                  tempArray.filter((_,index) => {index === i})
                  setErrorSamples(tempArray)
                }}>Delete</button>
              </>)
            })}

            <div className="flex flex-row w-full justify-center">
              <button className="bg-[#4D774E] hover:bg-[#7da37d] mt-3 w-fit transition duration-300 ease-in-out ml-36 px-10 py-1 text-white rounded-lg" onClick={onSubmitErrorSamples}>Submit</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;
