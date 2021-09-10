import React from 'react'
import { Card, ListGroup } from 'react-bootstrap'
import OrdersCardContent from './OrdersCardContent'

const OrdersCard = ({ order }) => {
  const ordersList = []
  if (order.orders) {
    order.orders.forEach(order => ordersList.push(order))
  } else if (order.order) {
    ordersList.push(order.order)
  } else {
    ordersList.push(order)
  }

  return (
    <Card>
      {order.assignee ? <Card.Header>{order.assignee}</Card.Header> : ''}
      <ListGroup variant="flush">
        {ordersList.map(order => (
          <ListGroup.Item key={order.orderId}>
            <OrdersCardContent order={order} />
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  )
}

export default OrdersCard
