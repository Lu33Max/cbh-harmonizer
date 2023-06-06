import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { type Dispatch, type SetStateAction, useState, useEffect } from "react";

import { IMappings, TableSamples } from "./mapping";
import { api } from "~/utils/api";

type CustomModalProps = {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>,
  filter: IMappings;
};

const ModalSave: React.FC<CustomModalProps> = ({ showModal, setShowModal , filter}) => {
     const [filtername, setFiltername] = useState<string>('')

    const { data: sessionData } = useSession();
    const { data: sessionFilter, refetch: refetchFilter } = api.mappings.getAll.useQuery(
        {
            type: TableSamples.normal,
        }, 
        {
            enabled: sessionData?.user !== undefined,
        }
    );
    const createFilter = api.mappings.create.useMutation()

    useEffect(() => {
        if (showModal) {
            void refetchFilter()
        }
    }, [showModal, refetchFilter])

    function onClose() {
        setShowModal(false)
        setFiltername("")
    }

    function onSubmit() {
        if(filtername !== ""){
            if(sessionFilter && sessionFilter.find(e => e.name === filtername) === undefined){
                createFilter.mutate({ filter: JSON.stringify(filter), name: filtername, type: TableSamples.normal})

                if(!createFilter.isError){
                    setFiltername("")
                    setShowModal(false)
                } else {
                    alert("Something went wrong. Please try again.")
                }

            } else {
                alert("Name already taken")
            }
        } else {
            alert("Please enter a valid name")
        }
    }

    return (
        <>
            {showModal ? (
                <>
                    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                        <div className="relative w-auto my-6 mx-auto max-w-3xl">
                            {/*content*/}
                            <div className="border-0 shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none rounded-2xl">
                                {/*header*/}
                                <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 bg-[rgb(131,182,94)] rounded-t-2xl">
                                    <h3 className="text-3xl font-semibold w-full text-center">Save filter</h3>
                                </div>
                                {/*body*/}
                                {sessionData?.user ? (
                                  <div className="relative p-5 flex-auto">
                                      <input className='border-solid border-black border-2 mx-2 px-2 text-center py-1 rounded-xl text-lg' placeholder="Enter a name" onChange={e => setFiltername(e.target.value)}></input>
                                  </div>
                                ) : (
                                  <div className="px-5 py-3">
                                    <label className="flex flex-col text-center justify-center">Want to save your current filter?<br/> <Link href={"/auth/login"} className="text-blue-700"><b>Sign In</b></Link></label>
                                  </div>
                                )}
                                {/*footer*/}
                                <div className="flex items-center justify-center py-3 px-6 border-t border-solid border-slate-200 rounded-b">
                                    <button
                                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => {filtername !== "" ? onSubmit() : alert("Please enter a name")}}
                                    >
                                        Save Filter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : (
                <></>
            )}
        </>
    );
};

export default ModalSave;
