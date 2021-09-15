import React from 'react'
import { useContext } from 'react'
import { Context } from '../index'
import { observer } from 'mobx-react-lite'
import CourierCard from './CourierCard'

const CouriersList = observer(() => {
  const { prettyApp } = useContext(Context)

  return (
    <div className="stuffLists">
        <h1>Курьеры</h1>
        <h2>Свободные</h2>
        <div>
          {prettyApp.ordersArray.couriers.free.map(courier => (
            <CourierCard courier={courier} />
          ))}
        </div>
        <h2>Возвращаются</h2>
        <div className="pendingDiv">
        {prettyApp.ordersArray.couriers.returning.map(courier => (
            <CourierCard courier={courier} />
          ))}
        </div>

    </div>
  )
})

export default CouriersList
