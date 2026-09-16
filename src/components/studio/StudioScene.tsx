import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react'
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Group, MathUtils, OrthographicCamera, Vector3 } from 'three'
import type { Project } from '../../content/types'
import { shelfTapes } from '../../content/projects'
import { isComing } from '../../content/types'
import { Solid } from './geometry'
import { DetailBoxes, Turned, VentPanel } from './ModelDetails'
import { STUDIO } from './materials'
import {
  makeTexture,
  subscribeTextureUpdates,
  useTextureDisposal,
} from './textures'
import Tape from './Tape'
import BlankTape from './BlankTape'
import Player from './Player'
import Headphones from './Headphones'
import Speaker from './Speaker'
import TapeRack from './TapeRack'
import CassetteModel from './CassetteModel'
import {
  EJECT_SECONDS,
  INSERT_SECONDS,
  isTouchEvent,
  PLAYER,
  resolveSlotTap,
} from './transport'
import {
  createStudioFraming,
  playbackZoom,
  type StudioFraming,
} from './framing'
import styles from './StudioScene.module.css'
import type { DeckControlsProps } from '../DeckControls'

interface StudioProps extends DeckControlsProps {
  tape: Project | null
  preview: Project | null
  open: boolean
  invalid: boolean
  reduced: boolean
  /** Counts skipped insertions; a change during playback snaps the camera. */
  skips: number
  inserting: boolean
  /** The tape running the mechanism back to its slot after eject. */
  ejecting: Project | null
  /**
   * Playback has closed and the canvas still covers the viewport: the camera
   * eases the studio back into its box on the page, then reports in.
   */
  returning: boolean
  /** Modeled playback: the reader and keys live on the equipment. */
  playback: boolean
  /** The studio's box on the page, which keeps its place during playback. */
  box: RefObject<HTMLDivElement | null>
  deckPortal: RefObject<HTMLDivElement | null>
  onSelect: (tape: Project) => void
  onPreview: (tape: Project | null) => void
  onInserted: () => void
  onEjected: () => void
  /** The studio is drawn in its box again; the canvas can rejoin the page. */
  onReturned: () => void
  onReady: () => void
  onCreated: (state: RootState) => void
  onUnavailable: () => void
  children: ReactNode
}

/**
 * The transport phase as of the page's latest commit. The renderer delivers
 * props to the scene a commit later than the page, but the canvas is resized
 * in the page's commit, so the rig reads the phase from here on every frame
 * and never draws one frame for the old phase in the new box.
 */
interface Phase {
  open: boolean
  returning: boolean
  inserting: boolean
}

/** A rectangle in viewport pixels. */
interface Frame {
  x: number
  y: number
  width: number
  height: number
}

function setFrame(frame: Frame, rect: Frame) {
  frame.x = rect.x
  frame.y = rect.y
  frame.width = rect.width
  frame.height = rect.height
}

function easeFrame(frame: Frame, goal: Frame, factor: number) {
  frame.x = MathUtils.lerp(frame.x, goal.x, factor)
  frame.y = MathUtils.lerp(frame.y, goal.y, factor)
  frame.width = MathUtils.lerp(frame.width, goal.width, factor)
  frame.height = MathUtils.lerp(frame.height, goal.height, factor)
}

function frameDistance(a: Frame, b: Frame) {
  return Math.max(
    Math.abs(a.x - b.x),
    Math.abs(a.y - b.y),
    Math.abs(a.width - b.width),
    Math.abs(a.height - b.height),
  )
}

/** The camera eases between the fitted views at this rate. */
const VIEW_RATE = 7
/** The studio's frame grows out of its box, and shrinks back, at this rate. */
const FRAME_RATE = 5

/**
 * The camera is authored, not orbited: it eases between the fitted views.
 *
 * It also eases the studio's frame. While browsing, the frame is the canvas
 * in its box on the page. Selection moves the canvas over the whole viewport,
 * but the studio keeps drawing in the box's place, and its frame then grows
 * softly to the viewport; after eject the frame shrinks back to the box, and
 * only then does the canvas rejoin the page. The studio is fitted to the
 * frame and panned onto its centre, so neither box change is visible.
 */
function CameraRig({
  open,
  reduced,
  skips,
  inserting,
  returning,
  box,
  phase,
  framing,
  onReturned,
}: Pick<
  StudioProps,
  | 'open'
  | 'reduced'
  | 'skips'
  | 'inserting'
  | 'returning'
  | 'box'
  | 'onReturned'
> & { phase: RefObject<Phase>; framing: RefObject<StudioFraming | null> }) {
  const { size, invalidate } = useThree()
  const rig = useRef({
    moving: true,
    initialized: false,
    previousSkips: skips,
    skip: false,
    wasOpen: open,
    wasReturning: returning,
    wasInserting: inserting,
    /** Seconds left to wait for the viewport box after a selection. */
    departing: 0,
    returned: false,
    lastWidth: 0,
    lastHeight: 0,
    /** A change outside the phase (skip, reduced motion, resize) to follow. */
    wake: false,
    /** The authored view, before the pan that centres the frame. */
    base: new Vector3(),
    look: new Vector3(0, 1.9, 0),
    focus: 0,
    frame: { x: 0, y: 0, width: 0, height: 0 } as Frame,
  })
  const scratch = useRef({
    position: new Vector3(),
    target: new Vector3(),
    right: new Vector3(),
    up: new Vector3(),
    canvas: { x: 0, y: 0, width: 0, height: 0 } as Frame,
    goal: { x: 0, y: 0, width: 0, height: 0 } as Frame,
  })
  useEffect(() => {
    const state = rig.current
    state.skip = open && state.previousSkips !== skips
    state.previousSkips = skips
    state.wake = true
    invalidate()
  }, [open, reduced, skips, inserting, returning, size, invalidate])
  useFrame(({ camera, size }, delta) => {
    const state = rig.current
    const { position, target, right, up, canvas, goal } = scratch.current
    const fit = framing.current
    if (!(camera instanceof OrthographicCamera) || !fit) return
    const { open, returning, inserting } = phase.current
    // A move that starts from rest begins with an ordinary frame's step, not
    // the whole gap since the last drawn frame: idle time, or a long commit.
    const step = Math.min(delta, state.moving ? 0.05 : 1 / 60)
    if (
      state.wake ||
      open !== state.wasOpen ||
      returning !== state.wasReturning ||
      inserting !== state.wasInserting
    ) {
      state.moving = true
      state.wake = false
    }
    const resized =
      size.width !== state.lastWidth || size.height !== state.lastHeight
    state.lastWidth = size.width
    state.lastHeight = size.height
    canvas.x = size.left
    canvas.y = size.top
    canvas.width = size.width
    canvas.height = size.height
    // Where the frame is heading: the whole canvas, or, on the way back to
    // the page, the studio's box.
    const detached = open || returning
    if (returning && box.current)
      setFrame(goal, box.current.getBoundingClientRect())
    else setFrame(goal, canvas)
    if (open && !state.wasOpen) state.returned = false
    // The departure frame is drawn exactly where the box had the studio; the
    // frame starts easing out on the next one.
    let departure = false
    if (open && !state.wasOpen && !state.wasReturning && box.current) {
      // Depart from the box: the canvas takes the viewport in this commit or
      // the next, and the studio holds its place until the frame eases out.
      setFrame(state.frame, box.current.getBoundingClientRect())
      state.departing = 0.5
      departure = true
    } else if (!detached) {
      // Browsing: the canvas is the box.
      setFrame(state.frame, canvas)
    } else if (resized && state.departing <= 0 && !returning) {
      // A viewport resize during playback refits at once, as before.
      setFrame(state.frame, goal)
    }
    if (state.departing > 0)
      state.departing = resized ? 0 : state.departing - step
    state.wasOpen = open
    state.wasReturning = returning
    state.wasInserting = inserting

    const focus = open && !inserting
    const narrow = size.width <= 600
    position.set(
      focus ? PLAYER.playbackX : narrow ? 3.8 : 5.8,
      focus ? PLAYER.playbackY : narrow ? 5.05 : 5.75,
      12,
    )
    target.set(
      focus ? PLAYER.playbackX : narrow ? 0.25 : 0,
      focus ? PLAYER.playbackY : narrow ? 2 : 1.9,
      0,
    )
    const snap = reduced || !state.initialized || state.skip
    const drift = snap ? 1 : 1 - Math.exp(-step * FRAME_RATE)
    // The way back is one move: the view pulls back at the frame's own rate.
    const factor = returning
      ? drift
      : snap
        ? 1
        : 1 - Math.exp(-step * VIEW_RATE)
    if (state.moving) {
      state.base.lerp(position, factor)
      state.look.lerp(target, factor)
      state.focus = MathUtils.lerp(state.focus, focus ? 1 : 0, factor)
      if (!departure) easeFrame(state.frame, goal, drift)
    }
    camera.position.copy(state.base)
    camera.lookAt(state.look)
    const zoom = fit(camera, state.frame.width, state.frame.height, state.focus)
    // Shrink immediately when an edge needs space; ease back into a closer
    // fit. A shrinking frame is followed exactly, so it stays smooth.
    camera.zoom = snap
      ? zoom
      : Math.min(zoom, MathUtils.lerp(camera.zoom, zoom, factor))
    camera.updateProjectionMatrix()
    // Pan the studio onto the frame's centre rather than the canvas's. An
    // orthographic camera moves the picture exactly as far as it moves.
    const dx =
      (state.frame.x + state.frame.width / 2 - (canvas.x + canvas.width / 2)) /
      camera.zoom
    const dy =
      (state.frame.y +
        state.frame.height / 2 -
        (canvas.y + canvas.height / 2)) /
      camera.zoom
    right.set(1, 0, 0).applyQuaternion(camera.quaternion)
    up.set(0, 1, 0).applyQuaternion(camera.quaternion)
    camera.position.addScaledVector(right, -dx).addScaledVector(up, dy)
    camera.updateMatrixWorld()
    state.initialized = true
    const framed = frameDistance(state.frame, goal) < 0.5
    if (
      (!state.moving ||
        (state.base.distanceTo(position) < 0.002 &&
          state.look.distanceTo(target) < 0.002)) &&
      Math.abs(camera.zoom - zoom) < 0.02 &&
      framed
    ) {
      state.moving = false
      state.skip = false
    } else invalidate()
    if (returning && framed && !state.returned) {
      state.returned = true
      onReturned()
    }
  })
  return null
}

/** The modeled reader's reference plane: 560 CSS px across the 2.8-unit screen. */
const READER_WIDTH = 560
const READER_HEIGHT = 420
/** Drei's transform mode draws one CSS px as zoom × distanceFactor / 400 px. */
const READER_DISTANCE = 2
/** The zoom at which one reader CSS px is one screen px. */
const READER_ZOOM = 400 / READER_DISTANCE

function Screen({
  open,
  invalid,
  preview,
  inserting,
  framing,
  children,
}: Pick<
  StudioProps,
  'open' | 'invalid' | 'preview' | 'inserting' | 'children'
> & { framing: RefObject<StudioFraming | null> }) {
  const plane = useRef<Group>(null)
  const content = useRef<HTMLDivElement | null>(null)
  const reader = useRef({ width: 0, height: 0, enlarge: 1 })
  // Drei mounts the reader through its own root, after the frame that sized
  // the plane: the content takes its size as it arrives.
  const sizeContent = useCallback((el: HTMLDivElement | null) => {
    content.current = el
    if (!el) return
    const { enlarge } = reader.current
    el.style.width = `${READER_WIDTH / enlarge}px`
    el.style.height = `${READER_HEIGHT / enlarge}px`
  }, [])
  useFrame(({ size }) => {
    const fit = framing.current
    const state = reader.current
    if (!plane.current || !fit) return
    if (size.width === state.width && size.height === state.height) return
    state.width = size.width
    state.height = size.height
    // Below the reference zoom the tube would draw the reader smaller than
    // its CSS, and with it the prose under the 16px it was set at. Enlarge
    // the plane and shrink the content to match, so one CSS px is one
    // screen px and the type's rem floors are real pixels (The Tube-Scale
    // Rule). Above the reference zoom the reader scales up as before.
    state.enlarge = Math.max(
      1,
      READER_ZOOM / playbackZoom(fit, size.width, size.height),
    )
    plane.current.scale.setScalar(state.enlarge)
    plane.current.updateWorldMatrix(true, false)
    sizeContent(content.current)
  }, -1)
  const texture = useMemo(
    () =>
      makeTexture(1024, 768, (ctx) => {
        // The lit area has the reader's corners (14px on its 560px plane),
        // so the tube reads the same before and after a tape goes in.
        ctx.fillStyle = '#07080c'
        ctx.fillRect(0, 0, 1024, 768)
        ctx.beginPath()
        ctx.roundRect(0, 0, 1024, 768, 26)
        ctx.clip()
        ctx.fillStyle = '#242bd9'
        ctx.fillRect(0, 0, 1024, 768)
        ctx.fillStyle = '#bfc9ff'
        ctx.font = '28px "VT323", monospace'
        ctx.fillText(inserting ? 'SP  ·  LOADING' : 'SP  ·  STANDBY', 64, 73)
        ctx.textAlign = 'right'
        ctx.fillText('CH 01', 960, 73)
        ctx.strokeStyle = '#818cfc'
        ctx.lineWidth = 2
        ctx.strokeRect(448, 212, 128, 80)
        ctx.beginPath()
        ctx.arc(486, 252, 16, 0, Math.PI * 2)
        ctx.moveTo(555, 252)
        ctx.arc(538, 252, 16, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = '#f0f0ff'
        ctx.font = '128px "VT323", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(
          inserting
            ? 'LOADING TAPE'
            : preview
              ? preview.vhs.spineLabel.split(' · ')[0]
              : 'INSERT TAPE',
          512,
          410,
        )
        ctx.fillStyle = '#c4ccff'
        ctx.font = '88px "VT323", monospace'
        ctx.fillText(preview ? 'SELECT THIS TAPE' : 'CHOOSE A TAPE', 512, 515)
        ctx.fillText('TO PLAY', 512, 603)
        ctx.textAlign = 'left'
        ctx.font = '24px "VT323", monospace'
        ctx.fillText('ALYOSHIN ARCHIVE', 64, 698)
        ctx.textAlign = 'right'
        ctx.fillText('HI-FI STEREO', 960, 698)
        ctx.fillStyle = 'rgba(0,0,0,.12)'
        for (let y = 0; y < 768; y += 4) ctx.fillRect(0, y, 1024, 1)
      }),
    [preview, inserting],
  )
  useTextureDisposal(texture)
  return (
    <group name="crt-screen" position={[-1.35, PLAYER.screenY, 1.22]}>
      <Solid size={[2.84, 2.14, 0.055]} bevel={0.02}>
        <meshBasicMaterial color="#07080c" toneMapped={false} />
      </Solid>
      {(!open || inserting) && (
        <mesh position={[0, 0, 0.031]}>
          <planeGeometry args={[2.8, 2.1]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      )}
      <group ref={plane} position={[0, 0, 0.035]}>
        {open && !inserting && children && (
          <Html
            transform
            distanceFactor={READER_DISTANCE}
            zIndexRange={[40, 30]}
            style={{ pointerEvents: 'auto' }}
          >
            <div
              className={styles.screenContent}
              ref={sizeContent}
              onPointerDown={(event) => event.stopPropagation()}
              data-testid="project-reader"
            >
              {children}
            </div>
          </Html>
        )}
      </group>
      <pointLight
        position={[0, -0.8, 0.6]}
        color={open && !invalid ? '#b4c4ff' : '#4145ff'}
        intensity={3}
        distance={3.3}
        decay={2}
      />
    </group>
  )
}

// The dial's turned profiles, as (radius, depth) from the chin's face.
const dialWell: [number, number][] = [
  [0, 0],
  [0.07, 0],
  [0.07, 0.006],
  [0, 0.006],
]
const dialRing: [number, number][] = [
  [0.07, 0],
  [0.082, 0],
  [0.082, 0.02],
  [0.076, 0.024],
  [0.07, 0.02],
]
const dialKnob: [number, number][] = [
  [0, 0.004],
  [0.06, 0.004],
  [0.06, 0.02],
  [0.052, 0.026],
  [0.052, 0.078],
  [0.046, 0.09],
  [0.026, 0.097],
  [0, 0.097],
]
// Seven marks over the knob's 270° sweep, from seven o'clock round to five.
const dialTicks = Array.from({ length: 7 }, (_, i) => {
  const angle = (Math.PI * 5) / 4 - (i * Math.PI) / 4
  return {
    size: [0.014, 0.005, 0.006] as [number, number, number],
    position: [0.093 * Math.cos(angle), 0.093 * Math.sin(angle), 0.003] as [
      number,
      number,
      number,
    ],
    rotation: angle,
  }
})
// The pointer sits a third of the way round: set, not maxed.
const dialPointerAngle = Math.PI / 2 - Math.PI / 5
const dialPointer = [
  {
    size: [0.03, 0.007, 0.004] as [number, number, number],
    position: [
      0.034 * Math.cos(dialPointerAngle),
      0.034 * Math.sin(dialPointerAngle),
      0.099,
    ] as [number, number, number],
    rotation: dialPointerAngle,
  },
]

/**
 * The monitor's one control: a turned knob in a recessed escutcheon with a
 * raised ring, a molded pointer, and a short arc of tick marks, built from the
 * same 24-sided profiles and merged details as the speaker and fasteners.
 */
function Dial(props: { position: [number, number, number] }) {
  return (
    <group name="crt-dial" {...props}>
      <Turned profile={dialWell} color={STUDIO.recess} />
      <Turned profile={dialRing} color={STUDIO.face} />
      <DetailBoxes boxes={dialTicks} color={STUDIO.edge} />
      <Turned profile={dialKnob} color={STUDIO.hardware} roughness={0.76} />
      <DetailBoxes boxes={dialPointer} color={STUDIO.recess} />
    </group>
  )
}

function Monitor() {
  return (
    <group name="crt-monitor" position={[-1.35, 3.1, 0.15]}>
      {/* The rear shell's floor is level with the bezel's bottom, as on a
          real set, so the underside is one plane on four identical pads. */}
      <Solid
        size={[3.12, 2.68, 1.5]}
        position={[0, -0.06, -0.31]}
        color={STUDIO.shell}
        bevel={0.17}
      />
      <Solid
        size={[3.35, 2.8, 0.52]}
        position={[0, 0, 0.59]}
        color={STUDIO.face}
        bevel={0.12}
      />
      <Solid
        size={[3.17, 2.61, 0.22]}
        position={[0, 0.015, 0.88]}
        color={STUDIO.shell}
        bevel={0.07}
      />
      <Solid
        size={[3.01, 2.29, 0.075]}
        position={[0, 0.13, 1.015]}
        color={STUDIO.recess}
        bevel={0.055}
      />
      <Dial position={[1.338, -1.142, 0.99]} />
      <VentPanel
        name="monitor-side-vents"
        width={0.62}
        height={0.65}
        rows={9}
        position={[1.56, 0.63, -0.5]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <VentPanel
        name="monitor-top-vents"
        width={1.55}
        height={0.72}
        rows={8}
        position={[0, 1.28, -0.27]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      {/* Four identical low pads in the speaker's style: under the bezel's
          front corners and the shell's rear corners. */}
      {[
        [1.39, 0.65],
        [1.275, -0.86],
      ].flatMap(([x, z]) =>
        [-1, 1].map((side) => (
          <Solid
            key={`${side}-${z}`}
            size={[0.4, 0.03, 0.28]}
            position={[side * x, -1.415, z]}
            color={STUDIO.rubber}
            bevel={0.012}
          />
        )),
      )}
    </group>
  )
}

function Table() {
  return (
    <group name="studio-table">
      <Solid
        size={[9.5, 0.16, 5.15]}
        position={[0, 0.08, 0]}
        color={STUDIO.shell}
        bevel={0.1}
      />
      <Solid
        name="studio-tabletop"
        size={[8.65, 0.19, 4]}
        position={[0, 0.68, 0.48]}
        color={STUDIO.tabletop}
        bevel={0.035}
      />
      <Solid
        size={[8.48, 0.08, 3.86]}
        position={[0, 0.56, 0.48]}
        color={STUDIO.recess}
        bevel={0.012}
      />
      {/* A recessed pedestal carries the top: one broad plane in shadow,
          rather than two thin legs whose foot rails showed at the corners. */}
      <Solid
        size={[7.6, 0.4, 3.2]}
        position={[0, 0.36, 0.48]}
        color="#1a2029"
        bevel={0.018}
      />
    </group>
  )
}

function LooseTape() {
  // The shell's underside rests on the tabletop (0.775 + 0.9 × 0.172); the
  // slightly deeper guard and underside mold detail sink into the top unseen.
  return (
    <group
      name="decorative-tape"
      position={[2.1, 0.93, 1.9]}
      rotation={[0, -0.12, 0]}
    >
      <group rotation={[-Math.PI / 2, 0, 0]} scale={0.9}>
        <CassetteModel />
      </group>
    </group>
  )
}

function SceneContents(props: StudioProps & { phase: RefObject<Phase> }) {
  const { gl, scene, invalidate } = useThree()
  const get = useThree((state) => state.get)
  const set = useThree((state) => state.set)
  const { onReady, onUnavailable, onInserted, onEjected } = props
  const framing = useRef<StudioFraming | null>(null)
  // What a tap that hit nothing means, read from the page's latest commit.
  const latest = useRef(props)
  useLayoutEffect(() => {
    latest.current = props
  })
  useEffect(() => {
    framing.current = createStudioFraming(
      scene.getObjectByName('studio-model')!,
    )
    invalidate()
  }, [scene, invalidate])
  // A click or tap that hit nothing interactive. The renderer reads this
  // from its store on every event, so it stays live across renders.
  useEffect(() => {
    const onPointerMissed = (event: MouseEvent) => {
      // A second tap close on the first also arrives as a double click, a
      // mouse-typed event the click before it has already answered.
      if (event.type !== 'click') return
      const { open, ejecting, preview, onPreview, onSelect } = latest.current
      // A fingertip clear of every slot target may still mean a slot: the
      // nearest one whose 44px catch holds the tap (The Touch Rule).
      if (!open && isTouchEvent(event)) {
        const { camera } = get()
        const index = resolveSlotTap(
          event.clientX,
          event.clientY,
          shelfTapes.length,
          camera,
          gl.domElement.getBoundingClientRect(),
        )
        if (index >= 0) {
          const slot = shelfTapes[index]
          // A blank slot swallows the tap, and a returning tape is not
          // yet a choice.
          if (isComing(slot) || ejecting?.slug === slot.slug) return
          if (preview?.slug === slot.slug) onSelect(slot)
          else onPreview(slot)
          return
        }
      }
      onPreview(null)
    }
    set({ onPointerMissed })
  }, [get, gl, set])
  const progress = useRef(1)
  const previousTape = useRef<string | null>(null)
  const completed = useRef(false)
  const ejected = useRef(false)
  // Playback reopened by history before the tape landed: it seats again.
  const ejecting = props.tape ? null : props.ejecting
  const hold = useRef<{
    width: number
    height: number
    elapsed: number
  } | null>(null)
  useEffect(() => subscribeTextureUpdates(invalidate), [invalidate])
  // One timeline drives the tape and flap. Playback begins after the mechanism
  // finishes, even when a slow device takes longer to render the sequence.
  useFrame(({ size }, delta) => {
    const slug = props.tape?.slug ?? null
    if (slug && previousTape.current !== slug) {
      progress.current = 0
      completed.current = false
      // Selection also moves the canvas to its full-viewport box, sized in
      // the same commit. Keep the tape at rest until that box has been drawn
      // once, in case the size arrives through the resize observer instead.
      hold.current = { width: size.width, height: size.height, elapsed: 0 }
    }
    previousTape.current = slug
    const step = Math.min(delta, 0.05)
    if (ejecting) {
      // Eject runs the timeline back from wherever it is: the flap opens,
      // the tape leaves the deck, turns, and settles into its slot along the
      // path it came by. The canvas has its browse box back already.
      hold.current = null
      progress.current = props.reduced
        ? 0
        : Math.max(0, progress.current - step / EJECT_SECONDS)
      if (progress.current > 0) invalidate()
      else if (!ejected.current) {
        ejected.current = true
        onEjected()
      }
      return
    }
    ejected.current = false
    if (props.reduced || !props.inserting || !props.tape) {
      progress.current = 1
      hold.current = null
    } else if (hold.current) {
      const waiting = hold.current
      waiting.elapsed += delta
      const resized =
        size.width !== waiting.width || size.height !== waiting.height
      const fills =
        Math.abs(size.width - window.innerWidth) < 2 &&
        Math.abs(size.height - window.innerHeight) < 2
      if (resized || fills || waiting.elapsed > 0.3) hold.current = null
    } else
      progress.current = Math.min(1, progress.current + step / INSERT_SECONDS)
    if (props.inserting) {
      if (progress.current < 1) invalidate()
      else if (!completed.current) {
        completed.current = true
        onInserted()
      }
    }
  }, -1)
  useEffect(() => {
    const canvas = gl.domElement
    const lost = (event: Event) => {
      event.preventDefault()
      onUnavailable()
    }
    canvas.addEventListener('webglcontextlost', lost)
    onReady()
    return () => {
      canvas.removeEventListener('webglcontextlost', lost)
      document.body.style.cursor = ''
    }
  }, [gl, invalidate, onReady, onUnavailable])
  return (
    <>
      <CameraRig {...props} phase={props.phase} framing={framing} />
      <ambientLight intensity={0.85} color="#e8e9ee" />
      <hemisphereLight args={['#eceef3', '#36383e', 1.2]} />
      <directionalLight
        position={[-3, 8, 5]}
        intensity={3.1}
        color="#fff8ee"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-normalBias={0.035}
        shadow-bias={-0.0002}
        shadow-radius={4}
      />
      <directionalLight
        position={[5, 4, -3]}
        intensity={1.25}
        color="#d4dae4"
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.018, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <shadowMaterial transparent opacity={0.24} />
      </mesh>
      <group name="studio-model">
        <Table />
        <Monitor />
        <Player
          tape={props.tape}
          inserting={props.inserting}
          ejecting={!!ejecting}
          progress={progress}
          interactive={props.playback && !props.inserting}
          portal={props.deckPortal}
          invalid={props.invalid}
          soundOn={props.soundOn}
          onEject={props.onEject}
        />
        <Speaker />
        <LooseTape />
        <TapeRack />
        <Headphones />
        {shelfTapes.map((tape, index) =>
          isComing(tape) ? (
            <BlankTape key={tape.id} id={tape.id} index={index} />
          ) : (
            <Tape
              key={tape.slug}
              tape={tape}
              index={index}
              active={!props.open && props.preview?.slug === tape.slug}
              selected={props.tape?.slug === tape.slug}
              ejecting={ejecting?.slug === tape.slug}
              reduced={props.reduced}
              progress={progress}
              interactive={!props.open && ejecting?.slug !== tape.slug}
              onSelect={props.onSelect}
              onPreview={props.onPreview}
            />
          ),
        )}
        <Screen {...props} framing={framing} />
      </group>
    </>
  )
}

export default function StudioScene(props: StudioProps) {
  // Written in the page's commit, read by the rig on every frame (see Phase).
  const phase = useRef<Phase>({
    open: props.open,
    returning: props.returning,
    inserting: props.inserting,
  })
  useLayoutEffect(() => {
    phase.current = {
      open: props.open,
      returning: props.returning,
      inserting: props.inserting,
    }
  })
  return (
    <Canvas
      shadows="percentage"
      orthographic
      camera={{ position: [8.2, 6.65, 12], zoom: 75, near: 0.1, far: 100 }}
      dpr={props.playback ? [1, 2] : [1, 1.75]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      // The renderer's own wrapper opts back into pointer events; on the way
      // back to the page the links underneath must answer the pointer first.
      style={{ pointerEvents: props.returning ? 'none' : 'auto' }}
      fallback={<p>The tape archive is available below.</p>}
      onCreated={props.onCreated}
    >
      <SceneContents {...props} phase={phase} />
    </Canvas>
  )
}
