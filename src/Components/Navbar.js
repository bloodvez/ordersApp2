import React from 'react'
import { useContext, useState } from 'react'
import { Context } from '../index'
import OptionsModal from '../Modals/OptionsModal'
import { observer } from 'mobx-react-lite'
import { Navbar, DropdownButton, Dropdown, Button } from 'react-bootstrap'

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

  const start = () => {
    prettyApp.start()
  }

  const stop = () => {
    prettyApp.stop()
  }

  return (
    <Navbar bg="dark" variant="dark">
      <DropdownButton
        id="dropdown-item-button"
        title="Actions"
        variant="success"
      >
        <Dropdown.Item onClick={getOrders} as="button">
          fetch online
        </Dropdown.Item>
        <Dropdown.Item onClick={refreshToken} as="button">
          refresh token
        </Dropdown.Item>
        {(prettyApp.intervalRunning === true) ?
        <Dropdown.Item onClick={stop} as="button">
          stop
        </Dropdown.Item>:
        <Dropdown.Item onClick={start} as="button">
          start
        </Dropdown.Item>
}
      </DropdownButton>

      <Button variant="success" onClick={handleShow}>
        Options
      </Button>
      <OptionsModal show={show} handleClose={handleClose}></OptionsModal>
    </Navbar>
  )
})

export default NavBar
