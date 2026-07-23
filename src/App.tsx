/*
IMPECCABLE DIRECTION CONTRACT

THESIS: A design engineer's portfolio as a working AV rack — you pull a tape,
the machine plays it. Refuses the dark-portfolio scroll of glowing cards.

OWN-WORLD: "Midnight Studio." Matte graphite panels (#0e0f12–#262a32),
machined 1px seams, tracked silkscreen caps (Archivo), one VFD-cyan accent;
saturated color only on cassette labels; VT323 OSD inside the tube; the CRT
is the page's only light source (blue idle bloom, cast on the deck).

STORY: Visitor reads the whole rack in one viewport, hovers tapes (VFD
readout answers), inserts one; the CRT plays the project; eject returns it.

FIRST VIEWPORT: Centered column — nameplate top-left, ABOUT right; shelf of
six spines on a board; CRT showing blue INSERT TAPE; deck with VFD + EJECT;
spec-line footer.

FORM: Continuous stage. Brief-pinned world; no seed roll (pinned direction
beats the dice) — "Midnight studio" chosen by the user over the light
"Showroom" recommendation. Staging committed: single-row shelf above CRT
over deck; camera dollies to the tube on insert.
*/
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Stage from './components/Stage'

function App() {
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

export default App
