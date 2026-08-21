import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('Today\'s Focus deployment', {
  version: __APP_VERSION__,
  lastDeployedDate: __APP_LAST_DEPLOYED_DATE__,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
