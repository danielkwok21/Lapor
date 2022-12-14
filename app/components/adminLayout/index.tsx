import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Nav, Navbar, Spinner } from "react-bootstrap";
import logo from '../../assets/logo.png';
import { adminLogout, getIsAdminLoggedIn } from "../../services/api";

type Props = {
    children: React.ReactNode
}
export default function AdminLayout(props: Props) {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        getIsAdminLoggedIn()
            .then(res => {
                const { isAdminLoggedIn } = res
                if (!isAdminLoggedIn) throw res.isAdminLoggedIn
                setIsAdminLoggedIn(isAdminLoggedIn)
            })
            .catch(err => {
                window.location.href = '/admin-login'
            })
            .finally(() => setIsLoading(false))
    }, [])

    if (isLoading || !isAdminLoggedIn) {
        return (
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100vh',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'white'
                }}
            >
                <Spinner animation="border" role="status" color="white" />
            </div>
        )
    }

    return (
        <div
            style={{
                backgroundColor: 'white'
            }}
        >
            <Head>
                <title>Nutflix</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="favicon.ico" />
            </Head>
            <Header />
            {
                <main>
                    {
                        props.children
                    }
                </main>
            }
        </div>
    )
}

function Header() {
    return (
        <Navbar bg="dark" variant="dark">
            <div
                style={{
                    width: '100%',
                    paddingLeft: 20,
                    paddingRight: 20,
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                <Navbar.Brand href="/">
                    <Image
                        src={logo}
                        height={30}
                        width={30}
                    />
                </Navbar.Brand>
                <Nav>
                    <Nav.Link
                        onClick={() => {
                            adminLogout()
                                .then(() => {
                                    window.location.href = '/admin'
                                })
                        }}
                    >Logout</Nav.Link>
                </Nav>
            </div>
        </Navbar>
    )
}