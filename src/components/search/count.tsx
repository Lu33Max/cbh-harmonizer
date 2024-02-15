import React, { useState, useEffect } from 'react'

type input = {
  count: number | undefined
}

const Count: React.FC<input> = ({count}) => {

  return (
    <>
    <div className="w-fit px-3 py-1 text-lg rounded-2xl border-2 border-[#9DC88D] bg-white text-[#164A41]">
            Search Results: {count ?? "0"}
    </div>
    </>
  )
}

export default Count
