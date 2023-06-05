import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';

type input = {
  pagelength: number,
  setPagelength: Dispatch<SetStateAction<number>>
}

const ShowRows: React.FC<input> = ({pagelength, setPagelength}) => {

    const handlePageLengthChange = (length: number) => {
        setPagelength(length);
      };

  return (
    <>
    <p className="ml-4 w-fit px-3 py-1 text-lg rounded-l-full border-2 border-gray-500 focus:border-gray-700 outline-none transition h-10">Show rows</p>
        <select className="w-fit px-3 py-2 text-lg rounded-r-full border-2 border-gray-500 focus:border-gray-700 outline-none transition h-10" name="pagelength" id="pagelength" value={pagelength} onChange={e => handlePageLengthChange(parseInt(e.target.value))}>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={150}>150</option>
          <option value={200}>200</option>
          <option value={250}>250</option>
          <option value={500}>500</option>
          <option value={1000}>1000</option>
        </select>
    </>
  )
}

export default ShowRows
