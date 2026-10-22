function Header() {

    return (
        <header className='bg-background sticky top-0'>

        </header>
    );
}

function Main() {
    return (
        <main className='flex flex-1 flex-col items-center'>

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
        <div className="">
            <Header />
            <Main />
            <Footer />
        </div>
    );
}


const Template = {
    Header,
    Main,
    Footer,
    Page
}

export default Template;