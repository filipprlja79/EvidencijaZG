/*
 * Komentar projekta: Ulazni React fajl koji pokrece aplikaciju ili povezuje glavne providere.
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/pages.css'

createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

