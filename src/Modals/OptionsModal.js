import React from 'react'
import { useContext, useState } from 'react'
import { Context } from '../index'
import { Button, Tab, Tabs, Modal } from 'react-bootstrap'
import Login from '../Components/Login'
import { observer } from 'mobx-react-lite'

const OptionsModal = observer(({ show, handleClose }) => {
  const { prettyApp } = useContext(Context)
  const [fontSize, setfontSize] = useState(2)

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header>
        <Modal.Title>Options</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="home">
          <Tab eventKey="home" title="Home">
            <Button
              variant="primary"
              onClick={() => {
                console.log(prettyApp)
              }}
            >
              test
            </Button>
            <div>Yes1</div>
            <input type="range" name="fontSizeRange" min="10" max="50" value={fontSize*10} onChange={(e)=>{
              //cahge this to PrettyApp property
              setfontSize(e.target.value / 10)
              document.documentElement.style.setProperty('--font-size', fontSize + "vh")
            }}></input>
            <label htmlFor="fontSizeRange">{`Font size: ${fontSize}`}</label>
          </Tab>
          <Tab eventKey="profile" title="Bot options">
            {prettyApp.BOT_STARTED === true ? (
              'Enabled'
            ) : (
              <Button variant="primary" onClick={() => prettyApp.tlgInit()}>
                Connect
              </Button>
            )}
          </Tab>
          <Tab eventKey="login" title="Login">
            <Login />
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
})

export default OptionsModal
