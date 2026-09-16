import { expect, test, type Page } from '@playwright/test'

// Inspect the live Three scene, so these checks catch geometry and animation
// regressions that successful HTML navigation alone cannot reveal.
async function advanceScene(page: Page, frames: number) {
  await page.evaluate(async (count) => {
    const module = '/node_modules/.vite/deps/@react-three_fiber.js'
    const { _roots } = (await import(
      module
    )) as typeof import('@react-three/fiber')
    const state = _roots
      .get(document.querySelector('canvas')!)!
      .store.getState()
    state.setFrameloop('never')
    for (let i = 0; i < count; i++)
      state.advance(state.clock.elapsedTime + 1 / 60)
  }, frames)
}

test('all six cassettes clear the studio and enter the open player before playback', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
  await advanceScene(page, 80)
  const tapes = await page
    .getByRole('link', { name: /^Play tape:/ })
    .evaluateAll((links) =>
      links.map((link) => ({
        href: link.getAttribute('href')!,
        label: link.getAttribute('aria-label')!,
      })),
    )

  for (const { href, label } of tapes) {
    const link = page.getByRole('link', { name: label, exact: true })
    await link.focus()
    await advanceScene(page, 40)
    await link.click()
    await expect(
      page.getByRole('button', { name: 'Skip animation' }),
    ).toBeVisible()
    await expect(page.locator('article')).toHaveCount(0)
    // The mechanism waits for the full-viewport canvas box (covered below);
    // this synchronous frame loop cannot observe it, so let it land first.
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
          const { _roots } = (await import(
            fiberModule
          )) as typeof import('@react-three/fiber')
          const { size } = _roots
            .get(document.querySelector('canvas')!)!
            .store.getState()
          return [size.width, size.height]
        }),
      )
      .toEqual([page.viewportSize()!.width, page.viewportSize()!.height])
    const result = await page.evaluate(async (slug) => {
      const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
      const threeModule = '/node_modules/.vite/deps/three.js'
      const { _roots } = (await import(
        fiberModule
      )) as typeof import('@react-three/fiber')
      const { Box3, Mesh, Raycaster, Vector3 } = (await import(
        threeModule
      )) as typeof import('three')
      const state = _roots
        .get(document.querySelector('canvas')!)!
        .store.getState()
      state.setFrameloop('never')
      const { scene } = state
      const tape = scene.getObjectByName(`tape-${slug}`)!
      const player = scene.getObjectByName('vhs-player')!
      const flap = scene.getObjectByName('player-flap')!
      const bounds = (name: string) =>
        new Box3().setFromObject(scene.getObjectByName(name)!, true)
      const opening = {
        left: bounds('slot-left').max.x,
        right: bounds('slot-right').min.x,
        bottom: bounds('slot-bottom').max.y,
        top: bounds('slot-top').min.y,
        front: bounds('player-fascia').max.z,
      }
      const obstacles = [
        scene.getObjectByName('crt-monitor')!,
        scene.getObjectByName('decorative-tape')!,
        scene.getObjectByName('studio-tabletop')!,
        scene.getObjectByName('headphones-and-stand')!,
        ...scene
          .getObjectByName('studio-model')!
          .children.filter(
            (child) => child.name.startsWith('tape-') && child !== tape,
          ),
      ]
      // A cassette begins inside the holder's overall bounds. Check its actual
      // guides and walls individually, including the new channels and lip.
      scene.getObjectByName('archive-holder')!.traverse((part) => {
        if (part instanceof Mesh && part.geometry.type !== 'PlaneGeometry')
          obstacles.push(part)
      })
      const collisionFrames: string[] = []
      let crossingFrames = 0
      let misalignedFrames = 0
      let hiddenFrames = 0
      let closedFlapFrames = 0
      let prematurePlayback = false
      let previousZ = tape.position.z
      for (let frame = 0; frame < 150; frame++) {
        state.advance(state.clock.elapsedTime + 1 / 60)
        const movingIntoPlayer = tape.position.z < previousZ
        previousZ = tape.position.z
        const tapeBounds = new Box3().setFromObject(tape, true)
        for (const obstacle of obstacles) {
          if (
            tapeBounds.intersectsBox(new Box3().setFromObject(obstacle, true))
          )
            collisionFrames.push(`${frame}: ${obstacle.name}`)
        }
        player.traverse((part) => {
          if (
            part instanceof Mesh &&
            part.geometry.type !== 'PlaneGeometry' &&
            tapeBounds.intersectsBox(new Box3().setFromObject(part, true))
          )
            collisionFrames.push(
              `${frame}: player ${part.name || part.parent?.name}`,
            )
        })
        if (!tape.visible || tape.scale.x < 0.99) hiddenFrames++
        if (
          movingIntoPlayer &&
          tapeBounds.min.z < opening.front &&
          tapeBounds.max.z > opening.front
        ) {
          crossingFrames++
          if (
            tapeBounds.min.x < opening.left ||
            tapeBounds.max.x > opening.right ||
            tapeBounds.min.y < opening.bottom ||
            tapeBounds.max.y > opening.top
          )
            misalignedFrames++
          if (flap.rotation.x < 1.5) closedFlapFrames++
        }
        if (
          tapeBounds.max.z > opening.front &&
          document.querySelector('article')
        )
          prematurePlayback = true
      }
      const seated = new Box3().setFromObject(tape, true)
      const ray = new Raycaster(
        new Vector3(tape.position.x, tape.position.y, 10),
        new Vector3(0, 0, -1),
      )
      const firstHit = ray.intersectObjects([player, tape], true)[0]?.object
      let occludedByPlayer = false
      for (let object = firstHit; object; object = object.parent ?? undefined) {
        if (object === player) occludedByPlayer = true
      }
      return {
        collisionFrames,
        crossingFrames,
        misalignedFrames,
        hiddenFrames,
        closedFlapFrames,
        prematurePlayback,
        occludedByPlayer,
        seatedInside: new Box3()
          .setFromObject(player, true)
          .containsBox(seated),
        flapClosed: flap.rotation.x === 0,
      }
    }, href.split('/').at(-1)!)
    expect(result.collisionFrames, label).toEqual([])
    expect(result.crossingFrames, label).toBeGreaterThan(4)
    expect(result.misalignedFrames, label).toBe(0)
    expect(result.hiddenFrames, label).toBe(0)
    expect(result.closedFlapFrames, label).toBe(0)
    expect(result.prematurePlayback, label).toBe(false)
    expect(result.seatedInside, label).toBe(true)
    expect(result.occludedByPlayer, label).toBe(true)
    expect(result.flapClosed, label).toBe(true)
    await expect(
      page.getByRole('button', { name: 'Skip animation' }),
    ).toHaveCount(0)
    await expect(page.locator('article h2')).toBeFocused()
    await page.keyboard.press('Escape')
    await advanceScene(page, 80)
    await expect(link).toBeFocused()
  }
})

test('skip, eject during loading, and reduced motion leave the player usable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
  const about = page.getByRole('link', { name: 'About me' })
  await about.click()
  const skip = page.getByRole('button', { name: 'Skip animation' })
  await expect(skip).toBeVisible()
  expect(
    await skip.evaluate((el) => !!el.closest('[data-testid="studio-scene"]')),
  ).toBe(false)
  await skip.click()
  await expect(page.locator('article h2')).toBeFocused()
  await page.keyboard.press('Escape')
  await about.click()
  await expect(
    page.getByRole('button', { name: 'Skip animation' }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  await about.click()
  await expect(
    page.getByRole('button', { name: 'Skip animation' }),
  ).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(
    page.getByRole('button', { name: 'Skip animation' }),
  ).toHaveCount(0)
  await expect(page.locator('article h2')).toBeFocused()
})

test('physical playback keys follow the player, remain clickable after resize, and return focus on eject', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
  const alpha = page.getByRole('link', {
    name: 'Play tape: Placeholder: Alpha (2026)',
    exact: true,
  })
  await alpha.click()
  await expect(page.locator('article h2')).toBeFocused()
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 1024, height: 720 },
    { width: 800, height: 720 },
  ]) {
    await page.setViewportSize(viewport)
    await advanceScene(page, 2)
    for (const [name, object] of [
      ['Sound effects', 'player-sound'],
      ['Eject tape', 'player-eject'],
    ]) {
      const button = page.getByRole('button', { name, exact: true })
      await expect(button).toBeInViewport({ ratio: 1 })
      expect(
        await button.evaluate(
          (el) => !!el.closest('[data-testid="studio-scene"]'),
        ),
      ).toBe(true)
      const cap = await page.evaluate(async (object) => {
        const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
        const threeModule = '/node_modules/.vite/deps/three.js'
        const { _roots } = (await import(
          fiberModule
        )) as typeof import('@react-three/fiber')
        const { Box3, Vector3 } = (await import(
          threeModule
        )) as typeof import('three')
        const state = _roots
          .get(document.querySelector('canvas')!)!
          .store.getState()
        const center = state.scene
          .getObjectByName(object)!
          .localToWorld(new Vector3(0, 0, 0.072))
          .project(state.camera)
        const sound = new Box3().setFromObject(
          state.scene.getObjectByName('player-sound')!,
        )
        const fascia = new Box3().setFromObject(
          state.scene.getObjectByName('slot-left')!,
        )
        return {
          x: ((center.x + 1) * state.size.width) / 2,
          y: ((1 - center.y) * state.size.height) / 2,
          soundClearance: Math.min(
            sound.min.x - fascia.min.x,
            fascia.max.x - sound.max.x,
            sound.min.y - fascia.min.y,
            fascia.max.y - sound.max.y,
          ),
          physicalSkip: !!state.scene.getObjectByName('player-skip'),
        }
      }, object)
      // Include the key's recess, so it cannot straddle a fascia ridge again.
      expect(cap.soundClearance).toBeGreaterThan(0.04)
      expect(cap.physicalSkip).toBe(false)
      await expect
        .poll(async () => {
          const rect = (await button.boundingBox())!
          return Math.hypot(
            rect.x + rect.width / 2 - cap.x,
            rect.y + rect.height / 2 - cap.y,
          )
        })
        .toBeLessThan(2)
      const rect = (await button.boundingBox())!
      expect(rect.width).toBeGreaterThanOrEqual(44)
      expect(rect.height).toBeGreaterThanOrEqual(44)
    }
    // Hit testing catches a canvas or reader overlay intercepting these keys.
    const sound = page.getByRole('button', {
      name: 'Sound effects',
      exact: true,
    })
    await sound.click()
    await expect(sound).toHaveAttribute('aria-pressed', 'true')
    await sound.click()
    await expect(sound).toHaveAttribute('aria-pressed', 'false')
    const reader = page.getByRole('article')
    expect(
      await reader.evaluate((el) => {
        const box = el.getBoundingClientRect()
        return el.contains(
          document.elementFromPoint(
            box.x + box.width / 2,
            box.y + box.height / 2,
          ),
        )
      }),
    ).toBe(true)
  }
  await page.getByRole('button', { name: 'Eject tape', exact: true }).click()
  await expect(page).toHaveURL('/')
  await expect(alpha).toBeFocused()
})

test('the canvas is sized before the tape moves, and the keys keep one printed label from browse to playback', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  try {
    await page.goto('/')
    await expect(page.getByTestId('studio-scene')).toHaveAttribute(
      'data-ready',
      'true',
    )
    await advanceScene(page, 80)
    const sequence = await page.evaluate(async () => {
      const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
      const { _roots } = (await import(
        fiberModule
      )) as typeof import('@react-three/fiber')
      const root = _roots.get(document.querySelector('canvas')!)!.store
      const { scene, size, viewport, internal } = root.getState()
      const tape = scene.getObjectByName('tape-placeholder-alpha')!
      const home = tape.position.clone()
      const labels = () => ({
        sound: !!scene.getObjectByName('player-sound-label'),
        eject: !!scene.getObjectByName('player-eject-label'),
      })
      const before = {
        width: size.width,
        height: size.height,
        dpr: viewport.dpr,
        labels: labels(),
      }
      // Record every frame from inside the loop, after the scene's own
      // callbacks: the box that frame saw, and whether the tape has moved.
      const frames: { width: number; height: number; moved: boolean }[] = []
      internal.subscribers.push({
        ref: {
          current: (state) => {
            frames.push({
              width: state.size.width,
              height: state.size.height,
              moved: tape.position.distanceTo(home) > 1e-4,
            })
          },
        },
        priority: 0,
        store: root,
      })
      document
        .querySelector<HTMLAnchorElement>(
          'a[href="/project/placeholder-alpha"]',
        )!
        .click()
      // Step frames by hand while layout, the resize observer, and React
      // deliver the new box. A canvas re-render restores demand mode, so any
      // frame the loop runs on its own is recorded just the same.
      for (let step = 0; step < 90 && !frames.some((f) => f.moved); step++) {
        await new Promise((resolve) => setTimeout(resolve, 4))
        const state = root.getState()
        state.setFrameloop('never')
        state.advance(state.clock.elapsedTime + 1 / 60)
      }
      return {
        before,
        frames,
        viewport: { width: innerWidth, height: innerHeight },
        keysDuringInsertion: document.querySelectorAll(
          'button[aria-label="Eject tape"], button[aria-label="Sound effects"]',
        ).length,
        labels: labels(),
      }
    })
    expect(sequence.before.labels).toEqual({ sound: true, eject: true })
    expect(sequence.labels).toEqual({ sound: true, eject: true })
    expect(sequence.before.width).toBeLessThan(sequence.viewport.width)
    expect(sequence.before.dpr).toBe(1.75)
    expect(sequence.keysDuringInsertion).toBe(0)
    const { width, height } = sequence.viewport
    const firstSized = sequence.frames.findIndex(
      (frame) => frame.width === width && frame.height === height,
    )
    const firstMove = sequence.frames.findIndex((frame) => frame.moved)
    expect(firstSized).toBeGreaterThanOrEqual(0)
    expect(firstMove).toBeGreaterThan(firstSized)
    // The frame that released the tape had already drawn the playback box,
    // and the release came from that box, not from the timed fallback.
    expect(sequence.frames[firstMove - 1]).toEqual({
      width,
      height,
      moved: false,
    })
    expect(firstMove - firstSized).toBeLessThanOrEqual(2)
    await page.getByRole('button', { name: 'Skip animation' }).click()
    await expect(page.locator('article h2')).toBeFocused()
    const playback = await page.evaluate(async () => {
      const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
      const { _roots } = (await import(
        fiberModule
      )) as typeof import('@react-three/fiber')
      const state = _roots
        .get(document.querySelector('canvas')!)!
        .store.getState()
      const keys = [
        ...document.querySelectorAll<HTMLButtonElement>(
          'button[aria-label="Eject tape"], button[aria-label="Sound effects"]',
        ),
      ]
      return {
        dpr: state.viewport.dpr,
        keys: keys.map((key) => ({
          text: key.textContent,
          children: key.childElementCount,
          background: getComputedStyle(key).backgroundColor,
        })),
        labels: {
          sound: !!state.scene.getObjectByName('player-sound-label'),
          eject: !!state.scene.getObjectByName('player-eject-label'),
        },
      }
    })
    expect(playback.dpr).toBe(2)
    expect(playback.labels).toEqual({ sound: true, eject: true })
    expect(playback.keys).toEqual([
      { text: '', children: 0, background: 'rgba(0, 0, 0, 0)' },
      { text: '', children: 0, background: 'rgba(0, 0, 0, 0)' },
    ])
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL('/')
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
          const { _roots } = (await import(
            fiberModule
          )) as typeof import('@react-three/fiber')
          return _roots.get(document.querySelector('canvas')!)!.store.getState()
            .viewport.dpr
        }),
      )
      .toBe(1.75)
  } finally {
    await context.close()
  }
})

test('the compact player supports skip, sound, and eject on a narrow touch screen', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()
  try {
    await page.goto('/')
    await expect(page.getByTestId('studio-scene')).toHaveAttribute(
      'data-ready',
      'true',
    )
    await advanceScene(page, 80)
    await page.getByRole('link', { name: 'About me' }).tap()
    const skip = page.getByRole('button', { name: 'Skip animation' })
    await expect(skip).toBeInViewport({ ratio: 1 })
    expect(await skip.evaluate((el) => !!el.closest('[role="group"]'))).toBe(
      false,
    )
    await skip.tap()
    await expect(page.locator('article h2')).toBeFocused()
    const controls = page.getByRole('group', { name: 'VHS player controls' })
    await expect(controls).toBeInViewport({ ratio: 1 })
    for (const button of await controls.getByRole('button').all()) {
      const rect = (await button.boundingBox())!
      expect(rect.width).toBeGreaterThanOrEqual(44)
      expect(rect.height).toBeGreaterThanOrEqual(44)
    }
    const sound = controls.getByRole('button', { name: 'Sound effects' })
    await sound.tap()
    await expect(sound).toHaveAttribute('aria-pressed', 'true')
    await controls.getByRole('button', { name: 'Eject tape' }).tap()
    await expect(page).toHaveURL('/')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  } finally {
    await context.close()
  }
})

// Step the eject by hand from wherever the tape is, yielding between frames
// so React can commit the landing (it clears the eject from inside the loop).
async function ejectRun(page: Page, slug: string) {
  return page.evaluate(async (slug) => {
    const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
    const threeModule = '/node_modules/.vite/deps/three.js'
    const { _roots } = (await import(
      fiberModule
    )) as typeof import('@react-three/fiber')
    const { Box3, Mesh, Quaternion } = (await import(
      threeModule
    )) as typeof import('three')
    const root = _roots.get(document.querySelector('canvas')!)!.store
    const state = root.getState()
    const { scene } = state
    const tape = scene.getObjectByName(`tape-${slug}`)!
    // The fixed pointer target marks the slot the tape must return to.
    const home = scene.getObjectByName(`pointer-target-${slug}`)!.position
    const player = scene.getObjectByName('vhs-player')!
    const flap = scene.getObjectByName('player-flap')!
    const front = new Box3().setFromObject(
      scene.getObjectByName('player-fascia')!,
      true,
    ).max.z
    const obstacles = [
      scene.getObjectByName('crt-monitor')!,
      scene.getObjectByName('decorative-tape')!,
      scene.getObjectByName('studio-tabletop')!,
      scene.getObjectByName('headphones-and-stand')!,
      ...scene
        .getObjectByName('studio-model')!
        .children.filter(
          (child) => child.name.startsWith('tape-') && child !== tape,
        ),
    ]
    scene.getObjectByName('archive-holder')!.traverse((part) => {
      if (part instanceof Mesh && part.geometry.type !== 'PlaneGeometry')
        obstacles.push(part)
    })
    const collisionFrames: string[] = []
    let crossingFrames = 0
    let closedFlapCrossing = 0
    let movingFrames = 0
    let maxFlap = 0
    let landedAt = -1
    const start = tape.position.clone()
    const previous = tape.position.clone()
    for (let frame = 0; frame < 220; frame++) {
      await new Promise((resolve) => setTimeout(resolve, 0))
      root.getState().setFrameloop('never')
      state.advance(state.clock.elapsedTime + 1 / 60)
      const bounds = new Box3().setFromObject(tape, true)
      if (tape.position.distanceTo(previous) > 1e-5) movingFrames++
      const outward = tape.position.z > previous.z
      previous.copy(tape.position)
      maxFlap = Math.max(maxFlap, flap.rotation.x)
      for (const obstacle of obstacles)
        if (bounds.intersectsBox(new Box3().setFromObject(obstacle, true)))
          collisionFrames.push(`${frame}: ${obstacle.name}`)
      player.traverse((part) => {
        if (
          part instanceof Mesh &&
          part.geometry.type !== 'PlaneGeometry' &&
          bounds.intersectsBox(new Box3().setFromObject(part, true))
        )
          collisionFrames.push(
            `${frame}: player ${part.name || part.parent?.name}`,
          )
      })
      if (outward && bounds.min.z < front && bounds.max.z > front) {
        crossingFrames++
        if (flap.rotation.x < 1.5) closedFlapCrossing++
      }
      // Flat in its slot: the focus returning to its link is no preview.
      const atRest =
        tape.position.distanceTo(home) < 1e-3 &&
        tape.quaternion.angleTo(new Quaternion()) < 1e-3
      if (landedAt < 0 && frame > 2 && atRest) landedAt = frame
    }
    return {
      start: start.toArray(),
      collisionFrames,
      crossingFrames,
      closedFlapCrossing,
      movingFrames,
      maxFlap,
      flapEnd: flap.rotation.x,
      landedAt,
      restDistance: tape.position.distanceTo(home),
    }
  }, slug)
}

test('eject runs the mechanism back to the rack, from seated and from mid-insertion', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  await expect(page.getByTestId('studio-scene')).toHaveAttribute(
    'data-ready',
    'true',
  )
  await advanceScene(page, 80)
  const gamma = page.getByRole('link', {
    name: /^Play tape: Placeholder: Gamma/,
  })
  await gamma.click()
  await page.getByRole('button', { name: 'Skip animation' }).click()
  await expect(page.locator('article h2')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  const seated = await ejectRun(page, 'placeholder-gamma')
  expect(seated.collisionFrames).toEqual([])
  // It left through the opening with the flap up, travelled rather than
  // snapped, and settled in its slot with the flap closed behind it.
  expect(seated.crossingFrames).toBeGreaterThan(4)
  expect(seated.closedFlapCrossing).toBe(0)
  expect(seated.movingFrames).toBeGreaterThan(60)
  expect(seated.landedAt).toBeGreaterThan(60)
  expect(seated.restDistance).toBeLessThan(1e-3)
  expect(seated.flapEnd).toBe(0)
  await expect(gamma).toBeFocused()
  await expect(page.getByText('Choose a tape to play')).toBeVisible()
  // Once landed, its slot answers the pointer again.
  await page.evaluate(() => window.scrollTo(0, 0))
  const slot = await page.evaluate(async () => {
    const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
    const threeModule = '/node_modules/.vite/deps/three.js'
    const { _roots } = (await import(
      fiberModule
    )) as typeof import('@react-three/fiber')
    const { Vector3 } = (await import(threeModule)) as typeof import('three')
    const state = _roots
      .get(document.querySelector('canvas')!)!
      .store.getState()
    const rect = document.querySelector('canvas')!.getBoundingClientRect()
    const point = state.scene
      .getObjectByName('pointer-target-placeholder-gamma')!
      .getWorldPosition(new Vector3())
    point.z += 0.5
    point.project(state.camera)
    return {
      x: rect.x + ((point.x + 1) * rect.width) / 2,
      y: rect.y + ((1 - point.y) * rect.height) / 2,
    }
  })
  await page.mouse.move(slot.x, slot.y)
  await expect
    .poll(() => page.evaluate(() => document.body.style.cursor))
    .toBe('pointer')
  await page.mouse.move(10, 10)

  // Escape mid-insertion: the tape retraces its outward path from where it
  // is, never seating first, with the flap still closed.
  await gamma.click()
  // The click leaves the pointer on the link; once the studio has zoomed
  // back onto the page that would be a real hover and lift the landed tape.
  await page.mouse.move(10, 10)
  await expect(
    page.getByRole('button', { name: 'Skip animation' }),
  ).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const fiberModule = '/node_modules/.vite/deps/@react-three_fiber.js'
        const { _roots } = (await import(
          fiberModule
        )) as typeof import('@react-three/fiber')
        const { size } = _roots
          .get(document.querySelector('canvas')!)!
          .store.getState()
        return [size.width, size.height]
      }),
    )
    .toEqual([page.viewportSize()!.width, page.viewportSize()!.height])
  await advanceScene(page, 30)
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL('/')
  const early = await ejectRun(page, 'placeholder-gamma')
  expect(early.start[2]).toBeGreaterThan(1)
  expect(early.collisionFrames).toEqual([])
  expect(early.crossingFrames).toBe(0)
  expect(early.maxFlap).toBeLessThan(0.1)
  expect(early.movingFrames).toBeGreaterThan(10)
  expect(early.restDistance).toBeLessThan(1e-3)
})
