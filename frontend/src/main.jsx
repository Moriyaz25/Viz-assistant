import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

document.documentElement.classList.add('dark')
document.documentElement.style.colorScheme = 'dark'
document.body.style.background = 'hsl(30, 8%, 6%)'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)