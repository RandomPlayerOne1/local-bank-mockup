
import { useState } from "react"

function CheckUsageEligibility() {

    const [eligibility, setEligibility] = useState<boolean | undefined>(undefined)

    const verifyEligibility = () => {
        setEligibility(!eligibility)
    }

    const statusText =
        eligibility === undefined ? "Unchecked" :
            eligibility ? "Eligible" : "Not Eligible"

    const statusColor =
        eligibility === undefined ? "text-amber-50" :
            eligibility ? "text-green-500" : "text-red-500"

    return (
        <div className='flex flex-col prompt-window items-center w-10/12 h-32 mt-6 justify-between'>
            <span className='font-bold text-accent text-2xl'>Check Eligibility</span>
            <span className={`font-bold ${statusColor}`}>Your Current Eligibility: {statusText}</span>
            <button className='bg-accent text-textcolor' onClick={verifyEligibility}>Check</button>
        </div>
    )
}



export default CheckUsageEligibility