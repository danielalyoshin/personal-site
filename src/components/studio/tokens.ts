const read = new Map<string, string>()

/**
 * A design token's value, read from the page. The models paint the same
 * screen palette as the HTML tube, and `src/styles/tokens.css` is its one
 * source: a colour changed there changes in both renderers. Tokens do not
 * change at runtime, so each is read once.
 */
export function token(name: `--${string}`) {
  let value = read.get(name)
  if (value === undefined) {
    value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim()
    if (!value) throw new Error(`Design token ${name} is not defined`)
    read.set(name, value)
  }
  return value
}
