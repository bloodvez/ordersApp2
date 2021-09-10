import React, { createContext } from 'react'
import ReactDOM from 'react-dom'
import PrettyApp from './PrettyApp'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import App from './App'
export const Context = createContext(null)

ReactDOM.render(
  <React.StrictMode>
    <Context.Provider
      value={{
        prettyApp: new PrettyApp()
      }}
    >
      <App />
    </Context.Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
