import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './home'
import Form1 from './form1'
import Form2 from './form2'
import Graphic1 from './graphic1'
import Graphic2 from './graphic2'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/form1" element={<Form1 />} />
        <Route path="/form2" element={<Form2 />} />
        <Route path="/graphic1" element={<Graphic1 />} />
        <Route path="/graphic2" element={<Graphic2 />} />
      </Routes>
    </HashRouter>
  </StrictMode>
)