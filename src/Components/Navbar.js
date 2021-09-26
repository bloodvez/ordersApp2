import React from 'react'
import { useContext, useState } from 'react'
import { Context } from '../index'
import OptionsModal from '../Modals/OptionsModal'
import { observer } from 'mobx-react-lite'
import { Navbar, DropdownButton, Dropdown, Button, Alert } from 'react-bootstrap'

const NavBar = observer(() => {
  const { prettyApp } = useContext(Context)
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const getOrders = () => {
    prettyApp.getOrders()
  }

  const refreshToken = () => {
    prettyApp.refreshToken().then(data => {
      alert('Done')
    })
  }

  const handleExit = () =>{
    prettyApp.exitApp()
  }

  return (
    <Navbar bg="dark" variant="dark">
      <DropdownButton
        id="dropdown-item-button"
        title="Actions"
        variant="success"
      >
        {(prettyApp.intervalRunning === true) ?
          <Dropdown.Item className="dropdown-stop" onClick={_ => prettyApp.stop()} as="button">
            Стоп
          </Dropdown.Item> :
          <Dropdown.Item className="dropdown-start" onClick={_ => prettyApp.start()} as="button">
            Старт
          </Dropdown.Item>
        }
        
        <Dropdown.Item onClick={getOrders} as="button">
          Обновить
        </Dropdown.Item>

        <Dropdown.Item onClick={refreshToken} as="button">
          refresh token
        </Dropdown.Item>

        {(prettyApp.fullscreen === false) ?
          <Dropdown.Item onClick={_ => prettyApp.toggleFullscreen()} as="button">
            Fullscreen
          </Dropdown.Item> :
          <Dropdown.Item onClick={_ => prettyApp.toggleFullscreen()} as="button">
            Exit fullscreen
          </Dropdown.Item>}

          <Dropdown.Item onClick={handleExit} as="button">
          Exit
        </Dropdown.Item>

      </DropdownButton>

      <Button variant="success" onClick={handleShow}>
        Settings
      </Button>

      {prettyApp.wsConnected ?
        <Alert variant="success">
          Bot Connected
        </Alert> :
        <Alert variant="danger">
          Bot not connected
        </Alert>
      }
      {prettyApp.intervalRunning ?
        <Alert variant="success">
          Running
        </Alert> :
        <Alert variant="warning">
          Stopped
        </Alert>
      }

      <OptionsModal show={show} handleClose={handleClose}></OptionsModal>
    </Navbar>
  )
})

export default NavBar
