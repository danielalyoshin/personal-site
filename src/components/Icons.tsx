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

/**
 * The deck's sound key: a filled speaker, like the eject and skip marks, with
 * stroked waves when enabled or a red slash across it when muted. The same
 * mark is printed in the modeled deck's status window.
 */
export function SoundIcon({ enabled }: { enabled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 4 5 7H2v6h3l4 3z" fill="currentColor" stroke="none" />
      {enabled ? (
        <path d="M12 6a6 6 0 0 1 0 8M15 3a10 10 0 0 1 0 14" />
      ) : (
        <path d="M3 17 17 3" stroke="var(--rec-red)" />
      )}
    </svg>
  )
}

/** Skip animation: the transport's skip-to-end mark. */
export function SkipIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 4l9 6-9 6zM14 4h3v12h-3z" />
    </svg>
  )
}

/**
 * Leaving full screen: four corners turned in on the picture, filled like
 * the deck's other marks.
 */
export function CollapseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M2.5 5.5h3v-3H8V8H2.5zM17.5 5.5h-3v-3H12V8h5.5zM2.5 14.5h3v3H8V12H2.5zM17.5 14.5h-3v3H12V12h5.5z" />
    </svg>
  )
}

/** The deck's eject key; a class sizes it to the type it sits in on the OSD. */
export function EjectIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="m10 3 7 9H3zM3 14h14v3H3z" />
    </svg>
  )
}
