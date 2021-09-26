import React from 'react'
import { Card, ListGroup } from 'react-bootstrap'

const CourierCard = ({ courier }) => {

  let timeClass = "cardTimeLeft"
  let timeToShow = ""
  let date

  if (courier.estimatedArrivalDate) date = courier.estimatedArrivalDate
  else if (courier.releaseDate) date = courier.releaseDate
  else if (courier.assignedDate) date = courier.assignedDate

  let timeLeft = Math.floor((new Date(date) - new Date()) / 1000 / 60)
  timeToShow = timeLeft
  if (timeLeft < 0) {
    timeToShow = `+${Math.abs(timeLeft)}`
    timeClass += " late"
  }


  return (
    <Card>
      <Card.Header>
        <div>{courier.name}</div>
      </Card.Header>
      <ListGroup variant="flush">
        {courier.startingPoint
          ?
          <ListGroup.Item key={courier.name}>
            <div className="pendingDiv">
              <div className="cardDestination">{courier.startingPoint}</div>
              <div className={timeClass}>{timeToShow}</div>
            </div>
          </ListGroup.Item>
          : courier.taskDescription
            ?
            <ListGroup.Item key={courier.name}>
              <div className="pendingDiv">
                <div>{courier.taskDescription}</div>
                <div className="cardTimeLeft">{timeToShow}</div>
              </div>
            </ListGroup.Item>
            : ""}
      </ListGroup>
    </Card>
  )
}

export default CourierCard
