import React from 'react'
import { useContext } from 'react'
import { Context } from '../index'
import { observer } from 'mobx-react-lite'
import OrdersCard from './OrdersCard'

const DeliveryList = observer(() => {
  const { prettyApp } = useContext(Context)

  return (
    <div className="stuffLists">
      <h1 className="mainBodyH1" >Доставка {prettyApp.amountDelivering === 0 ? '' : prettyApp.amountDelivering}</h1>

      {prettyApp.ordersArray.delivery.pending.length !== 0
        ? <div>
          <h2 className="mainBodyH2">Не назначены</h2>
          <div className="pendingDiv">
            {prettyApp.ordersArray.delivery.pending.map(order => (
              <OrdersCard key={order.orderId} order={order} />
            ))}
          </div>
        </div>
        : ""}

      {prettyApp.ordersArray.delivery.reserved.length !== 0
        ? <div>
          <h2 className="mainBodyH2">В резерве</h2>
          {prettyApp.ordersArray.delivery.reserved.map(order => (
            <OrdersCard key={order.orderId} order={order} />
          ))}
        </div>
        : ""}

      {prettyApp.ordersArray.delivery.underway.length !== 0
        ? <div>
          <h2 className="mainBodyH2">В пути</h2>
          <div className="pendingDiv">
            {prettyApp.ordersArray.delivery.underway.map(order => (
              <OrdersCard key={order.orderId} order={order} />
            ))}
          </div>
        </div>
        : ""}

    </div>
  )
})

export default DeliveryList
