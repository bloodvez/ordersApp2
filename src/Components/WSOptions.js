import React from 'react'
import { useContext } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { Context } from '../index'
import { observer } from 'mobx-react-lite'

const WSOptions = observer(() => {
    const { prettyApp } = useContext(Context)

    return (
        <div>
            {prettyApp.wsConnected === true ? (
                <div>
                    <Button variant="dark" onClick={() => { prettyApp.testWS() }}>Test Message</Button>
                    <Button variant="danger" onClick={() => { prettyApp.disconnectFromWS() }}>Disconnect</Button>
                </div>
            ) : (prettyApp.connectingToWS === true ? <Spinner animation="border" variant="success" /> :
                <div>
                    <Button variant="success" onClick={() => {
                        prettyApp.connectToWS()
                    }}>Connect</Button>
                </div>
            )}
        </div>
    )
})

export default WSOptions
