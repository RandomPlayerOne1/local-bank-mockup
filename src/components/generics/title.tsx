import { CiBank } from "react-icons/ci";

function TitleCard() {
    return (
        <a
            href="/"
        >
            <div className='flex items-center mr-1 title-icon'>
                <CiBank className='text-accent' />
                <span className='text-left text-textcolor font-bold p-1'>Pocket Bank</span>
            </div>
        </a>
    )
}

export default TitleCard