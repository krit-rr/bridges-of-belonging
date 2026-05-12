import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Submit from './form'
import Graph from './graph'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Submit />} />
        <Route path="/form" element={<Submit />} />
        <Route path="/graph" element={<Graph />} />
      </Routes>
    </HashRouter>
  </StrictMode>
)