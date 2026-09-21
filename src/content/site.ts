/**
 * Site-level identity: whose archive this is. Printed in the tube's OSD and
 * closing every route's document title, so a visitor who arrives by a shared
 * link, mid-tape, still learns whose machine they are looking at.
 */
export const site = {
  owner: 'Daniel Alyoshin',
  /**
   * The home route's document title. `index.html` carries the same words for
   * the page as served; the build checks that the two agree.
   */
  title: 'Daniel Alyoshin — Design Engineer',
}

/**
 * Every route names itself, so tabs, history, bookmarks, and shared links
 * tell tapes apart: a tape by its title, a dead route as NO SIGNAL, home as
 * the site. One function for the running page and the pre-rendered files.
 */
export function pageTitle(playing: { title: string } | 'nosignal' | null) {
  if (playing === 'nosignal') return `No signal — ${site.owner}`
  return playing ? `${playing.title} — ${site.owner}` : site.title
}
