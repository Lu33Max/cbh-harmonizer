import React, { useState, useEffect } from 'react'

type input = {
  count: number | undefined
}

const Count: React.FC<input> = ({count}) => {

  return (
    <>
    <div className="w-fit px-3 py-1 text-lg rounded-full border-2 border-gray-500">
            Search Results: {count ?? "0"}
    </div>
    </>
  )
}

export default Count
