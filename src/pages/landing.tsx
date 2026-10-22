import TitleCard from '../components/generics/title'
import MiniAccount from '../components/generics/user-account'
import CheckUsageEligibility from '../components/nonpermanent/check-usage-eligibility';
import { IsAuthenticated } from '../client/src/libs/request_center';

function Header() {


    return (
        <header className='bg-background sticky top-0'>
            <nav aria-label='Top Bar Navigation' className='flex items-center justify-between pl-4 pr-4'>
                {/* Creating Top Bar */}
                <TitleCard />
                <MiniAccount />

            </nav>
        </header>
    );
}

function Main() {
    return (
        <main className='flex flex-1 flex-col items-center'>
            {/* Introduction */}
            <p>All In One For Saving!</p>
            <h1>Keep Your Saving Safe Today.</h1>
            <p className="description">
                We work in colaboration with other bank to make sure your saving will always be there when you need it.
            </p>

            <p className="description">
                Deposit or Withdraw with just tap away from your phone at your home!
            </p>

            <p className="description font-bold text-amber-600">
                We are currently in early development phase. Click below to check if you are eligible to participate in our program!
            </p>

            <CheckUsageEligibility />

        </main>
    );
}

function Footer() {
    return (
        <footer>
            <div className="gap-left">
                &copy;Pocket Bank 2026
            </div>
        </footer>
    );
}

function Page() {

    return (
        <div className="flex flex-col min-h-screen justify-between bg-background text-textcolor">
            <Header />
            <Main />
            <Footer />
        </div>
    );
}


const Landing = {
    Header,
    Main,
    Footer,
    Page
}

export default Landing;