
import { IoLogInOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { ServerRequest } from "../client/src/libs/request_center";
import type { UserCredential } from "../client/src/libs/request_center";

function Header() {

    return (
        <header className=''>

        </header>
    );
}

function Main() {

    const navigate = useNavigate()

    async function TryLogin(event: React.SubmitEvent) {
        event.preventDefault()
        const target = event.target.elements as typeof event.target.elements & {
            username: { value: string }
        }

        try {
            await ServerRequest<UserCredential>("/public_api/user_identity/login", {
                preset: 'post/app/json',

                body: JSON.stringify({
                    username: target.username.value
                })
            }, { maxRequest: 1 }).then(
                data => {


                    localStorage.setItem("userAccessToken", data.userAccessToken!);
                    localStorage.setItem("userRefreshToken", data.userRefreshToken!);
                    localStorage.setItem("user", data.user!);
                    console.log("Logging in as " + data.user + " with token: " + data.userAccessToken)
                    navigate("/", { replace: true })
                }
            )

            return;
        } catch (err) {
            throw new Error("Something went wrong while trying to login: " + err)
        }


    }

    return (
        <main className='flex flex-1 flex-col items-center justify-center text-textcolor'>
            <form
                className='flex flex-col items-center justify-center align-middle bg-surface outline-1 outline-accent font-bold w-64 h-auto gap-4'
                onSubmit={TryLogin}>
                <label htmlFor='username'>USERNAME</label>
                <div className='flex bg-background rounded-2xl gap-2 px-2'>
                    <IoLogInOutline className='w-6 h-6 text-accent' />
                    <input className='outline-0 font-semibold' id='username' type='text' />
                </div>

                <button type='submit' className='bg-background px-2 py-1 mb-2 rounded-2xl'>Login</button>
            </form>
        </main>
    );
}

function Footer() {
    return (
        <footer>

        </footer>
    );
}



function Page() {

    return (
        <div className='flex min-h-screen flex-col justify-between'>
            <Header />
            <Main />
            <Footer />
        </div>
    );
}

const Login = {
    Header,
    Main,
    Footer,
    Page
}

export default Login;