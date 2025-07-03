import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'


import './index.css'
import Dashboard from './pages/Dashboard.tsx'
import Assets from './pages/Assets.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assets" element={<Assets />} />

      </Routes>
      

    </BrowserRouter>

  </StrictMode>,
)

