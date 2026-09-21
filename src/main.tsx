import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/vt323'
import './styles/tokens.css'
import './styles/global.css'
import App from './App.tsx'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
const path = (pathname: string) => pathname.replace(/\/+$/, '') || '/'

// A built page arrives already drawn for its route (scripts/prerender.mjs)
// and is taken over where it stands. A page drawn for another address (the
// host's 404 page, answering for a dead link) is rendered afresh, as is the
// empty page the dev server sends.
if (root.dataset.prerendered === path(window.location.pathname))
  hydrateRoot(root, app)
else createRoot(root).render(app)
