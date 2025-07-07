import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'



import './index.css'
import AppHeader from './components/AppHeader.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppHeader />

  </StrictMode>
)

