import React from 'react'
import { useContext } from 'react'
import { Context } from '../index'
import { observer } from 'mobx-react-lite'
import OrdersCard from './OrdersCard'

const DeliveryList = observer(() => {
  const { prettyApp } = useContext(Context)

  return (
    <div className="stuffLists">
      <h1>Доставка {prettyApp.amountDelivering === 0 ? '' : prettyApp.amountDelivering}</h1>
      <h2>Не назначены</h2>
      <div className="pendingDiv">
      {prettyApp.ordersArray.delivery.pending.map(order => (
        <OrdersCard key={order.orderId} order={order} />
      ))}
      </div>
      <h2>В резерве</h2>
      {prettyApp.ordersArray.delivery.reserved.map(order => (
        <OrdersCard key={order.orderId} order={order} />
      ))}
      <h2>В пути</h2>
      <div className="pendingDiv">
      {prettyApp.ordersArray.delivery.underway.map(order => (
        <OrdersCard key={order.orderId} order={order} />
      ))}
      </div>

    </div>
  )
})

export default DeliveryList
