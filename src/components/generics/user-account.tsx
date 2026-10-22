import { IoPerson } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { IsAuthenticated, DoLogOut } from "../../client/src/libs/request_center";
import { useState } from "react";

function MiniAccount() {

    const navigate = useNavigate();

    const user: string | null = localStorage.getItem("user")
    const [authenticated, setAuthenticated] = useState<boolean>(IsAuthenticated());

    async function TryLogout() {
        const res = await DoLogOut();

        if (res.ok) {
            //Force update here
            setAuthenticated(IsAuthenticated());
            navigate("/");
        }
    }

    return (
        <div className='flex gap-1'>
            <Link to='/login' aria-label='toggle-account-burger' className='flex flex-col hoverable-burger group'>
                <MiniAccountInfo username={user === null ? "Guest" : user} />
            </Link>
            {authenticated && (
                <span className='flex flex-col hoverable-burger group text-gray-600'>
                    <button onClick={TryLogout}>Log Out</button>
                </span>
            )}

        </div>

    )
}

const MiniAccountInfo = ({ username }: { username: string }) => {

    return (
        <div className='flex items-center'>
            <IoPerson className='text-accent mr-2' /> <span className='text-textcolor font-bold'>{username}</span>
        </div>
    )
};


export default MiniAccount