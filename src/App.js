import React from 'react'
import NavBar from "./Components/Navbar";
import DeliveryList from "./Components/DeliveryList";
import PickingList from "./Components/PickingList";
import ToastsList from "./Components/ToastsList";
import CouriersList from "./Components/CouriersList";

function App() {
  return (
    <div>
    <NavBar/>
    <PickingList/>
    <DeliveryList/>
    <CouriersList/>
    <ToastsList/>
    </div>
  )
}

export default App
