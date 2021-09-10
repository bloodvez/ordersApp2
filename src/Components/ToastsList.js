import React from 'react'
import { useContext } from 'react'
import { Context } from '../index'
import { observer } from 'mobx-react-lite'
import { Toast } from 'react-bootstrap'
// import useSound from 'use-sound'
// import tlgSound from './assets/tlgMsg.ogg';

const ToastsList = observer(() => {
  const { prettyApp } = useContext(Context)
  //const [playSound] = useSound(tlgSound);

  const prettierTime = (date) =>{
    let time = new Date(date)
    let hours = time.getHours()
    let minutes = time.getMinutes()
    if (hours < 10) hours = "0" + hours
    if (minutes < 10) minutes = "0" + minutes
    return `${hours}:${minutes}`
  }
  

  return (
    <div>
        {prettyApp.toasts.map(toast => (
            <Toast key={toast.messageId} onContextMenu={() => {
              prettyApp.setToasts(prettyApp.toasts.filter(compToast => compToast.messageId !== toast.messageId))
            }}>
            <Toast.Header closeButton={false}>
              <strong className="me-auto">{`От ${toast.author} из ${toast.chat}`}</strong>
              <small>{prettierTime(toast.date)}</small>
            </Toast.Header>
            <Toast.Body>{toast.text}{}</Toast.Body>
          </Toast>
        ))}
    </div>
  )
})

export default ToastsList
