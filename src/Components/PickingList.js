import React from 'react'
import { useContext } from 'react'
import { Context } from '../index'
import { observer } from 'mobx-react-lite'
import OrdersCard from './OrdersCard'

const PickingList = observer(() => {
  const { prettyApp } = useContext(Context)

  return (
    <div>
      <h1>Сборка</h1>
      <div className="pendingDiv">
        {prettyApp.ordersArray.picking.pending.map(order => (
          <OrdersCard key={order.orderId} order={order} />
        ))}
      </div>
      {prettyApp.ordersArray.picking.underway.map(order => (
          <OrdersCard key={order.orderId} order={order} />
        ))}
    </div>
  )
})

export default PickingList
