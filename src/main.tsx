import { StrictMode }    from 'react'
import { createRoot }    from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App               from './App'
import                   './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('[DanfeGen] elemento #root não encontrado no DOM')

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)