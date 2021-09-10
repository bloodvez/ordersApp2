import React from 'react'
import { ProgressBar } from 'react-bootstrap'

const OrdersCardContent = ({ order }) => {
  let orderSLA = Math.floor(
    (new Date(order.dueDate) - new Date(order.acceptedDate)) / 1000 / 60
  )
  let timeLeft = Math.floor((new Date(order.dueDate) - new Date()) / 1000 / 60)
  let timeToShow = timeLeft
  let timeClass = "cardTimeLeft"

  let progress = (timeLeft / orderSLA) * 100

  if (progress < 0) progress = 100
  if (timeLeft < 0) {
    timeToShow = `+${Math.abs(timeLeft)}`
    timeClass = "cardTimeLeft late"
  }

  return (
    <div>
      <div className="cardContents">
        <div>{order.deliveryDestination}</div>
        <div className={timeClass}>{timeToShow}</div>
      </div>
      {order.boxLabels.length !== 0
        ? `Боксы: ${order.boxLabels.map(label => ` ${label}`)}`
        : ''}
      {` Товаров: ${order.itemsTotal}`}
      {(timeLeft < 0) ? (
        <ProgressBar now={progress} variant="danger" />
      ) : (
        <ProgressBar now={progress} variant="success" />
      )}
    </div>
  )
}

export default OrdersCardContent
