import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Stage from './components/Stage'

/** The routes on their own, so the build can render them without a browser. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Stage />} />
      <Route path="/project/:slug" element={<Stage />} />
      <Route path="*" element={<Stage notFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
