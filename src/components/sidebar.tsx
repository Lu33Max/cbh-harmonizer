import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'

const Sidebar: React.FC = () => {
  const router = useRouter()

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
            <label className='my-1 hover:text-[#F1B24A] transition-all max-w-[140px]'>Preset</label>
            <label className='my-1 hover:text-[#F1B24A] transition-all'>Preset</label>
            <label className='my-1 hover:text-[#F1B24A] transition-all'>Preset</label>
            <label className='my-1 hover:text-[#F1B24A] transition-all'>Preset</label>
          </div>
        </div>
        <div className='flex flex-col py-5 px-5 text-2xl items-start font-semibold text-white'>
          <hr className='w-full my-3'/>
          <button onClick={() => void signOut()} className='mt-2 hover:text-[#F1B24A] transition-all'>Logout</button>
        </div>
    </div>
  )
}

export default Sidebar
