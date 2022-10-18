import {
    Button,
    Form,
    InputGroup,
} from 'react-bootstrap'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { userLogin } from '../../services/api'

const Login = () => {

    const [values, setValues] = useState({
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    function onSubmit() {
        setIsLoading(true)

        userLogin(values.password)
            .then(res => {
                if (!res.success) throw res.message

                window.location.href = '/'
            })
            .catch(err => {
                setErrorMessage(err.toString())
            })
            .finally(() => setIsLoading(false))
    }

    useEffect(() => {
        document.addEventListener('keyup', e => {
            if (e.code === 'Enter') {
                onSubmit()
            }
        })
    }, [])

    return (
        <div
            style={{
                backgroundColor: 'black',
                width: '100%',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Head>
                <title>Nutflix</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="favicon.ico" />
            </Head>
            <div
                style={{
                    color: 'white',
                    padding: 10,
                    width: '50%',
                    height: '30%',
                }}
            >
                <div
                    style={{
                        color: 'white',
                        padding: 10,
                    }}
                >
                    <Form
                        onSubmit={e => {
                            e.preventDefault()
                            onSubmit()
                        }}
                    >
                        <InputGroup className="mb-3">
                            <Form.Control
                                placeholder='Password'
                                type='password'
                                value={values.password}
                                onChange={e => {
                                    setValues(prev => ({
                                        ...prev,
                                        password: e.target.value
                                    }))
                                }}
                            />
                        </InputGroup>
                        <p style={{ color: 'red' }}>{errorMessage}</p>
                        <Button
                            disabled={values.password === ''}
                            style={{ width: '100%' }} variant='dark' size='sm'
                            type='submit'
                        >
                            Login
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default Login