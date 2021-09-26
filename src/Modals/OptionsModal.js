import React from 'react'
import { Button, Tab, Tabs, Modal } from 'react-bootstrap'
import { observer } from 'mobx-react-lite'
import Login from '../Components/Login'
import WSOptions from '../Components/WSOptions'
import Settings from '../Components/Settings'

const OptionsModal = observer(({ show, handleClose }) => {

  return (
    <Modal className="settingsModal" show={show} onHide={handleClose} size="lg">
      <Modal.Header>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs defaultActiveKey="home">
          <Tab eventKey="home" title="Options">
            <Settings />
          </Tab>
          <Tab eventKey="profile" title="Bot options">
            <WSOptions />
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
