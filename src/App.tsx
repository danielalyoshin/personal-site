import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Stage from './components/Stage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Stage />} />
        <Route path="/project/:slug" element={<Stage />} />
        <Route path="*" element={<Stage notFound />} />
      </Routes>
    </BrowserRouter>
  )
}
