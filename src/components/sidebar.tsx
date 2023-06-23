import React, { useEffect,type SetStateAction, type Dispatch, useState } from "react";

import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { type Mapping } from "@prisma/client";
import { MappingsSchema } from '~/common/mappings/mapping';
import Link from "next/link";
import ModalSave from "~/common/mappings/modalSave";

type props = {
  mappings: (number[] | null)[],
  setMapping: Dispatch<SetStateAction<(number[] | null)[]>>
}

const Sidebar: React.FC<props> = ({mappings, setMapping}) => {
  const router = useRouter()
  const { data: sessionData } = useSession();
  const { data: sessionMapping, refetch: refetchMapping } = api.mappings.getAll.useQuery(
      void{},
      {
          enabled: sessionData?.user !== undefined,
      }
  );

  //Mapping Presets
  const [showSave, setShowSave] = useState(false);

  function applyMapping(mapping: Mapping) {
    try {
      const parseMapping = MappingsSchema.parse(JSON.parse(mapping.mapping))
      setMapping(parseMapping)
    } catch (error){
        console.error(error)
        alert("Something went wrong. Please try again.")
    }
  }

  useEffect(() => {
    if(!showSave) {
      setTimeout(() => void refetchMapping(), 100)      
    }
  }, [showSave, refetchMapping])

  return (
    <div className='min-w-[200px] max-w-[200px] bg-[#164A41] flex flex-col py-5 shadow-2xl shadow-black '>
        <div className='flex items-center justify-center h-[15%]'>
            <Image src="/CBHLogo.png" alt='logo' width={160} height={160}/>
        </div>
        <div className='h-[75%] flex flex-col items-start mt-20 py-5 px-5 text-2xl font-semibold text-white'>
          <button onClick={() => void router.push("/table")} className='my-2 hover:text-[#F1B24A] transition-all'>Table View</button>
          <button onClick={() => void router.push("/")} className='my-2 hover:text-[#F1B24A] transition-all'>Upload</button>
          <hr className='w-full my-3'/>
          <label className='my-2 hover:text-[#F1B24A] transition-all'>Saved</label>
          <div className='flex flex-col pl-5 text-xl font-light break-words overflow-y-auto'>
            {sessionData?.user ? (
                <div className="mx-1 flex flex-col mt-3 max-h-[50vh] overflow-y-auto text-lg">
                    {(sessionMapping && sessionMapping.length > 0) ? (
                        sessionMapping.map((mapping, i) => (
                            <button
                                key={i} 
                                onClick={() => applyMapping(mapping)}                                                  
                            >
                                {mapping.name}
                            </button>
                        ))
                    ) : (
                        <label>No&nbsp;filter&nbsp;found.</label>
                    )}
                </div>
            ): (
                <div className="px-5 py-3">
                    <label className="flex flex-col text-center justify-center">Want to save your current filter?<br/> <Link href={"/auth/login"} className="text-blue-700"><b>Sign In</b></Link></label>
                </div>
            )}
          </div>
          <button className='w-[10rem] px-4 py-1 text-lg text-center text-[#164A41] rounded-2xl bg-[#F1B24A] hover:bg-[#fcc368] transition-colors' onClick={() => setShowSave(true)}>Save Filter</button>
          <ModalSave showModal={showSave} setShowModal={setShowSave} mapping={mappings} />
        </div>
        <div className='flex flex-col py-5 px-5 text-2xl items-start font-semibold text-white'>
          <hr className='w-full my-3'/>
          <button onClick={() => void signOut()} className='mt-2 hover:text-[#F1B24A] transition-all'>Logout</button>
        </div>
    </div>
  )
}

export default Sidebar
