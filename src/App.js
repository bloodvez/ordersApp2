import React, { useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import NavBar from "./Components/Navbar";
import DeliveryList from "./Components/DeliveryList";
import PickingList from "./Components/PickingList";
import UnPickingList from "./Components/UnPickingList";
import ToastsList from "./Components/ToastsList";
import CouriersList from "./Components/CouriersList";

function App() {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(false)
  }, [])
  return (
    (loading === true)
      ? <Spinner animation="grow" variant="info" /> :
      <div>
        <NavBar />
        <div className="mainBody">
          <div className="ordersList">
            <PickingList />
            <UnPickingList />
            <DeliveryList />
          </div>
          <div className="couriersList">
            <CouriersList />
            <ToastsList />
          </div>
        </div>
      </div>
  )
}

export default App
