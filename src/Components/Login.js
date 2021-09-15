import React from 'react'
import { useContext, useState } from 'react'
import { Form, Button, Row, Col,InputGroup } from 'react-bootstrap'
import { Context } from '../index'

const Login = () => {
  const { prettyApp } = useContext(Context)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  return (
    <Form className="loginForm">
      <Row>
        <Col>
          {' '}
          <Form.Group className="mb-3" controlId="formPhone">
            <Form.Label>Телефон</Form.Label>
            <InputGroup>
            <InputGroup.Text>+7</InputGroup.Text>
            <Form.Control placeholder="Телефон" value={phone} onChange={e => setPhone(e.target.value)}/>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col>
          {' '}
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Пароль</Form.Label>
            <Form.Control type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)}/>
          </Form.Group>
        </Col>
      </Row>
      <Button variant="success" onClick={() =>{
        prettyApp.login({login: `+7${phone}`, password:password})
      }}>
        Войти
      </Button>
    </Form>
  )
}

export default Login
