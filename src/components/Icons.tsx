import type { ReactNode, SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
}

/* Interface marks are drawn, not typed: Archivo has no arrows, so a typed
   glyph would come from whichever fallback font has one and mismatch its
   label's weight. Strokes are 1.5 units on a 16-unit box, close to Archivo's
   stem at text sizes. Every icon is decorative; its label carries the name. */
function Icon({
  size = '1em',
  children,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

/** Internal playback: the About link, every tape entry, and the PLAY OSD. */
export function PlayIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" stroke="none" {...props}>
      <path d="M4 2.5v11l9-5.5z" />
    </Icon>
  )
}

/** An outward link: contact and project links that leave the site. */
export function ExternalIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.25 11.75 11.5 4.5M6 4.5h5.5V10" />
    </Icon>
  )
}

/** Horizontal drag: the studio's orbit hint. */
export function DragIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2 8h12M4.75 5.25 2 8l2.75 2.75M11.25 5.25 14 8l-2.75 2.75" />
    </Icon>
  )
}

/** Restore the studio's opening view. */
export function ResetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.75 8a5.25 5.25 0 1 0 1.54-3.71" />
      <path d="M4.29 1.6v2.69h2.69" />
    </Icon>
  )
}

/** The deck's sound key: waves when enabled, a cross when muted. */
export function SoundIcon({ enabled }: { enabled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d="M9 4 5 7H2v6h3l4 3z" />
      {enabled ? (
        <path d="M12 6a6 6 0 0 1 0 8M15 3a10 10 0 0 1 0 14" />
      ) : (
        <path d="m13 7 5 6m0-6-5 6" />
      )}
    </svg>
  )
}

/** The deck's eject key. */
export function EjectIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m10 3 7 9H3zM3 14h14v3H3z" />
    </svg>
  )
}
