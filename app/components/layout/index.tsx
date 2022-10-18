import Head from "next/head";

type Props = {
    children: React.ReactNode
}
export default function Layout(props: Props) {
    return (
        <div
            style={{
                backgroundColor: 'white',
                padding: 10
            }}
        >
            <Head>
                <title>Lapor</title>
                <meta name="description" content="One click report generation" />
                <link rel="icon" href="favicon.ico" />
            </Head>
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