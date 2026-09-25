import { createElement, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Stage } from '@/src/components/Stage';
import { writeClipboard } from '@/src/clipboard';
import { fonts } from '@/src/theme';
import {
  GUIDE,
  INITIAL_CHROME,
  INSTRUMENTS,
  SAMPLE_CONTROLS,
  STAGE_HEIGHT,
  SWATCHES,
  agentNotesMarkdown,
  guideMarks,
  noteSelector,
  paintStrokes,
  pickColor,
  pickControl,
  pickPen,
  setDraftText,
  toggleAnnotate,
  toggleFace,
  toggleGuides,
  toggleOpen,
  type AgentNote,
  type Chrome,
  type Frame,
  type InkStroke,
  type Mark,
} from './model';

export function PreviewToolsDemo() {
  const [chrome, setChrome] = useState<Chrome>(INITIAL_CHROME);
  const [row, setRow] = useState<Frame | null>(null);
  const [locals, setLocals] = useState<Partial<Record<string, Frame>>>({});
  const [fieldBox, setFieldBox] = useState({ width: 0, height: 0 });
  const [strokes, setStrokes] = useState<InkStroke[]>([]);
  const [draft, setDraft] = useState<InkStroke | null>(null);
  const [notes, setNotes] = useState<AgentNote[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chromeRef = useRef(chrome);
  const strokesRef = useRef(strokes);
  const draftRef = useRef(draft);
  chromeRef.current = chrome;
  strokesRef.current = strokes;
  draftRef.current = draft;

  const frames = row
    ? SAMPLE_CONTROLS.flatMap((control) => {
        const local = locals[control.id];
        if (!local) return [];
        return [{ id: control.id, x: row.x + local.x, y: row.y + local.y, width: local.width, height: local.height }];
      })
    : [];
  const framesRef = useRef(frames);
  framesRef.current = frames;
  const drawing = chrome.open && chrome.hand === 'draw';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = Math.round(parent.clientWidth);
      const height = Math.round(parent.clientHeight);
      if (width < 1 || height < 1) return;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) return;
      const live = draftRef.current ? [...strokesRef.current, draftRef.current] : strokesRef.current;
      paintStrokes(context, live);
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context) return;
    paintStrokes(context, draft ? [...strokes, draft] : strokes);
  }, [draft, strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.setProperty('pointer-events', drawing ? 'auto' : 'none', 'important');
  }, [drawing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const localPoint = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const down = (event: PointerEvent) => {
      const current = chromeRef.current;
      if (!current.open || current.hand !== 'draw') return;
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        /* Untrusted pointer events cannot be captured. */
      }
      const next = { pen: current.pen, color: current.color, points: [localPoint(event)] };
      draftRef.current = next;
      setDraft(next);
    };
    const move = (event: PointerEvent) => {
      const current = draftRef.current;
      if (!current) return;
      const next = { pen: current.pen, color: current.color, points: [...current.points, localPoint(event)] };
      draftRef.current = next;
      setDraft(next);
    };
    const up = () => {
      const current = draftRef.current;
      if (!current) return;
      draftRef.current = null;
      setDraft(null);
      if (current.points.length > 1) {
        const committed = [...strokesRef.current, current];
        strokesRef.current = committed;
        setStrokes(committed);
      }
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    return () => {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
    };
  }, []);

  const remember = (id: string) => (event: { nativeEvent: { layout: Frame } }) => {
    const next = roundFrame(event.nativeEvent.layout);
    setLocals((prev) => (sameFrame(prev[id], next) ? prev : { ...prev, [id]: next }));
  };

  const held = INSTRUMENTS.find((item) => item.id === chrome.pen) ?? INSTRUMENTS[1];
  const draftControl = SAMPLE_CONTROLS.find((item) => item.id === chrome.draftId);
  const draftFrame = frames.find((frame) => frame.id === chrome.draftId);
  const hoverControl = SAMPLE_CONTROLS.find((item) => item.id === hoverId);
  const hoverFrame = frames.find((frame) => frame.id === hoverId);

  const commitDraft = (source: AgentNote[]) => {
    const text = chrome.draftText.trim();
    if (!text || !draftControl || !draftFrame) return source;
    return [
      ...source,
      {
        label: draftControl.label,
        selector: noteSelector(draftControl.id),
        comment: text,
        box: draftFrame,
      },
    ];
  };

  const addNote = () => {
    const next = commitDraft(notes);
    if (next === notes) return;
    setNotes(next);
    setChrome((current) => setDraftText(current, ''));
  };

  const copyNotes = () => {
    const next = commitDraft(notes);
    const text = agentNotesMarkdown(next);
    if (!text) return;
    if (next !== notes) {
      setNotes(next);
      setChrome((current) => setDraftText(current, ''));
    }
    writeClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const showGuides = chrome.open && chrome.guides && frames.length === SAMPLE_CONTROLS.length;
  const showNote = chrome.open && chrome.hand === 'annotate' && draftControl && draftFrame;
  const showHover =
    chrome.open && chrome.hand === 'annotate' && hoverControl && hoverFrame && hoverId !== chrome.draftId;

  return (
    <Stage style={{ height: STAGE_HEIGHT }}>
      <View
        style={styles.field}
        onLayout={(event) => {
          const next = {
            width: Math.round(event.nativeEvent.layout.width),
            height: Math.round(event.nativeEvent.layout.height),
          };
          setFieldBox((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
        }}
      >
        <View
          style={styles.row}
          onLayout={(event) => {
            const next = roundFrame(event.nativeEvent.layout);
            setRow((prev) => (sameFrame(prev, next) ? prev : next));
          }}
        >
          {SAMPLE_CONTROLS.map((control) => {
            const count = notes.filter((note) => note.selector === noteSelector(control.id)).length;
            const picked = showNote && chrome.draftId === control.id;
            return (
              <View
                key={control.id}
                onLayout={remember(control.id)}
                style={[
                  styles.ctrl,
                  control.kind === 'icon' && styles.icon,
                  control.kind === 'short' && styles.short,
                  control.kind === 'pill' && styles.pill,
                  control.kind === 'send' && styles.send,
                  picked && styles.picked,
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={control.label}
                  testID={`preview-tools-control-${control.id}`}
                  onHoverIn={() => setHoverId(control.id)}
                  onHoverOut={() => setHoverId((current) => (current === control.id ? null : current))}
                  onPress={() => setChrome((current) => pickControl(current, control.id))}
                  style={styles.hit}
                >
                  <Text style={[styles.label, control.kind === 'send' && styles.sendLabel]}>{control.label}</Text>
                </Pressable>
                {count > 0 ? <Text style={styles.badge}>{count}</Text> : null}
              </View>
            );
          })}
        </View>
        {createElement('canvas', {
          ref: canvasRef,
          'data-testid': 'preview-tools-canvas',
          style: {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 3,
            touchAction: 'none',
            cursor: drawing ? 'crosshair' : 'default',
          },
        })}
        {showGuides ? <GuideOverlay frames={frames.map(({ x, y, width, height }) => ({ x, y, width, height }))} /> : null}
        {showHover && hoverFrame && hoverControl ? (
          <View pointerEvents="none" style={[styles.hoverName, { left: hoverFrame.x, top: hoverFrame.y - 22 }]}>
            <Text style={styles.hoverText}>{hoverControl.label}</Text>
          </View>
        ) : null}
        {showNote && draftFrame && draftControl ? (
          <View
            testID="preview-tools-note"
            style={[styles.note, notePosition(draftFrame, fieldBox.width)]}
          >
            <Text style={styles.noteLabel}>{draftControl.label}</Text>
            <Text style={styles.noteSelector}>{noteSelector(draftControl.id)}</Text>
            <TextInput
              value={chrome.draftText}
              onChangeText={(value) => setChrome((current) => setDraftText(current, value))}
              placeholder="Note for the agent"
              placeholderTextColor="#8f8f8f"
              multiline
              testID="preview-tools-note-input"
              style={styles.noteInput}
            />
            <View style={styles.noteActions}>
              <Pressable accessibilityRole="button" testID="preview-tools-note-copy" onPress={copyNotes} style={styles.copyBtn}>
                <Text style={styles.copyText}>{copied ? 'Copied' : 'Copy'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" testID="preview-tools-note-add" onPress={addNote} style={styles.addBtn}>
                <Text style={styles.addText}>Add</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        <View style={styles.dock} pointerEvents="box-none">
          {chrome.open ? (
            <View style={styles.bar}>
              <View style={styles.slots}>
                {chrome.face === 'palette'
                  ? SWATCHES.map((color) => {
                      const on = chrome.color === color;
                      return (
                        <Pressable
                          key={color}
                          accessibilityRole="button"
                          accessibilityLabel={color}
                          accessibilityState={{ selected: on }}
                          testID={`preview-tools-swatch-${color.slice(1)}`}
                          onPress={() => setChrome((current) => pickColor(current, color))}
                          style={[styles.swatch, { backgroundColor: color }, on && styles.swatchOn]}
                        />
                      );
                    })
                  : INSTRUMENTS.map((item) => {
                      const on = chrome.pen === item.id && chrome.hand === 'draw';
                      return (
                        <Pressable
                          key={item.id}
                          accessibilityRole="button"
                          accessibilityLabel={item.label}
                          accessibilityState={{ selected: on }}
                          testID={`preview-tools-pen-${item.id}`}
                          onPress={() => setChrome((current) => pickPen(current, item.id))}
                          style={[styles.instrument, on && styles.instrumentOn]}
                        >
                          <Marks marks={item.marks} />
                        </Pressable>
                      );
                    })}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Color"
                accessibilityState={{ selected: chrome.face === 'palette' }}
                testID="preview-tools-color"
                onPress={() => setChrome(toggleFace)}
                style={[styles.colorWell, chrome.face === 'palette' && styles.toolOn]}
              >
                <View style={[styles.colorDot, { backgroundColor: chrome.color }]} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Alignment"
                accessibilityState={{ selected: chrome.guides }}
                testID="preview-tools-guides"
                onPress={() => setChrome(toggleGuides)}
                style={[styles.tool, chrome.guides && styles.toolOn]}
              >
                <AlignIcon on={chrome.guides} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Annotate"
                accessibilityState={{ selected: chrome.hand === 'annotate' }}
                testID="preview-tools-annotate"
                onPress={() => setChrome(toggleAnnotate)}
                style={[styles.tool, chrome.hand === 'annotate' && styles.toolOn]}
              >
                <NoteIcon on={chrome.hand === 'annotate'} />
              </Pressable>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: chrome.open }}
            accessibilityLabel={chrome.open ? 'Close tools' : 'Open tools'}
            testID="preview-tools-toggle"
            onPress={() => setChrome(toggleOpen)}
            style={styles.disc}
          >
            {chrome.open ? <ChevronIcon /> : <Marks marks={held.marks} />}
          </Pressable>
        </View>
      </View>
    </Stage>
  );
}

function GuideOverlay({ frames }: { frames: Frame[] }) {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      {guideMarks(frames).map((mark) => {
        if (mark.kind === 'h') return <View key={`h-${mark.y}`} style={[styles.h, { top: mark.y }]} />;
        if (mark.kind === 'v') {
          return <View key={`v-${mark.x}`} style={[styles.v, { left: mark.x, top: mark.top, height: mark.height }]} />;
        }
        const frame = mark.frame;
        return (
          <View
            key={`b-${frame.x}-${frame.y}-${frame.width}`}
            style={[styles.box, { left: frame.x, top: frame.y, width: frame.width, height: frame.height }]}
          />
        );
      })}
    </View>
  );
}

function Marks({ marks }: { marks: readonly Mark[] }) {
  return (
    <Svg width={18} height={30} viewBox="0 0 24 40">
      {marks.map((mark, index) => {
        if (mark.t === 'r') {
          return (
            <Rect
              key={index}
              x={mark.x}
              y={mark.y}
              width={mark.w}
              height={mark.h}
              rx={mark.rx ?? 0}
              fill={mark.fill ?? 'none'}
              stroke={mark.stroke}
              strokeWidth={mark.sw}
            />
          );
        }
        if (mark.t === 'c') return <Circle key={index} cx={mark.cx} cy={mark.cy} r={mark.r} fill={mark.fill} />;
        return (
          <Path
            key={index}
            d={mark.d}
            fill={mark.fill ?? 'none'}
            stroke={mark.stroke}
            strokeWidth={mark.sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </Svg>
  );
}

function AlignIcon({ on }: { on: boolean }) {
  const color = on ? GUIDE : '#17181c';
  return (
    <Svg width={16} height={16} viewBox="0 0 18 18">
      <Rect x={2.5} y={2.5} width={13} height={13} rx={2} stroke={color} strokeWidth={1.4} fill="none" />
      <Rect x={1} y={8.3} width={16} height={1.4} fill={color} />
    </Svg>
  );
}

function NoteIcon({ on }: { on: boolean }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 18 18">
      <Rect x={2} y={2} width={14} height={10} rx={2} fill={on ? '#17181c' : 'none'} stroke="#17181c" strokeWidth={1.4} />
      <Path d="M6 12.2 L9 12.2 L6.6 15.2 Z" fill="#17181c" />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path d="M6 9 L12 15 L18 9" stroke="#17181c" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function notePosition(frame: Frame, fieldWidth: number) {
  const width = 220;
  const limit = fieldWidth > 0 ? fieldWidth : width + 16;
  const left = Math.max(8, Math.min(frame.x + frame.width / 2 - width / 2, limit - width - 8));
  let top = frame.y - 158;
  if (top < 8) top = frame.y + frame.height + 8;
  return { left, top, width };
}

function roundFrame(frame: Frame): Frame {
  return {
    x: Math.round(frame.x),
    y: Math.round(frame.y),
    width: Math.round(frame.width),
    height: Math.round(frame.height),
  };
}

function sameFrame(prev: Frame | null | undefined, next: Frame): boolean {
  return !!prev && prev.x === next.x && prev.y === next.y && prev.width === next.width && prev.height === next.height;
}

const styles = StyleSheet.create({
  field: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 2 },
  hit: { alignItems: 'center', justifyContent: 'center' },
  ctrl: {
    position: 'relative',
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  icon: { width: 32, height: 32 },
  short: { height: 26, paddingHorizontal: 12 },
  pill: { height: 32, paddingHorizontal: 12 },
  send: { width: 32, height: 32, backgroundColor: '#17181c', borderColor: '#17181c' },
  picked: { outlineWidth: 2, outlineColor: '#17181c', outlineStyle: 'solid', outlineOffset: 3 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: '#17181c' },
  sendLabel: { color: '#fff' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#17181c',
    color: '#fff',
    fontFamily: fonts.semibold,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    overflow: 'hidden',
    paddingHorizontal: 3,
  },
  dock: {
    position: 'absolute',
    zIndex: 8,
    bottom: 14,
    alignSelf: 'center',
    width: '96%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
    minHeight: 52,
    maxWidth: '100%',
    flexShrink: 1,
    paddingVertical: 4,
    paddingLeft: 6,
    paddingRight: 6,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    boxShadow: '0 10px 28px rgba(23,24,28,0.16)',
  },
  slots: { flexDirection: 'row', alignItems: 'flex-end', gap: 1, flexShrink: 1 },
  instrument: {
    width: 24,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 8,
    cursor: 'pointer',
  },
  instrumentOn: { backgroundColor: '#ececee' },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 2,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    cursor: 'pointer',
  },
  swatchOn: { outlineWidth: 2, outlineColor: '#17181c', outlineStyle: 'solid', outlineOffset: 2 },
  colorWell: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  tool: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  toolOn: { backgroundColor: '#ececee' },
  disc: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    boxShadow: '0 10px 28px rgba(23,24,28,0.16)',
    cursor: 'pointer',
    flexShrink: 0,
  },
  hoverName: {
    position: 'absolute',
    zIndex: 6,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: '#17181c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoverText: { color: '#fff', fontFamily: fonts.medium, fontSize: 10 },
  note: {
    position: 'absolute',
    zIndex: 7,
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    boxShadow: '0 12px 32px rgba(23,24,28,0.18)',
  },
  noteLabel: { fontFamily: fonts.semibold, fontSize: 13, color: '#17181c' },
  noteSelector: { marginTop: 2, marginBottom: 8, fontFamily: fonts.medium, fontSize: 11, color: '#6c6c6c' },
  noteInput: {
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#17181c',
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  noteActions: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  copyBtn: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  copyText: { fontFamily: fonts.semibold, fontSize: 12, color: '#17181c' },
  addBtn: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17181c',
    cursor: 'pointer',
  },
  addText: { fontFamily: fonts.semibold, fontSize: 12, color: '#fff' },
  overlay: { ...StyleSheet.absoluteFill, zIndex: 4 },
  h: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: GUIDE },
  v: { position: 'absolute', width: 1, backgroundColor: GUIDE },
  box: { position: 'absolute', borderWidth: 1, borderColor: GUIDE },
});
