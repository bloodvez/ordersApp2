import React from 'react'
import { useContext, useState } from 'react'
import { Button, Spinner, Form, InputGroup } from 'react-bootstrap'
import { Context } from '../index'
import { observer } from 'mobx-react-lite'

const WSOptions = observer(() => {
    const { prettyApp } = useContext(Context)
    const [wsAddress, setWsAddress] = useState('')

    return (
        <div>
            {prettyApp.wsConnected === true ? (
                <div>
                    <Button variant="dark" onClick={() => { prettyApp.testWS() }}>Test Message</Button>
                    <Button variant="danger" onClick={() => { prettyApp.disconnectFromWS() }}>Disconnect</Button>
                </div>
            ) : (prettyApp.connectingToWS === true ?
                <div>
                    <Spinner animation="border" variant="success" />
                    <Button variant="danger" onClick={() => {
                        prettyApp.disconnectFromWS()
                    }}>Stop</Button>
                </div>
                :
                <div>
                    <InputGroup>
                        <Button variant="success" onClick={() => {
                            prettyApp.connectToWS(wsAddress)
                        }}>Connect</Button>
                        <Form className="loginForm">
                            <Form.Control placeholder="IP" value={wsAddress} onChange={e => setWsAddress(e.target.value)} />
                        </Form>
                    </InputGroup>
                </div>
            )}
        </div>
    )
})

export default WSOptions
