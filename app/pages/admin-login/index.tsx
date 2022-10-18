import Head from 'next/head'
import { useEffect, useState } from 'react'
import {
    Button,
    Form,
    InputGroup,
    Spinner
} from 'react-bootstrap'
import { adminLogin } from '../../services/api'

const AdminLogin = () => {

    const [values, setValues] = useState({
        password: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    function onSubmit() {
        setIsLoading(true)

        adminLogin(values.password)
            .then(res => {
                if (!res.success) throw res.message

                window.location.href = '/admin'
            })
            .catch(err => {
                setErrorMessage(err.toString())
            })
            .finally(() => setIsLoading(false))
    }

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
                    <p>Admin Panel</p>
                    <Form
                        onSubmit={e => {
                            e.preventDefault()
                            onSubmit()
                        }}
                    >
                        <Form.Group controlId='formBasicPassword'>
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
                        </Form.Group>
                    </Form>
                    <p style={{ color: 'red' }}>{errorMessage}</p>
                    <Button
                        disabled={values.password === '' || isLoading}
                        style={{ width: '100%' }}
                        variant='dark'
                        size='sm'
                        type="submit"
                    >
                        {
                            isLoading ? (<Spinner size='sm' animation='border' />) : null
                        }
                        &nbsp; 
                        Login
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin