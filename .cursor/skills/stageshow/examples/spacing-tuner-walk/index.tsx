import { Stage, type Act } from '../../kit'
import { computeScene, type Rect } from '../../../../../src/demos/spacing-tuner/layout'
import { frameAt, LOOP_S, PHASE0_S, PHASE_STEP_S } from '../../../../../src/demos/spacing-tuner/timeline'
import { COLORS, ICON_FILL_ALPHA, INNER, OVERLAY_ALPHA, SIZES, STAGE, VARIABLES, type VarKey } from '../../../../../src/demos/spacing-tuner/tokens'
import './tuner.css'

// Recording source for the store card. The layout, colors, and clock are the
// spacing tuner's own modules, at 1x wall time. The store mount does not pass
// `interactive`, so the chips are not buttons. The cursor stays off them.

type S = { time: number }

const VIEW = { width: 1280, height: 800 }
const SCALE = Math.min(VIEW.width / STAGE.width, VIEW.height / STAGE.height)
/** Settled card-padding highlight: chip reads 24, overlay fully up. One loop later is the same picture. */
const PAYOFF = PHASE0_S + 4 * PHASE_STEP_S + 0.75

const initial: S = { time: PAYOFF }
const poster: S = { time: PAYOFF }

function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

async function script(a: Act<S>) {
  const started = performance.now()
  const elapsed = () => (performance.now() - started) / 1000
  const tick = () => a.put({ time: (PAYOFF + elapsed()) % LOOP_S })
  a.mark('start')
  while (elapsed() < LOOP_S) {
    tick()
    await a.wait(16)
  }
  a.put({ time: PAYOFF })
  a.mark('end')
}

function Box({ r, color, radius = 0, opacity = 1 }: { r: Rect; color: string; radius?: number; opacity?: number }) {
  if (r.w <= 0 || r.h <= 0 || opacity <= 0) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        background: color,
        borderRadius: radius,
        opacity,
      }}
    />
  )
}

function Card({ r }: { r: Rect }) {
  const k = SIZES.ring
  return (
    <div
      style={{
        position: 'absolute',
        left: r.x - k,
        top: r.y - k,
        width: r.w + 2 * k,
        height: r.h + 2 * k,
        boxSizing: 'border-box',
        border: `${k}px solid ${COLORS.cardRing}`,
        borderRadius: SIZES.cardRadius + k,
        background: COLORS.card,
      }}
    />
  )
}

function Icon({ kind, accent }: { kind: VarKey; accent: string }) {
  if (kind === 'sidebar') {
    return (
      <span className="stw-icon">
        <span className="stw-side-frame" />
        <span className="stw-side-bar" style={{ background: accent }} />
        <span className="stw-chev stw-chev-l" style={{ borderColor: accent }} />
        <span className="stw-chev stw-chev-r" style={{ borderColor: accent }} />
      </span>
    )
  }
  if (kind === 'rowGap') {
    return (
      <span className="stw-icon">
        <span className="stw-gap-row" style={{ top: 2, height: 10, background: COLORS.iconGrey }} />
        <span className="stw-gap-row" style={{ top: 14, height: 8, background: accent }} />
        <span className="stw-gap-row" style={{ top: 24, height: 10, background: COLORS.iconGrey }} />
      </span>
    )
  }
  if (kind === 'colGap') {
    return (
      <span className="stw-icon">
        <span className="stw-gap-col" style={{ left: 2, width: 10, background: COLORS.iconGrey }} />
        <span className="stw-gap-col" style={{ left: 14, width: 8, background: accent }} />
        <span className="stw-gap-col" style={{ left: 24, width: 10, background: COLORS.iconGrey }} />
      </span>
    )
  }
  return (
    <span className="stw-icon">
      <span className="stw-box" style={{ borderColor: accent, background: alpha(accent, ICON_FILL_ALPHA) }} />
      <span className="stw-box-in" />
    </span>
  )
}

export default function SpacingTunerWalk() {
  return (
    <Stage
      width={VIEW.width}
      height={VIEW.height}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      className="stw"
    >
      {(s) => {
        const frame = frameAt(s.time, false)
        const scene = computeScene(frame.values)
        const { S, C } = scene
        return (
          <div className="stw-page">
            <div className="stw-scale" style={{ transform: `scale(${SCALE})` }}>
              <div className="stw-window">
                <Box r={{ x: 0, y: 0, w: S, h: INNER.height }} color={COLORS.sidebar} />
                <Box r={{ x: S - 1, y: 0, w: 1, h: INNER.height }} color={COLORS.sidebarEdge} />
                <Box r={{ x: 20, y: 18, w: 28, h: 28 }} color={COLORS.logo} radius={6} />
                <Box r={{ x: 58, y: 27, w: 72, h: 10 }} color={COLORS.navInk} radius={5} />
                <Box r={{ x: 12, y: 72, w: S - 24, h: 38 }} color={COLORS.navActiveBg} radius={8} />
                {SIZES.navLineW.map((w, i) => {
                  const y = 72 + 38 * i
                  const ink = i === 0 ? COLORS.navInkActive : COLORS.navInk
                  return (
                    <div key={i}>
                      <Box r={{ x: 20, y: y + 10, w: 16, h: 16 }} color={ink} radius={4} />
                      <Box r={{ x: 46, y: y + 13, w, h: 10 }} color={ink} radius={5} />
                    </div>
                  )
                })}
                <Box r={{ x: 20, y: 778, w: 28, h: 28 }} color={COLORS.navInk} radius={14} />
                <Box r={{ x: 58, y: 787, w: 80, h: 10 }} color={COLORS.navInk} radius={5} />
                <Box r={scene.header.title} color={COLORS.dark} radius={8} />
                <Box r={scene.header.lightPill} color={COLORS.pillLight} radius={18} />
                <Box r={scene.header.darkPill} color={COLORS.pillDark} radius={18} />
                {scene.sections.map((section, i) => (
                  <div key={i}>
                    <Box r={section.label} color={COLORS.dark} radius={6} />
                    <Box r={section.right} color={COLORS.light} radius={5} />
                  </div>
                ))}
                {scene.stats.map((card) => (
                  <div key={card.index}>
                    <Card r={card} />
                    <Box r={{ x: card.x + C, y: card.y + C, w: SIZES.statLabelW[card.index]!, h: 10 }} color={COLORS.light} radius={5} />
                    <Box r={{ x: card.x + C, y: card.y + C + 22, w: SIZES.statValueW[card.index]!, h: 20 }} color={COLORS.dark} radius={10} />
                    {Array.from({ length: 8 }, (_, j) => {
                      const h = SIZES.miniHeights[card.index + j]!
                      return <Box key={j} r={{ x: card.x + C + 12 * j, y: card.y + C + SIZES.statInnerH - h, w: 8, h }} color={COLORS.light} radius={2} />
                    })}
                  </div>
                ))}
                <Card r={scene.chart} />
                <Box r={{ x: scene.chart.x + C, y: scene.chart.y + C + 9, w: SIZES.chartTitle.w, h: SIZES.chartTitle.h }} color={COLORS.dark} radius={5} />
                <Box r={{ x: scene.chart.x + scene.chart.w - C - SIZES.chartPill.w, y: scene.chart.y + C, w: SIZES.chartPill.w, h: SIZES.chartPill.h }} color={COLORS.pillLight} radius={14} />
                {SIZES.chartPct.map((pct, i) => {
                  const inner = scene.chart.w - 2 * C
                  const bw = (inner - 11 * SIZES.chartBarGap) / 12
                  const plotH = scene.chart.h - 2 * C - SIZES.chartPill.h - SIZES.chartHeadGap
                  const h = (plotH * pct) / 100
                  const bottom = scene.chart.y + scene.chart.h - C
                  return <Box key={i} r={{ x: scene.chart.x + C + i * (bw + SIZES.chartBarGap), y: bottom - h, w: bw, h }} color={COLORS.bar} radius={4} />
                })}
                <Card r={scene.list} />
                <Box r={{ x: scene.list.x + C, y: scene.list.y + C, w: SIZES.listTitleW, h: 10 }} color={COLORS.dark} radius={5} />
                {SIZES.listLineW.map((w, i) => {
                  const y = scene.list.y + C + 26 + 44 * i
                  return (
                    <div key={i}>
                      <Box r={{ x: scene.list.x + C, y, w: 28, h: 28 }} color={COLORS.bar} radius={14} />
                      <Box r={{ x: scene.list.x + C + 40, y: y + 9, w, h: 10 }} color={COLORS.light} radius={5} />
                      <Box r={{ x: scene.list.x + scene.list.w - C - 36, y: y + 9, w: 36, h: 10 }} color={COLORS.light} radius={5} />
                    </div>
                  )
                })}
                {VARIABLES.map((variable) => {
                  const emphasis = frame.emphasis[variable.key]
                  if (emphasis <= 0) return null
                  const fill = alpha(variable.accent, OVERLAY_ALPHA)
                  if (variable.key === 'cardPadding') {
                    return [...scene.stats, scene.chart, scene.list].map((r, i) => (
                      <div
                        key={`${variable.key}${i}`}
                        style={{
                          position: 'absolute',
                          left: r.x,
                          top: r.y,
                          width: r.w,
                          height: r.h,
                          opacity: emphasis,
                          boxSizing: 'border-box',
                          border: `${Math.max(0, C)}px solid ${fill}`,
                          borderRadius: SIZES.cardRadius,
                        }}
                      />
                    ))
                  }
                  return scene.overlays[variable.key].map((r, i) => (
                    <Box key={`${variable.key}${i}`} r={r} color={fill} opacity={emphasis} />
                  ))
                })}
              </div>
              <div className="stw-chips">
                {VARIABLES.map((variable) => {
                  const emphasis = frame.emphasis[variable.key]
                  const digits = String(frame.display[variable.key])
                  return (
                    <div key={variable.key} className="stw-chip" data-target={`chip-${variable.key}`}>
                      <span className="stw-ring" style={{ borderColor: variable.accent, opacity: emphasis }} />
                      <Icon kind={variable.key} accent={variable.accent} />
                      <span className="stw-digits">
                        {digits.split('').map((digit, index) => (
                          <span key={index} className="stw-digit">{digit}</span>
                        ))}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }}
    </Stage>
  )
}
