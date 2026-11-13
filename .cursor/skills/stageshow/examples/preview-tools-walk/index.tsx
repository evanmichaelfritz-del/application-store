import { Stage, type Act, type Rect } from '../../kit'
import { GUIDE, INSTRUMENTS, SAMPLE_CONTROLS, guideMarks, type PenId } from '../../../../../src/demos/preview-tools/model'
import { COLLAPSE_SVG, toolIconSvg } from '../../../../../src/demos/preview-tools/toolIcon'
import './preview.css'

// Recording source for the store card. The tray, pens, guides, and note use
// the preview tool's own icons, colors, and guide math. The cursor does the
// same presses the card does: open, pick a pen, annotate, choose a control, close.

type S = {
  open: boolean
  pen: PenId
  guides: boolean
  annotate: boolean
  draftId: string | null
}

const payoff: S = { open: true, pen: 'marker', guides: true, annotate: true, draftId: 'quality' }
const initial: S = payoff
const poster: S = payoff
/** Live tray: width 520ms, transform 540ms, cubic-bezier(0.22, 0.9, 0.16, 1). */
const MORPH_MS = 540

function notePosition(frame: Rect, fieldWidth: number) {
  const width = 220
  const limit = fieldWidth > 0 ? fieldWidth : width + 16
  const left = Math.max(8, Math.min(frame.x + frame.width / 2 - width / 2, limit - width - 8))
  let top = frame.y - 172
  if (top < 8) top = frame.y + frame.height + 8
  return { left, top, width }
}

async function script(a: Act<S>) {
  a.mark('start')
  await a.wait(360)
  a.mark('close')
  await a.click('toggle')
  await a.set({ open: false, annotate: false, draftId: null })
  await a.wait(MORPH_MS)
  await a.wait(200)
  a.mark('open')
  await a.click('toggle')
  await a.set({ open: true })
  await a.wait(MORPH_MS)
  await a.wait(180)
  a.mark('pen')
  await a.click('pen-pen')
  await a.set({ pen: 'pen' })
  await a.wait(200)
  await a.click('pen-marker')
  await a.set({ pen: 'marker' })
  await a.wait(180)
  a.mark('note')
  await a.click('annotate')
  await a.set({ annotate: true })
  await a.wait(160)
  await a.click('control-quality')
  await a.set({ draftId: 'quality' })
  a.mark('payoff')
  await a.wait(360)
  a.mark('end')
}

export default function PreviewToolsWalk() {
  return (
    <Stage
      width={1280}
      height={800}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      cursor={{ at: 'control-quality', idle: false }}
      className="ptw"
    >
      {(s, rect) => {
        const frames = SAMPLE_CONTROLS.map((control) => rect(`control-${control.id}`)).filter((frame) => frame.width > 0)
        const marks = s.open && s.guides ? guideMarks(frames) : []
        const draft = s.draftId ? rect(`control-${s.draftId}`) : null
        const note = s.open && s.annotate && draft && draft.width > 0 ? notePosition(draft, 1280) : null
        const held = s.pen
        const ink = held === 'highlighter' ? '#fff01f' : '#111111'
        return (
          <div className="ptw-field">
            <div className="ptw-row">
              {SAMPLE_CONTROLS.map((control) => (
                <div
                  key={control.id}
                  data-target={`control-${control.id}`}
                  data-cursor={s.annotate ? 'pointer' : undefined}
                  className={`ptw-ctrl ptw-ctrl-${control.kind}${s.draftId === control.id ? ' is-picked' : ''}`}
                >
                  <span className={control.kind === 'send' ? 'ptw-label ptw-label-send' : 'ptw-label'}>{control.label}</span>
                </div>
              ))}
            </div>
            {marks.map((mark, index) => {
              if (mark.kind === 'h') {
                return <div key={`h-${mark.y}-${index}`} className="ptw-h" style={{ top: mark.y }} />
              }
              if (mark.kind === 'v') {
                return <div key={`v-${mark.x}-${index}`} className="ptw-v" style={{ left: mark.x, top: mark.top, height: mark.height }} />
              }
              const frame = mark.frame
              return (
                <div
                  key={`b-${frame.x}-${frame.y}`}
                  className="ptw-box"
                  style={{ left: frame.x, top: frame.y, width: frame.width, height: frame.height }}
                />
              )
            })}
            {note && draft ? (
              <div className="ptw-note" style={note}>
                <div className="ptw-note-label">{SAMPLE_CONTROLS.find((control) => control.id === s.draftId)?.label}</div>
                <div className="ptw-note-selector">{`[data-note="${s.draftId}"]`}</div>
                <div className="ptw-note-input">Note for the agent</div>
                <div className="ptw-note-actions">
                  <span className="ptw-copy">Copy</span>
                  <span className="ptw-add">Add</span>
                </div>
              </div>
            ) : null}
            <div className={s.open ? 'ptw-tray is-open' : 'ptw-tray'}>
              {s.open ? (
                <>
                  <div className="ptw-slots">
                    {INSTRUMENTS.map((item) => {
                      const on = s.pen === item.id
                      const color = item.id === 'highlighter' ? '#fff01f' : item.id === 'eraser' ? '#c9806f' : '#111111'
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={on ? 'ptw-pen is-on' : 'ptw-pen'}
                          data-target={`pen-${item.id}`}
                          data-cursor="pointer"
                          aria-label={item.label}
                          dangerouslySetInnerHTML={{ __html: toolIconSvg(item.id, on ? color : color, 30) }}
                        />
                      )
                    })}
                  </div>
                  <span className="ptw-rule" />
                  <span className="ptw-wheel" aria-hidden="true"><span className="ptw-wheel-ink" /></span>
                  <span className="ptw-round" data-target="guides" aria-label="Alignment">
                    <AlignIcon on={s.guides} />
                  </span>
                  <button type="button" className="ptw-round" data-target="annotate" data-cursor="pointer" aria-label="Annotate">
                    <NoteIcon on={s.annotate} />
                  </button>
                  <span className="ptw-rule" />
                  <button type="button" className="ptw-round" data-target="toggle" data-cursor="pointer" aria-label="Close tools" dangerouslySetInnerHTML={{ __html: COLLAPSE_SVG }} />
                </>
              ) : (
                <button type="button" className="ptw-peek" data-target="toggle" data-cursor="pointer" aria-label="Open tools" dangerouslySetInnerHTML={{ __html: toolIconSvg(held, ink, 42) }} />
              )}
            </div>
          </div>
        )
      }}
    </Stage>
  )
}

function AlignIcon({ on }: { on: boolean }) {
  const color = on ? GUIDE : '#8a8a8e'
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="2.5" y="2.5" width="13" height="13" rx="2" stroke={color} strokeWidth="1.4" fill="none" />
      <rect x="1" y="8.3" width="16" height="1.4" fill={color} />
    </svg>
  )
}

function NoteIcon({ on }: { on: boolean }) {
  const color = on ? '#111111' : '#8a8a8e'
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="2" y="2" width="14" height="10" rx="2" fill={on ? '#111111' : 'none'} stroke={color} strokeWidth="1.4" />
      <path d="M6 12.2 L9 12.2 L6.6 15.2 Z" fill={color} />
    </svg>
  )
}
