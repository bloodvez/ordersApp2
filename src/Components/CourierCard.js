import React from 'react'
import { Card, ListGroup } from 'react-bootstrap'

const CourierCard = ({ courier }) => {

    let timeClass = "cardTimeLeft"
    let timeToShow = ""
    if(courier.estimatedArrivalDate){
        let timeLeft = Math.floor((new Date(courier.estimatedArrivalDate) - new Date())/1000/60)
        timeToShow = timeLeft
        if (timeLeft < 0) {
            timeToShow = `+${Math.abs(timeLeft)}`
            timeClass = "cardTimeLeft late"
          }
    }

  return (
    <Card>
      <Card.Header>{courier.name}</Card.Header>
      <ListGroup variant="flush">
          {courier.startingPoint ?
          <ListGroup.Item key={courier.name}>
              <div className="pendingDiv">
              <div>{courier.startingPoint}</div>
          <div className={timeClass}>{timeToShow}</div>
              </div>
          </ListGroup.Item> :
          ""}

      </ListGroup>
    </Card>
  )
}

export default CourierCard
