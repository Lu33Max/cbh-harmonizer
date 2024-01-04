import { type NextPage } from "next";
import Head from "next/head";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import { api } from "~/utils/api";
import Excel from 'exceljs';
import { type Samples } from "@prisma/client";
import cuid from "cuid";
import { ExampleSample, type ISample, SampleSchema } from "~/common/database/samples";
import Sidebar from "~/components/sidebar";
import { useSession } from "next-auth/react";
import { Login } from "~/components/login";

const Home: NextPage = () => {
  const { data: session } = useSession()
  const [mappings, setMappings] = useState<Record<string, string[]>>({})
  const [delimiters, setDelimiters] = useState<(string | null)[]>([])

  // If the user is not logged in, redirect them to the login page
  if(!session){
    return (
      <div>
        <Login/>
      </div>
    )
  }
  
  return (
    <div className="flex flex-row max-w-[100vw] max-h-[100vh] overflow-x-hidden overflow-y-hidden font-poppins">
      {/* Render the Sidebar component with mappings and setMappngs as props. */}
      {/*<Sidebar mappings={mappings} setMapping={setMappings} />*/}
      <Import mappings={mappings} setMappings={setMappings} delimiters={delimiters} setDelimiters={setDelimiters}/>
    </div>
  )
  
}

type props = {
  mappings: Record<string, string[]>,
  setMappings: Dispatch<Record<string, string[]>>
  delimiters: (string | null)[],
  setDelimiters: Dispatch<SetStateAction<(string | null)[]>>
}

const Import: React.FC<props> = ({mappings, setMappings, delimiters, setDelimiters}) => {
  // General Table
  const [search, setSearch] = useState<string>("")

  // API Requests
  const upload = api.samples.create.useMutation()  

  // File Reader
  const [input, setInput] = useState<File | undefined>(undefined)
  const [startRow, setStartRow] = useState<number>(1)
  const [header, setHeader] = useState<(string | undefined)[]>([])
  const [errorSamples, setErrorSamples] = useState<Samples[]>([])

  const [dragging, setDragging] = useState(false);

  const [rawSamples, setRawSamples] = useState<Record<string, unknown>[]>([])
  const [newSamples, setNewSamples] = useState<ISample[]>([])
  

  function readFile() {
    if (input !== undefined) {
      if (input?.name.endsWith(".xlsx")) {
        // Read and process Excel (.xlsx) file
        const wb = new Excel.Workbook(); // Create a new instance of the Excel Workbook
        const reader = new FileReader(); // Create a new instance of the FileReader API
        
        reader.readAsArrayBuffer(input); // Read the file data as an ArrayBuffer
        
        reader.onload = () => {
          const buffer = reader.result; // Get the result (file data) from the FileReader
          
          if (buffer instanceof ArrayBuffer) {
            // Load the ArrayBuffer into the Excel Workbook
            wb.xlsx.load(buffer).then((workbook) => {
              let rowLength = 0;
              const tempSampleArray: Record<string, unknown>[] = [];
              
              workbook.eachSheet((sheet) => {
                // Iterate over each sheet in the workbook
                sheet.eachRow((row, rowIndex) => {
                  // Iterate over each row in the sheet
                  const tempHeader: (string | undefined)[] = [];
                  const tempSample: Record<string, unknown> = {};
                  
                  if (rowIndex === startRow) {
                    // Check if it is the header row
                    
                    row.eachCell((cell) => {
                      // Iterate over each cell in the row to extract the header values
                      tempHeader.push(cell.text);
                    });
                    
                    tempHeader.push(undefined);
                    
                    rowLength = tempHeader.length;
                    setHeader(tempHeader); // Set the header state with the extracted values
                  }
                  
                  if (rowIndex > startRow) {
                    // Skip the header row and process the sample data
                    
                    let index = 1;
                    
                    row.eachCell((cell, i) => {
                      // Iterate over each cell in the row to extract the sample values
                      while (i > index) {
                        const currentCol = tempHeader[index]

                        if(currentCol)
                          tempSample[currentCol] = null; // Add empty for missing values
                        
                        index++;
                      }
                      
                      const currentCol = tempHeader[index]

                      if(currentCol)
                        tempSample[currentCol] = cell.text;

                      index++;
                    });

                    while (Object.keys(tempSample).length < rowLength) {
                      const currentCol = tempHeader[index]

                      if(currentCol)
                        tempSample[currentCol] = null; // Add empty for missing values
                    }

                    tempSampleArray.push(tempSample); // Add the sample data to the temporary array
                  }
                });
              });
  
              setRawSamples(tempSampleArray); // Set the rawSamples state with the extracted sample data
            })
            .catch((error) => {
              console.error(error);
            });
          }
        };
      } else if (input.name.endsWith(".csv")) {
        // Read and process CSV (.csv) file
        const reader = new FileReader(); // Create a new instance of the FileReader API
  
        reader.readAsText(input); // Read the file data as text
  
        reader.onload = () => {
          const csvData = reader.result as string; // Get the result (file data) from the FileReader
  
          if (csvData) {
            const rows = csvData.split("\n"); // Split the CSV data into rows
            const tempSampleArray = [];
  
            if (rows.length > 0) {
              // Assuming the header is in the first row
              const tempHeader = rows[0]?.split(";") || []; // Split the first row into header values
              setHeader(tempHeader); // Set the header state with the extracted values
  
              for (let i = 1; i < rows.length; i++) {
                const tempSample: Record<string, unknown> = {}
                // Iterate over the rows (excluding the header row)
                rows[i]?.split(";").forEach((cell, index) => {
                  const currentCol = tempHeader[index]

                  if(currentCol){
                    if(cell.length > 0)
                      tempSample[currentCol] = cell
                    else
                      tempSample[currentCol] = null
                  }
                })
                
                tempSampleArray.push(tempSample); // Add the sample array to the temporary array
              }
            }
  
            setRawSamples(tempSampleArray); // Set the rawSamples state with the extracted sample data
          }
        };
      } else {
        // Alert the user if the file type is not supported
        alert("Filetype not supported. Try uploading data in Excel or csv format.");
      }
    } else {
      // Alert the user if no file is selected
      alert("No File selected");
    }
  }

  function mapColumns(){
    const transformedData = rawSamples.map((row) => {
      const transformedRow: Record<string, unknown> = {};
    
      Object.keys(mappings).forEach((inputColumnName, keyIndex) => {
        const internalColumnName = mappings[inputColumnName];

        internalColumnName?.forEach((col, i) => {
          if(i === 0) transformedRow[col] = row[inputColumnName];
          else transformedRow[col] = `${JSON.stringify(transformedRow[col])}${delimiters[keyIndex] ?? ""} ${JSON.stringify(row[inputColumnName])}`
        })
      });

      transformedRow["id"] = cuid()
      return transformedRow;
    });

    const newData: ISample[] = []
    
    transformedData.map((record) => {
      const newSample = ExampleSample

      Object.keys(record).map(key => {
        if(key in Object.keys(SampleSchema.shape)){
          if(typeof newSample[key as SampleKey] === typeof record[key]){
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            newData[key as SampleKey] = record[key]
          }
        }
      })
    })
    
    setNewSamples(newData)
  }

  function onSubmit(){
    console.log("Submit")
  }

  function onSubmitErrorSamples(){
    console.log("Error")
  }
  
  function handleOnDrag(e: React.DragEvent, column: string) {
    // Set the index value in the dataTransfer object for drag and drop operations
    e.dataTransfer.setData("index", column);
    setDragging(true);
  }

  function handleOnDrop(e: React.DragEvent, targetColumn: string) {
    const inputColumn = e.dataTransfer.getData("index");
    const tempMappings = mappings

    tempMappings[targetColumn]?.push(inputColumn)

    setMappings(tempMappings)
    setDragging(false);
  }

  function handleDragEnd() {
    setDragging(false);
  }

  function handleDragOver(e: React.DragEvent) {
    e.stopPropagation();
    /* Prevent default behavior if dragging state is true
    This allows the element to be a drop target only when dragging is active*/ 
    if (dragging) {
      e.preventDefault();
    }
  }

  function handleDelete(index: string) {
    const tempMappings = mappings;
    tempMappings[index]?.slice(0,0) // Empty the array
    setMappings(tempMappings);
  }

  function changeDelimiter(delimiter: string, index: number) {
      const tempDelimiters = [...delimiters];

      tempDelimiters.slice(0, index), delimiter
      setDelimiters(tempDelimiters)
  }
 
  function getColumnName(key: string): string {
    const cols = mappings[key];
    let colName = ""

    cols?.forEach((col, i) => {
      if(i > 0) colName += ", "

      colName += col
    })

    return colName
  }

  function getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    // Get the value of a property from an object using the property name
    return o[propertyName]
  }

  type SampleKey = keyof typeof ExampleSample

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
              <div key={index} draggable onDragStart={(e) => handleOnDrag(e, head ?? "")} onDragEnd={handleDragEnd} className={` px-3 py-1 rounded-2xl ${(search !== "" && head && head.toLowerCase().includes(search)) ? "bg-[rgb(131,182,94)]" : "bg-gray-300"}`}>
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
                      const type = getProperty(ExampleSample, name as SampleKey)
                      return(
                        <tr key={i}>
                          <td className={`bg-[#E6E6E6] text-center border-t-4 border-r-4 border-white px-4 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3) -1 ? "pb-1 rounded-bl-xl" : ""}`}>{name.replaceAll("_", " ")}</td>
                          <td className={`bg-[#E6E6E6] text-center border-t-4 border-white px-4 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3) -1 ? "pb-1 rounded-br-xl" : ""}`}>
                            <div className={`min-h-[2rem] h-auto w-[11vw] text-gray-600 transition-colors ease-in-out ${dragging ? "bg-[#dddddd]" : ""}`} onDrop={(e) => handleOnDrop(e, name)} onDragOver={handleDragOver}>
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
                                <div className={`flex-grow ${getColumnName(name) !== "" ? "text-gray-400" : "" }`}>{getColumnName(name) !== "" ? getColumnName(name) : typeof type == "string" ? "String" : typeof type == "number" ? "Number" : typeof type == "object" ? "Date" : "" }</div>
                                <button className="ml-auto text-red-800" onClick={() => handleDelete(name)}> x </button>                                 
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
                      const type = getProperty(ExampleSample, name as SampleKey )
                      return(
                        <tr key={100 + i}>
                          <td className={`bg-[#E6E6E6] text-center border-t-2 border-r-2 border-white px-2 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3 * 2) -1 ? "pb-1 rounded-bl-xl" : ""}`}>{name.replaceAll("_", " ")}</td>
                          <td className={`bg-[#E6E6E6] text-center border-t-2 border-white px-2 ${i === Math.floor(Object.getOwnPropertyNames(SampleSchema.shape).length / 3 * 2) -1 ? "pb-1 rounded-br-xl" : ""}`}>
                            <div className={`min-h-[2rem] h-auto w-[11vw] text-gray-600 ${dragging ? "bg-[#dddddd]" : ""}`} onDrop={(e) => handleOnDrop(e, name)} onDragOver={handleDragOver}>                               
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
                                <div className={`flex-grow ${getColumnName(name) == "" ? "text-gray-400" : "" }`}>{getColumnName(name) != "" ? getColumnName(name) : typeof type == "string" ? "String" : typeof type == "number" ? "Number" : typeof type == "object" ? "Date" : "" }</div>
                                <button className="ml-auto text-red-800" onClick={() => handleDelete(name)}> x </button>                            
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
                      const type = getProperty(ExampleSample, name as SampleKey )
                      return(
                        <tr key={1000 + i}>
                          <td className={`bg-[#E6E6E6] text-center border-t-2 border-r-2 border-white px-2 ${i === Object.getOwnPropertyNames(SampleSchema.shape).length -1 ? "pb-1 rounded-bl-xl" : ""}`}>{name.replaceAll("_", " ")}</td>
                          <td className={`bg-[#E6E6E6] text-center border-t-2 border-white px-2 ${i === Object.getOwnPropertyNames(SampleSchema.shape).length -1 ? "pb-1 rounded-br-xl" : ""}`}>
                            <div className={`min-h-[2rem] h-auto w-[11vw] text-gray-600 ${dragging ? "bg-[#dddddd]" : ""}`} onDrop={(e) => handleOnDrop(e, name)} onDragOver={handleDragOver}> 
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
                                <div className={`flex-grow ${getColumnName(name) == "" ? "text-gray-400" : "" }`}>{getColumnName(name) != "" ? getColumnName(name) : typeof type == "string" ? "String" : typeof type == "number" ? "Number" : typeof type == "object" ? "Date" : "" }</div>
                                <button className="ml-auto text-red-800" onClick={() => handleDelete(name)}> x </button>                                  
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
