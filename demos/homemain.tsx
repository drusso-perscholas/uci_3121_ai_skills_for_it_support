import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './home.css'
import Home from './home.tsx'
import * as React from 'react'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Home />
    </StrictMode>,
)