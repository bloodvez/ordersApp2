import React from 'react'
import { useContext } from 'react'
import { Context } from '../index'
import { observer } from 'mobx-react-lite'
import OrdersCard from './OrdersCard'

const UnPickingList = observer(() => {
    const { prettyApp } = useContext(Context)

    return (
        (prettyApp.ordersArray.unpicking.pending.length !== 0 &&
            prettyApp.ordersArray.unpicking.underway.length !== 0)
            ?
            <div className="stuffLists">
                <h1>Разбор</h1>
                <div className="pendingDiv">
                    {prettyApp.ordersArray.unpicking.pending.map(order => (
                        <OrdersCard key={order.orderId} order={order} />
                    ))}
                </div>
                {prettyApp.ordersArray.unpicking.underway.map(order => (
                    <OrdersCard key={order.orderId} order={order} />
                ))}
            </div>
            : ""
    )
})

export default UnPickingList
